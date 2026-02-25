@echo off
echo ================================================
echo   Final Project Check
echo ================================================
echo.

cd /d "%~dp0"

set "ERRORS=0"
set "WARNINGS=0"

echo Checking project structure...
echo.

REM Check critical files
echo [Core Files]
if exist package.json (echo   [OK] package.json) else (echo   [ERROR] package.json missing & set /a ERRORS+=1)
if exist tsconfig.json (echo   [OK] tsconfig.json) else (echo   [ERROR] tsconfig.json missing & set /a ERRORS+=1)
if exist next.config.ts (echo   [OK] next.config.ts) else (echo   [ERROR] next.config.ts missing & set /a ERRORS+=1)
if exist .env.local (echo   [OK] .env.local) else (echo   [WARN] .env.local missing - copy from .env.example & set /a WARNINGS+=1)

echo.
echo [Directories]
if exist app (echo   [OK] app/) else (echo   [ERROR] app/ missing & set /a ERRORS+=1)
if exist components (echo   [OK] components/) else (echo   [ERROR] components/ missing & set /a ERRORS+=1)
if exist lib (echo   [OK] lib/) else (echo   [ERROR] lib/ missing & set /a ERRORS+=1)
if exist public (echo   [OK] public/) else (echo   [ERROR] public/ missing & set /a ERRORS+=1)

echo.
echo [App Pages]
if exist app\page.tsx (echo   [OK] app/page.tsx) else (echo   [ERROR] app/page.tsx missing & set /a ERRORS+=1)
if exist app\layout.tsx (echo   [OK] app/layout.tsx) else (echo   [ERROR] app/layout.tsx missing & set /a ERRORS+=1)
if exist app\report\page.tsx (echo   [OK] app/report/page.tsx) else (echo   [ERROR] app/report/page.tsx missing & set /a ERRORS+=1)

echo.
echo [API Routes]
if exist app\api\validate-image\route.ts (echo   [OK] validate-image API) else (echo   [ERROR] validate-image API missing & set /a ERRORS+=1)
if exist app\api\extract-fields\route.ts (echo   [OK] extract-fields API) else (echo   [ERROR] extract-fields API missing & set /a ERRORS+=1)
if exist app\api\submit-report\route.ts (echo   [OK] submit-report API) else (echo   [ERROR] submit-report API missing & set /a ERRORS+=1)

echo.
echo [Components]
if exist components\ImageUpload.tsx (echo   [OK] ImageUpload) else (echo   [ERROR] ImageUpload missing & set /a ERRORS+=1)
if exist components\SmartForm.tsx (echo   [OK] SmartForm) else (echo   [ERROR] SmartForm missing & set /a ERRORS+=1)
if exist components\ValidationFeedback.tsx (echo   [OK] ValidationFeedback) else (echo   [ERROR] ValidationFeedback missing & set /a ERRORS+=1)

echo.
echo [Libraries]
if exist lib\azure-openai.ts (echo   [OK] azure-openai) else (echo   [ERROR] azure-openai missing & set /a ERRORS+=1)
if exist lib\storage.ts (echo   [OK] storage) else (echo   [ERROR] storage missing & set /a ERRORS+=1)
if exist lib\similarity.ts (echo   [OK] similarity) else (echo   [ERROR] similarity missing & set /a ERRORS+=1)

echo.
echo [Dependencies]
if exist node_modules (
    echo   [OK] node_modules exists
    if exist node_modules\next (echo   [OK] Next.js installed) else (echo   [ERROR] Next.js not installed & set /a ERRORS+=1)
    if exist node_modules\react (echo   [OK] React installed) else (echo   [ERROR] React not installed & set /a ERRORS+=1)
    if exist node_modules\@azure\identity (echo   [OK] Azure Identity installed) else (echo   [WARN] Azure Identity not installed & set /a WARNINGS+=1)
) else (
    echo   [ERROR] node_modules missing - run setup.bat or install-packages.bat
    set /a ERRORS+=1
)

echo.
echo [Configuration]
if exist .env.local (
    findstr /C:"AZURE_OPENAI_ENDPOINT" .env.local >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] .env.local configured
    ) else (
        echo   [WARN] .env.local needs Azure OpenAI configuration
        set /a WARNINGS+=1
    )
) else (
    echo   [WARN] .env.local not found - copy from .env.example
    set /a WARNINGS+=1
)

if exist public\geojson\lbbd-boundary.json (
    echo   [OK] LBBD GeoJSON exists
) else (
    echo   [WARN] LBBD GeoJSON missing - use sample or add real file
    set /a WARNINGS+=1
)

echo.
echo ================================================
echo   Check Complete
echo ================================================
echo.
echo   Errors: %ERRORS%
echo   Warnings: %WARNINGS%
echo.

if %ERRORS% gtr 0 (
    echo   [!] Project has errors - fix before running
    echo   Run setup.bat to fix structure issues
) else if %WARNINGS% gtr 0 (
    echo   [!] Project has warnings but can run
    echo   Configure .env.local and add GeoJSON for full functionality
) else (
    echo   [√] Project is ready!
    echo   Run: npm run dev
)

echo.
pause
