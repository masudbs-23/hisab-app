# 🚫 "App blocked to protect your device" - Complete Fix

## 🔴 আপনার Problem:
```
Google Play Protect
"App blocked to protect your device"
Reason: "This app can request access to sensitive data"
```

### কেন Block হচ্ছে?
- ✅ SMS permission (READ_SMS, RECEIVE_SMS) এর কারণে
- ✅ Unsigned APK
- ✅ Unknown developer
- ✅ Not from Play Store

## ✅ Quick Fix (5 Minutes)

### Method 1: Play Protect Disable করুন

#### Step 1: Settings খুলুন
```
Settings → Security (বা Google)
```

#### Step 2: Google Play Protect এ যান
```
Security → Google Play Protect
অথবা
Google → Security → Google Play Protect
```

#### Step 3: Disable করুন
```
⚙️ (Settings icon) top right corner এ click করুন
↓
"Scan apps with Play Protect" - OFF করুন
↓
"Improve harmful app detection" - OFF করুন (optional)
```

#### Step 4: APK Install করুন
```
এখন app-release.apk install করুন
Block হবে না! ✅
```

#### Step 5: Install এর পর (Optional)
```
Play Protect আবার ON করতে পারেন
App ইতিমধ্যে installed আছে তাই problem হবে না
```

---

### Method 2: Developer Options দিয়ে

#### Enable Developer Options:
```
Settings → About Phone → Build Number (7 বার tap)
```

#### Developer Options Settings:
```
Settings → System → Developer Options
↓
Enable করুন:
✅ USB debugging
✅ Install via USB
❌ Verify apps over USB (OFF করুন)
```

#### Install APK:
```
Now install app-release.apk
Warning bypass হয়ে যাবে
```

---

### Method 3: ADB দিয়ে Install (PC থেকে)

#### Prerequisites:
- USB Debugging enabled
- Phone USB cable দিয়ে connect করুন

#### Commands:
```bash
# APK folder এ যান
cd HisabApp/android/app/build/outputs/apk/release

# Install করুন
adb install -r app-release.apk

# Success message দেখাবে
```

---

## 🔐 Permanent Solution: APK Sign করুন

### Step 1: Keystore Generate করুন

```bash
cd HisabApp/android/app

keytool -genkeypair -v -storetype PKCS12 -keystore hisab-release-key.keystore -alias hisab-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### প্রশ্নের উত্তর দিন:
```
Enter keystore password: hisab@2025 (মনে রাখুন!)
Re-enter new password: hisab@2025
What is your first and last name?: Your Name
What is your organizational unit?: Hisab Team
What is your organization?: Hisab
What is your City?: Dhaka
What is your State?: Dhaka
What is the country code?: BD
Is this correct?: yes
```

### Step 2: gradle.properties Update করুন

Create: `HisabApp/android/gradle.properties`

Add these lines:
```properties
HISAB_UPLOAD_STORE_FILE=hisab-release-key.keystore
HISAB_UPLOAD_KEY_ALIAS=hisab-key-alias
HISAB_UPLOAD_STORE_PASSWORD=hisab@2025
HISAB_UPLOAD_KEY_PASSWORD=hisab@2025
```

### Step 3: build.gradle Update করুন

Edit: `HisabApp/android/app/build.gradle`

Before `android {` add:
```gradle
def keystorePropertiesFile = rootProject.file("../gradle.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android { ... }` add:
```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            storeFile file(keystoreProperties['HISAB_UPLOAD_STORE_FILE'])
            storePassword keystoreProperties['HISAB_UPLOAD_STORE_PASSWORD']
            keyAlias keystoreProperties['HISAB_UPLOAD_KEY_ALIAS']
            keyPassword keystoreProperties['HISAB_UPLOAD_KEY_PASSWORD']
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Step 4: Build Signed APK

```bash
cd HisabApp/android
.\gradlew clean
.\gradlew assembleRelease
```

Signed APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 Alternative: Build APK Bundle (AAB)

Google Play Store এ upload করতে চাইলে:

```bash
cd HisabApp/android
.\gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## ⚠️ Important Notes

### SMS Permission Justification:

Google Play Store এ upload করলে explanation দিতে হবে:

```
Permission: READ_SMS, RECEIVE_SMS

Use Case: 
This app automatically reads bank transaction SMS messages 
from bKash, City Bank, and other financial institutions to 
track user's income and expenses. SMS data is stored locally 
on the device only and is never shared with any third party.

Privacy Policy: 
https://yourwebsite.com/privacy-policy (create this)
```

### Privacy Policy Required:

Create এবং link করতে হবে if Play Store এ upload করবেন।

---

## 🎯 Recommended Approach

### For Testing/Friends (Now):
```
1. Play Protect disable করুন (Method 1)
2. APK install করুন
3. Test করুন
4. Play Protect enable করুন (optional)
```

### For Distribution (Later):
```
1. Keystore generate করুন
2. Signed APK build করুন
3. Share করুন
4. Users কে Play Protect disable করতে বলুন (one time)
```

### For Production (Future):
```
1. Proper keystore দিয়ে sign করুন
2. Privacy Policy তৈরি করুন
3. Play Console account ($25)
4. AAB upload করুন
5. Submit for review
```

---

## 🆘 Still Not Working?

### Try This:
```bash
# Completely uninstall old app
adb uninstall com.hisabapp

# Clear Play Protect cache
Settings → Apps → Google Play Services → Storage → Clear Cache

# Restart phone

# Disable Play Protect

# Install again
```

---

## 📞 Quick Commands

### Disable Play Protect (ADB):
```bash
adb shell settings put global package_verifier_enable 0
```

### Enable Play Protect (ADB):
```bash
adb shell settings put global package_verifier_enable 1
```

### Install APK (Force):
```bash
adb install -r -d app-release.apk
```
`-r` = reinstall
`-d` = allow version downgrade

---

## ✅ Summary

**Right Now (Immediate):**
```
Settings → Google Play Protect → Settings → Turn OFF
↓
Install app-release.apk
↓
✅ Works!
```

**Later (Professional):**
```
Generate Keystore → Sign APK → Distribute
```

**Future (Production):**
```
Upload to Play Store (no warnings)
```

---

**Remember:** 
- SMS permission = Play Protect এর main concern
- Unsigned APK = Extra suspicion
- Solution = Sign করুন অথবা Play Protect disable করুন

🎉 **Your app is safe! Just Play Protect doesn't know that!**

