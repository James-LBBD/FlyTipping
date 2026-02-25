# AI-Assisted Fly-Tipping Reporting PoC

A Progressive Web Application (PWA) for AI-assisted fly-tipping incident reporting with intelligent duplicate detection and offline capability.

## Features

- 📸 AI-powered image validation using Azure OpenAI GPT-4 Vision
- 🗺️ Interactive map with LBBD boundary validation
- 🔍 Intelligent duplicate detection using embeddings
- 📝 Auto-filling smart forms with confidence indicators
- 📱 Installable PWA with offline support
- 🔐 Azure Entra ID authentication (passwordless)

## Prerequisites

- Node.js 18+
- Azure OpenAI Service access
- Azure CLI (for local development authentication)

## Setup

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Azure OpenAI:**
   - Copy `.env.example` to `.env.local`
   - Update with your Azure OpenAI endpoint and deployment names

3. **Azure Authentication:**
   - **Local Development:** Run `az login` to authenticate
   - **Production:** Managed Identity will be configured during deployment

4. **Assign Azure RBAC permissions:**

   ```bash
   az role assignment create \
     --assignee <your-email> \
     --role "Cognitive Services OpenAI User" \
     --scope /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<openai-name>
   ```

5. **Add LBBD GeoJSON:**
   - Place the LBBD boundary GeoJSON file in `public/geojson/lbbd-boundary.json`

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```

## Deployment

### Azure App Service (from VS Code)

Deploy directly from VS Code using the Azure App Service extension.

**Azure resources needed:**

- Azure App Service (Linux, Node 20 LTS)
- Azure OpenAI resource with GPT-4 Vision and embedding deployments

**Steps:**

1. In the Azure portal, create a **Linux App Service** with **Node 20 LTS** runtime.
2. Enable **System-Assigned Managed Identity** on the App Service.
3. Grant the Managed Identity the _Cognitive Services OpenAI User_ role on your Azure OpenAI resource.
4. In App Service → Configuration → Application Settings, add:
   ```
   AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
   AZURE_OPENAI_GPT4_VISION_DEPLOYMENT=gpt-4-vision
   AZURE_OPENAI_GPT4_DEPLOYMENT=gpt-4
   AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-large
   ```
5. In App Service → Configuration → General Settings, set the **Startup Command** to:
   ```
   npm run build && npm run start
   ```
6. In VS Code, open the **Azure** sidebar (Shift+Alt+A), right-click your App Service, and select **Deploy to Web App...**
7. Select the project folder when prompted.

## Architecture

- **Framework:** Next.js 15.x with App Router
- **AI Services:** Azure OpenAI (GPT-4 Vision + Embeddings)
- **Authentication:** Microsoft Entra ID (DefaultAzureCredential)
- **Maps:** react-leaflet + OpenStreetMap
- **Storage:** File system (JSON + images)
- **PWA:** Service Worker with offline support

## License

MIT
