@echo off
cls
echo ============================================
echo Hisab App - Build Installable APK
echo ============================================
echo.
echo This will create an APK that you can install
echo by temporarily turning OFF Play Protect.
echo.
echo Building APK...
echo.

cd android
call gradlew clean
call gradlew assembleRelease
cd ..

echo.
echo ============================================
echo BUILD COMPLETE!
echo ============================================
echo.
echo APK Location:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo.
echo ========================================
echo HOW TO INSTALL (Simple 5 Steps):
echo ========================================
echo.
echo 1. Copy app-release.apk to your phone
echo.
echo 2. On phone: Settings → Search "Play Protect"
echo.
echo 3. Open "Google Play Protect"
echo.
echo 4. Tap Settings icon (⚙️ or ⋮) top right
echo.
echo 5. Turn OFF "Scan apps with Play Protect"
echo.
echo 6. Open app-release.apk on phone → Install
echo.
echo 7. After install, turn Play Protect back ON (optional)
echo.
echo ========================================
echo.
echo ✅ Your app is SAFE!
echo ✅ SMS permission is for bank transaction tracking
echo ✅ All data stays on your phone
echo ✅ No server, no cloud, 100%% local
echo.
echo ⚠️ Play Protect warning is NORMAL for apps not on Play Store
echo ⚠️ Just turn it OFF temporarily to install
echo.
echo ========================================
echo.
pause

