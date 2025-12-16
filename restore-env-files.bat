@echo off
echo ====================================
echo SmartDine - Restore Your .env Files
echo ====================================
echo.

if exist "server\.env.backup" (
    echo Restoring server\.env...
    copy server\.env.backup server\.env
    echo ✅ server\.env restored
) else (
    echo ⚠️  No server\.env.backup found
)

if exist ".env.backup" (
    echo Restoring .env...
    copy .env.backup .env
    echo ✅ .env restored
) else (
    echo ⚠️  No .env.backup found
)

echo.
echo ====================================
echo Done!
echo ====================================
pause
