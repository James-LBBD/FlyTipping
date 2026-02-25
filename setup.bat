@echo off
echo ================================================
echo   AI Fly-Tipping PoC - Setup Script
echo ================================================
echo.

cd /d "%~dp0"

echo [1/8] Creating directory structure...
mkdir app 2>nul
mkdir app\api 2>nul
mkdir app\api\validate-image 2>nul
mkdir app\api\extract-fields 2>nul
mkdir app\api\generate-embedding 2>nul
mkdir app\api\check-duplicates 2>nul
mkdir app\api\submit-report 2>nul
mkdir app\api\nearby-reports 2>nul
mkdir app\api\validate-location 2>nul
mkdir app\report 2>nul
mkdir app\admin 2>nul
mkdir components 2>nul
mkdir lib 2>nul
mkdir types 2>nul
mkdir public 2>nul
mkdir public\geojson 2>nul
mkdir public\icons 2>nul
mkdir reports 2>nul
mkdir images 2>nul
mkdir embeddings 2>nul
mkdir data 2>nul
echo    Done!

echo.
echo [2/8] Moving library files...
if exist lib-azure-openai.ts move lib-azure-openai.ts lib\azure-openai.ts
if exist lib-storage.ts move lib-storage.ts lib\storage.ts
if exist lib-similarity.ts move lib-similarity.ts lib\similarity.ts
if exist lib-geojson.ts move lib-geojson.ts lib\geojson.ts
echo    Done!

echo.
echo [3/8] Moving public files...
if exist public-manifest.json move public-manifest.json public\manifest.json
if exist public-sw.js move public-sw.js public\sw.js
echo    Done!

echo.
echo [4/8] Moving app files...
if exist app-layout.tsx move app-layout.tsx app\layout.tsx
if exist app-page.tsx move app-page.tsx app\page.tsx
if exist app-globals.css move app-globals.css app\globals.css
echo    Done!

echo.
echo [5/8] Moving API route files...
if exist api-validate-image-route.ts move api-validate-image-route.ts app\api\validate-image\route.ts
if exist api-extract-fields-route.ts move api-extract-fields-route.ts app\api\extract-fields\route.ts
if exist api-generate-embedding-route.ts move api-generate-embedding-route.ts app\api\generate-embedding\route.ts
if exist api-check-duplicates-route.ts move api-check-duplicates-route.ts app\api\check-duplicates\route.ts
if exist api-submit-report-route.ts move api-submit-report-route.ts app\api\submit-report\route.ts
if exist api-nearby-reports-route.ts move api-nearby-reports-route.ts app\api\nearby-reports\route.ts
if exist api-validate-location-route.ts move api-validate-location-route.ts app\api\validate-location\route.ts
echo    Done!

echo.
echo [6/8] Creating .env.local from example...
if not exist .env.local (
    copy .env.example .env.local
    echo    Created .env.local - PLEASE EDIT THIS FILE with your Azure OpenAI settings!
) else (
    echo    .env.local already exists, skipping...
)

echo.
echo [7/8] Moving component files...
if exist components-ImageUpload.tsx move components-ImageUpload.tsx components\ImageUpload.tsx
if exist components-ValidationFeedback.tsx move components-ValidationFeedback.tsx components\ValidationFeedback.tsx
if exist components-ConfidenceIndicator.tsx move components-ConfidenceIndicator.tsx components\ConfidenceIndicator.tsx
if exist components-DuplicateWarning.tsx move components-DuplicateWarning.tsx components\DuplicateWarning.tsx
if exist components-OfflineIndicator.tsx move components-OfflineIndicator.tsx components\OfflineIndicator.tsx
if exist components-SmartForm.tsx move components-SmartForm.tsx components\SmartForm.tsx
if exist app-report-page.tsx move app-report-page.tsx app\report\page.tsx
if exist app-admin-page.tsx move app-admin-page.tsx app\admin\page.tsx
if exist app-offline-page.tsx move app-offline-page.tsx app\offline\page.tsx
echo    Done!

echo.
echo [8/8] Installing npm dependencies...
echo    This may take a few minutes...
echo    If this fails, run install-packages.bat for alternative methods
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo    Standard install failed. Trying with --force...
    call npm install --force
    if %errorlevel% neq 0 (
        echo.
        echo    ERROR: npm install failed!
        echo.
        echo    Quick fixes:
        echo    1. Run install-packages.bat for alternative installation methods
        echo    2. Or manually: npm install --legacy-peer-deps
        echo    3. See TROUBLESHOOTING.md for more solutions
        echo.
        pause
        exit /b 1
    )
)
echo    Done!

echo.
echo [9/9] Setup complete!
echo.
echo ================================================
echo   NEXT STEPS:
echo ================================================
echo.
echo 1. Edit .env.local with your Azure OpenAI details:
echo    - AZURE_OPENAI_ENDPOINT
echo    - AZURE_OPENAI_GPT4_VISION_DEPLOYMENT
echo    - AZURE_OPENAI_GPT4_DEPLOYMENT
echo    - AZURE_OPENAI_EMBEDDING_DEPLOYMENT
echo.
echo 2. Login to Azure CLI:
echo    az login
echo.
echo 3. Assign RBAC permissions (see README.md)
echo.
echo 4. Add LBBD GeoJSON file to:
echo    public\geojson\lbbd-boundary.json
echo.
echo 5. Run development server:
echo    npm run dev
echo.
echo ================================================
echo.
pause
