# Quick Setup Guide

## Automated Setup (Recommended)

Simply run the setup script:

```cmd
setup.bat
```

This will:
- Create all required directories
- Move files to correct locations
- Install npm dependencies
- Create .env.local from template

## Manual Setup

If the script doesn't work, run these commands:

### 1. Create Directories
```cmd
mkdir app\api\validate-image app\api\extract-fields app\api\generate-embedding
mkdir app\api\check-duplicates app\api\submit-report app\api\nearby-reports app\api\validate-location
mkdir app\report app\admin components lib public\geojson public\icons
mkdir reports images embeddings data
```

### 2. Move Files to Correct Locations
```cmd
move lib-*.ts lib\
move public-*.* public\
move app-*.* app\
move api-*-route.ts app\api\
```

Then manually place each API route file in its corresponding directory.

### 3. Install Dependencies
```cmd
npm install
```

### 4. Configure Environment
```cmd
copy .env.example .env.local
```

Edit `.env.local` with your Azure OpenAI details.

### 5. Azure Setup
```cmd
az login
```

Assign permissions (see README.md for full command).

### 6. Add LBBD GeoJSON
Place your boundary file at: `public\geojson\lbbd-boundary.json`

### 7. Run Dev Server
```cmd
npm run dev
```

## Files Created

✅ All core files created
✅ All API routes created
✅ All library utilities created
✅ PWA configuration created
✅ Setup automation script created

Just run `setup.bat` and you're ready to go!
