# 🚀 Quick Start Guide - AI Fly-Tipping PoC

## Installation Fixed! ✅

The React 19 compatibility issue with react-leaflet has been fixed by downgrading to React 18.3.1.

## Step-by-Step Setup

### 1. Install Packages

**Option A: Automated Setup (Recommended)**
```cmd
setup.bat
```
This will create directories, move files, and install with `--legacy-peer-deps` automatically.

**Option B: Manual Install**
```cmd
npm install --legacy-peer-deps
```

**Option C: Multiple Install Methods**
```cmd
install-packages.bat
```
Tries multiple installation methods automatically.

### 2. Configure Azure OpenAI

Edit `.env.local`:
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_GPT4_VISION_DEPLOYMENT=gpt-4-vision
AZURE_OPENAI_GPT4_DEPLOYMENT=gpt-4
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-large
```

### 3. Azure Authentication

```cmd
az login
```

### 4. Assign RBAC Permissions

```cmd
az role assignment create ^
  --assignee YOUR_EMAIL ^
  --role "Cognitive Services OpenAI User" ^
  --scope /subscriptions/SUB_ID/resourceGroups/RG/providers/Microsoft.CognitiveServices/accounts/OPENAI_NAME
```

### 5. Add LBBD GeoJSON (Optional for Testing)

**For testing, use the sample:**
```cmd
cd public\geojson
copy lbbd-boundary-sample.json lbbd-boundary.json
```

**For production, replace with real LBBD boundary file**

### 6. Verify Setup

```cmd
check-project.bat
```

### 7. Start Development Server

```cmd
npm run dev
```

### 8. Open Browser

Navigate to: **http://localhost:3000**

## What Was Fixed

✅ React 18.3.1 (compatible with react-leaflet)  
✅ Added `.npmrc` with legacy-peer-deps  
✅ All import paths corrected  
✅ Setup script uses `--legacy-peer-deps`  
✅ Alternative installation methods provided  
✅ Sample GeoJSON boundary included  
✅ Project verification script added  

## Project Structure

```
AI-FlyTipping-POC/
├── app/                    # Next.js app directory
│   ├── api/               # 7 API routes
│   ├── report/           # Report submission page
│   ├── admin/            # Admin dashboard
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # 6 React components
├── lib/                   # Core utilities
│   ├── azure-openai.ts   # Azure OpenAI client
│   ├── storage.ts        # JSON storage
│   ├── similarity.ts     # Duplicate detection
│   └── geojson.ts        # Location validation
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service worker
│   └── geojson/         # LBBD boundary
├── types.ts              # TypeScript definitions
└── setup.bat            # Automated setup
```

## Troubleshooting

### Still Getting Errors?

1. **Clear everything and retry:**
   ```cmd
   rmdir /s /q node_modules
   del package-lock.json
   npm install --legacy-peer-deps
   ```

2. **Use Yarn instead:**
   ```cmd
   npm install -g yarn
   yarn install
   ```

3. **Check Node version:**
   ```cmd
   node --version
   ```
   Should be 18+ or 20+

4. **See detailed troubleshooting:**
   `TROUBLESHOOTING.md`

## Features Implemented

✅ Image upload with camera support  
✅ AI validation (GPT-4 Vision)  
✅ AI field extraction  
✅ Smart auto-filling form  
✅ Confidence indicators  
✅ Duplicate detection  
✅ Location validation  
✅ PWA configuration  
✅ Offline support ready  
✅ Azure Entra ID authentication  

## Next Steps After Setup

1. Test image upload flow
2. Verify Azure OpenAI connectivity
3. Test duplicate detection
4. Review AI confidence scores
5. Customize for LBBD branding
6. Add real LBBD GeoJSON boundary
7. Deploy to Azure App Service

## Support Files

- `setup.bat` - Full automated setup
- `install-packages.bat` - Multiple install methods
- `check-project.bat` - Verify project structure
- `TROUBLESHOOTING.md` - Detailed troubleshooting
- `START_HERE.txt` - Quick reference

## Ready to Go! 🎉

Run `setup.bat` and you're ready to start developing!
