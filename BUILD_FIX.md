# 🔧 APK Build Fix Guide

## Current Build Error:
```
Task :app:mergeReleaseJavaResource FAILED
Failed to create MD5 hash for file (cache corrupted)
```

## Solution 1: Clean Build (Recommended)

### Windows PowerShell:
```powershell
# Navigate to project
cd C:\native\Hisab\HisabApp

# Clean Android build
cd android
.\gradlew clean
cd ..

# Delete build folders
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force android\build

# Build APK
npm run buildApk
```

## Solution 2: Increase Gradle Memory

Create/Edit: `HisabApp/android/gradle.properties`

Add these lines:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

## Solution 3: Stop Gradle Daemon & Rebuild

```powershell
cd C:\native\Hisab\HisabApp\android
.\gradlew --stop
.\gradlew clean
cd ..
npm run buildApk
```

## Complete Clean Build Steps:

### Step 1: Stop all Metro/Gradle processes
```powershell
# Stop Metro bundler (if running)
# Press Ctrl+C in Metro terminal

# Stop Gradle daemon
cd android
.\gradlew --stop
cd ..
```

### Step 2: Clean everything
```powershell
# Clean Gradle
cd android
.\gradlew clean
cd ..

# Clean npm cache (optional)
npm cache clean --force

# Delete build folders
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

### Step 3: Rebuild
```powershell
# Build APK
npm run buildApk
```

## Solution 4: If Still Fails - Debug Build

```powershell
# Try debug APK first (faster)
cd android
.\gradlew assembleDebug
cd ..
```

Debug APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

## Quick Fix Commands (Copy-Paste):

```powershell
# Complete clean and rebuild
cd C:\native\Hisab\HisabApp
cd android
.\gradlew --stop
.\gradlew clean
cd ..
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\build -ErrorAction SilentlyContinue
npm run buildApk
```

## Development Mode (Instead of APK):

```powershell
# Terminal 1: Start Metro
npm start

# Terminal 2: Run on device/emulator
npx react-native run-android
```

## Expected Build Time:
- Clean Build: 5-10 minutes
- Incremental Build: 2-3 minutes

## Success Message:
```
BUILD SUCCESSFUL in Xm Ys
APK created at: android\app\build\outputs\apk\release\app-release.apk
```

## If Build Succeeds:
APK will be at: `C:\native\Hisab\HisabApp\android\app\build\outputs\apk\release\app-release.apk`

You can:
1. Copy to phone
2. Install directly
3. Share with others

## Notes:
- The JVM Metaspace warning is normal
- Build may take 5-10 minutes first time
- Make sure no antivirus is blocking gradle

