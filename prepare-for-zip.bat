@echo off
echo ====================================
echo SmartDine - ZIP Preparation Script
echo ====================================
echo.
echo This script will prepare your project for sharing via ZIP
echo.
pause

echo.
echo Step 1: Cleaning node_modules...
if exist "server\node_modules" (
    echo Removing server\node_modules...
    rmdir /s /q server\node_modules
)
if exist "client\node_modules" (
    echo Removing client\node_modules...
    rmdir /s /q client\node_modules
)

echo.
echo Step 2: Backing up your .env files...
if exist "server\.env" (
    echo Backing up server\.env to server\.env.backup...
    copy server\.env server\.env.backup
)
if exist ".env" (
    echo Backing up .env to .env.backup...
    copy .env .env.backup
)

echo.
echo Step 3: Removing sensitive .env files...
if exist "server\.env" (
    echo Removing server\.env...
    del server\.env
)
if exist ".env" (
    echo Removing .env...
    del .env
)

echo.
echo ====================================
echo ✅ Project is ready to ZIP!
echo ====================================
echo.
echo What to do now:
echo 1. Right-click the 'smartdine' folder
echo 2. Select "Send to" ^> "Compressed (zipped) folder"
echo 3. Share the ZIP file
echo.
echo Your .env files have been backed up:
echo - server\.env.backup
echo - .env.backup
echo.
echo After creating the ZIP, you can restore them:
echo   copy server\.env.backup server\.env
echo   copy .env.backup .env
echo.
pause
