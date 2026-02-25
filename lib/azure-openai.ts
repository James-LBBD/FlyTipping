// Azure OpenAI client with Entra ID authentication
import {
  DefaultAzureCredential,
  getBearerTokenProvider
} from '@azure/identity';
import { AzureOpenAI } from 'openai';
import type { ValidationResult, FieldExtractionResult } from '@/types';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const gpt4VisionDeployment = process.env.AZURE_OPENAI_GPT4_VISION_DEPLOYMENT!;
const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!;

// Use DefaultAzureCredential for passwordless authentication
const credential = new DefaultAzureCredential();
const azureADTokenProvider = getBearerTokenProvider(
  credential,
  'https://cognitiveservices.azure.com/.default'
);

function getClient(deployment: string): AzureOpenAI {
  // Create a new client per deployment since AzureOpenAI binds deployment at construction
  return new AzureOpenAI({
    azureADTokenProvider,
    endpoint,
    deployment,
    apiVersion: '2024-12-01-preview'
  });
}

/** Strip markdown code fences and extract raw JSON from GPT responses */
function extractJSON(raw: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Try to find JSON object/array directly
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];
  return raw.trim();
}

export async function validateImage(
  imageBase64: string
): Promise<ValidationResult> {
  const openai = getClient(gpt4VisionDeployment);

  const prompt = `Analyze this image and determine:
1. Is this image safe (not containing explicit, violent, or harmful content)?
2. Does this image contain evidence of fly-tipping (illegal dumping of waste)?
3. How confident are you in your assessment (0-1)?

Respond in JSON format only, no markdown:
{
  "isSafe": boolean,
  "containsFlyTipping": boolean,
  "confidence": number,
  "reason": "brief explanation",
  "suggestedAction": "accept" | "reject" | "manual-review"
}`;

  try {
    const result = await openai.chat.completions.create({
      model: gpt4VisionDeployment,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const content = result.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(extractJSON(content));

    return {
      isValid: parsed.isSafe && parsed.containsFlyTipping,
      isSafe: parsed.isSafe,
      containsFlyTipping: parsed.containsFlyTipping,
      confidence: parsed.confidence,
      reason: parsed.reason,
      suggestedAction: parsed.suggestedAction
    };
  } catch (error) {
    console.error('Image validation failed:', error);
    throw new Error('Failed to validate image with AI');
  }
}

export async function extractFields(
  imageBase64: string
): Promise<FieldExtractionResult> {
  const openai = getClient(gpt4VisionDeployment);

  const prompt = `Analyze this fly-tipping image and extract the following information.

Choose EXACTLY from these values:

Waste Type (pick one):
  furniture_general, business_construction, hazardous, household, garden, electrical, tyres, other

Waste Size (pick one):
  single_black_bag, other_single_item, car_boot_load, small_van_load, transit_van_load, tipper_lorry_load, significant_multiple_loads

Also provide:
- hazardous: true/false
- description: 2-3 sentence description
- severityRating: 1-10 (1=minor litter, 10=major hazard)
- summary: one sentence for council staff
- confidence scores 0-1 for wasteType, wasteSize, hazardous, description, overall

Respond in JSON only, no markdown:
{
  "wasteType": string,
  "wasteSize": string,
  "hazardous": boolean,
  "description": string,
  "severityRating": number,
  "summary": string,
  "confidence": {
    "wasteType": number,
    "wasteSize": number,
    "hazardous": number,
    "description": number,
    "overall": number
  }
}`;

  try {
    const result = await openai.chat.completions.create({
      model: gpt4VisionDeployment,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const content = result.choices[0]?.message?.content || '{}';
    return JSON.parse(extractJSON(content));
  } catch (error) {
    console.error('Field extraction failed:', error);
    throw new Error('Failed to extract fields from image');
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getClient(embeddingDeployment);

  try {
    const result = await openai.embeddings.create({
      model: embeddingDeployment,
      input: text
    });
    return result.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateImageEmbedding(
  imageBase64: string,
  extractedText: string
): Promise<number[]> {
  // Combine visual understanding with extracted text for better semantic embedding
  const combinedText = `Fly-tipping incident: ${extractedText}`;
  return generateEmbedding(combinedText);
}
