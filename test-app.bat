@echo off
echo ================================================
echo   Final Application Test
echo ================================================
echo.

cd /d "%~dp0"

echo [1/6] Checking TypeScript compilation...
call npx tsc --noEmit --skipLibCheck >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] TypeScript compiles without errors
) else (
    echo    [FAIL] TypeScript has errors
    echo    Run: npx tsc --noEmit --skipLibCheck
)

echo.
echo [2/6] Checking critical files...
set "MISSING=0"
if not exist app\layout.tsx (echo    [MISS] app\layout.tsx & set /a MISSING+=1) else (echo    [OK] app\layout.tsx)
if not exist app\page.tsx (echo    [MISS] app\page.tsx & set /a MISSING+=1) else (echo    [OK] app\page.tsx)
if not exist app\report\page.tsx (echo    [MISS] app\report\page.tsx & set /a MISSING+=1) else (echo    [OK] app\report\page.tsx)
if not exist app\confirmation\page.tsx (echo    [MISS] app\confirmation\page.tsx & set /a MISSING+=1) else (echo    [OK] app\confirmation\page.tsx)

echo.
echo [3/6] Checking API routes...
if not exist app\api\validate-image\route.ts (echo    [MISS] validate-image & set /a MISSING+=1) else (echo    [OK] validate-image)
if not exist app\api\extract-fields\route.ts (echo    [MISS] extract-fields & set /a MISSING+=1) else (echo    [OK] extract-fields)
if not exist app\api\submit-report\route.ts (echo    [MISS] submit-report & set /a MISSING+=1) else (echo    [OK] submit-report)

echo.
echo [4/6] Checking components...
if not exist components\ImageUpload.tsx (echo    [MISS] ImageUpload & set /a MISSING+=1) else (echo    [OK] ImageUpload)
if not exist components\SmartForm.tsx (echo    [MISS] SmartForm & set /a MISSING+=1) else (echo    [OK] SmartForm)
if not exist components\ValidationFeedback.tsx (echo    [MISS] ValidationFeedback & set /a MISSING+=1) else (echo    [OK] ValidationFeedback)

echo.
echo [5/6] Checking libraries...
if not exist lib\azure-openai.ts (echo    [MISS] azure-openai & set /a MISSING+=1) else (echo    [OK] azure-openai)
if not exist lib\storage.ts (echo    [MISS] storage & set /a MISSING+=1) else (echo    [OK] storage)
if not exist lib\similarity.ts (echo    [MISS] similarity & set /a MISSING+=1) else (echo    [OK] similarity)
if not exist lib\geojson.ts (echo    [MISS] geojson & set /a MISSING+=1) else (echo    [OK] geojson)

echo.
echo [6/6] Checking configuration...
if exist .env.local (
    findstr "AZURE_OPENAI_ENDPOINT" .env.local >nul 2>&1
    if %errorlevel% equ 0 (
        echo    [OK] .env.local configured
    ) else (
        echo    [WARN] .env.local exists but needs Azure config
    )
) else (
    echo    [WARN] .env.local not found
)

if exist node_modules\next (
    echo    [OK] Dependencies installed
) else (
    echo    [FAIL] Dependencies not installed - run setup.bat
)

echo.
echo ================================================
echo   Test Summary
echo ================================================
if %MISSING% equ 0 (
    echo   [SUCCESS] All files present!
    echo.
    echo   Ready to run:
    echo     npm run dev
    echo.
    echo   Then open: http://localhost:3000
) else (
    echo   [FAIL] %MISSING% files missing
    echo   Run setup.bat to fix
)
echo.
pause
