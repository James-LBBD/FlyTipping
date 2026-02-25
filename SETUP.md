# Setup Instructions

## Initial Setup

Since PowerShell 7+ is not available, please run these commands manually:

### 1. Install Dependencies
```bash
cd C:\CEXD\Fedex\AI-FlyTipping-POC
npm install
```

### 2. Create Required Directories
```bash
mkdir app
mkdir app\api
mkdir components
mkdir lib
mkdir types
mkdir public
mkdir public\geojson
mkdir public\icons
mkdir reports
mkdir images
mkdir embeddings
mkdir data
```

### 3. Copy Environment Configuration
```bash
copy .env.example .env.local
```

### 4. Update .env.local
Edit `.env.local` with your Azure OpenAI details:
- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_GPT4_VISION_DEPLOYMENT
- AZURE_OPENAI_GPT4_DEPLOYMENT
- AZURE_OPENAI_EMBEDDING_DEPLOYMENT

### 5. Azure Authentication
Login with Azure CLI:
```bash
az login
```

### 6. Assign RBAC Permissions
```bash
az role assignment create --assignee <your-email> --role "Cognitive Services OpenAI User" --scope /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<openai-name>
```

### 7. Add LBBD GeoJSON
Place your LBBD boundary GeoJSON file at:
```
public\geojson\lbbd-boundary.json
```

### 8. Run Development Server
```bash
npm run dev
```

## Next Steps
After running the setup, the AI agent will continue creating:
- TypeScript type definitions
- API routes for Azure OpenAI
- React components
- PWA configuration
- Service worker
