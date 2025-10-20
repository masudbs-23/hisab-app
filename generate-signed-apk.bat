@echo off
echo ============================================
echo Hisab App - Generate Signed APK
echo ============================================
echo.

cd android\app

echo Checking if keystore exists...
if exist hisab-release-key.keystore (
    echo Keystore found!
) else (
    echo Creating new keystore...
    echo.
    echo Please answer the following questions:
    echo.
    keytool -genkeypair -v -storetype PKCS12 -keystore hisab-release-key.keystore -alias hisab-key-alias -keyalg RSA -keysize 2048 -validity 10000
    echo.
    echo Keystore created successfully!
)

cd ..\..

echo.
echo Building signed APK...
cd android
call gradlew clean
call gradlew assembleRelease
cd ..

echo.
echo ============================================
echo Build Complete!
echo ============================================
echo.
echo Signed APK location:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo You can now install this APK on your phone.
echo If Play Protect blocks it, follow these steps:
echo.
echo 1. Go to Settings
echo 2. Search "Play Protect"
echo 3. Open Play Protect settings
echo 4. Turn OFF "Scan apps with Play Protect"
echo 5. Install the APK
echo.
pause

