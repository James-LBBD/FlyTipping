@echo off
echo ================================================
echo   TypeScript Compilation Check
echo ================================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo ERROR: node_modules not found!
    echo Run setup.bat or install-packages.bat first
    pause
    exit /b 1
)

echo Checking TypeScript compilation...
echo.

call npx tsc --noEmit --skipLibCheck

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo   SUCCESS! No TypeScript errors found
    echo ================================================
    echo.
    echo   Your project compiles correctly!
    echo   Ready to run: npm run dev
    echo.
) else (
    echo.
    echo ================================================
    echo   TypeScript compilation failed
    echo ================================================
    echo.
    echo   Fix the errors above before running npm run dev
    echo.
)

pause
