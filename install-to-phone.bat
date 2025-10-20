@echo off
echo ============================================
echo Hisab App - Install to Phone via ADB
echo ============================================
echo.

echo Please make sure:
echo 1. USB Debugging is enabled on your phone
echo 2. Phone is connected via USB cable
echo 3. You have authorized this computer on your phone
echo.
pause

echo Checking if ADB is available...
adb version >nul 2>&1
if errorlevel 1 (
    echo ERROR: ADB not found!
    echo.
    echo Please install Android SDK Platform Tools:
    echo https://developer.android.com/studio/releases/platform-tools
    echo.
    pause
    exit /b 1
)

echo.
echo Checking connected devices...
adb devices

echo.
echo Installing APK...
adb install -r android\app\build\outputs\apk\release\app-release.apk

echo.
echo ============================================
if errorlevel 0 (
    echo Installation Successful! ✓
    echo.
    echo You can now open the Hisab app on your phone.
) else (
    echo Installation Failed!
    echo.
    echo Try these solutions:
    echo 1. Make sure USB debugging is enabled
    echo 2. Check if phone is properly connected
    echo 3. Authorize this computer on your phone
    echo 4. Disable Play Protect and install manually
)
echo ============================================
echo.
pause

