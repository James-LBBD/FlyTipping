@echo off
echo ================================================
echo   Verification and Alternative Installation
echo ================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ERROR: Node.js not found!
    echo    Install from: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo    OK!

echo.
echo [2/3] Checking if node_modules exists...
if exist node_modules (
    echo    node_modules found - packages are installed
    goto check_next
) else (
    echo    node_modules NOT found - trying installation methods...
    goto install_packages
)

:install_packages
echo.
echo === Method 1: Standard npm install ===
call npm install
if %errorlevel% equ 0 (
    echo    Success!
    goto check_next
)

echo.
echo === Method 2: npm install with legacy peer deps ===
call npm install --legacy-peer-deps
if %errorlevel% equ 0 (
    echo    Success!
    goto check_next
)

echo.
echo === Method 3: npm install with force ===
call npm install --force
if %errorlevel% equ 0 (
    echo    Success!
    goto check_next
)

echo.
echo === Method 4: Using Yarn (if available) ===
yarn --version >nul 2>&1
if %errorlevel% equ 0 (
    call yarn install
    if %errorlevel% equ 0 (
        echo    Success with Yarn!
        goto check_next
    )
)

echo.
echo === Method 5: Minimal installation ===
echo Installing core packages only...
call npm install next@15.1.4 react@18.3.1 react-dom@18.3.1 typescript@5.7.2 --save
call npm install @azure/identity@4.5.0 --save
call npm install tailwindcss@3.4.17 postcss@8.4.49 autoprefixer@10.4.20 --save-dev
if %errorlevel% equ 0 (
    echo    Core packages installed!
    echo    Run 'npm install' again later to get remaining packages
    goto check_next
)

echo.
echo ERROR: All installation methods failed!
echo.
echo Please:
echo 1. Check your internet connection
echo 2. Clear npm cache: npm cache clean --force
echo 3. Check Node.js version (need 18+)
echo 4. See TROUBLESHOOTING.md
pause
exit /b 1

:check_next
echo.
echo [3/3] Verifying installation...
if exist node_modules\next (
    echo    Next.js: OK
) else (
    echo    Next.js: MISSING
)

if exist node_modules\react (
    echo    React: OK
) else (
    echo    React: MISSING
)

if exist node_modules\@azure\identity (
    echo    Azure Identity: OK
) else (
    echo    Azure Identity: MISSING
)

if exist node_modules\typescript (
    echo    TypeScript: OK
) else (
    echo    TypeScript: MISSING
)

echo.
echo ================================================
echo   Verification Complete!
echo ================================================
echo.
echo If all packages show OK, you can now:
echo   1. Configure .env.local
echo   2. Add LBBD GeoJSON to public\geojson\
echo   3. Run: npm run dev
echo.
pause
