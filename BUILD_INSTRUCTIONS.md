# APK Build করার নির্দেশনা | APK Build Instructions

## 📱 APK তৈরি করুন (Build APK)

### ধাপ ১: প্রজেক্ট ফোল্ডারে যান
```bash
cd HisabApp
```

### ধাপ ২: APK Build করুন
```bash
npm run buildApk
```

### ধাপ ৩: APK খুঁজুন
Build সফল হলে APK পাবেন এই লোকেশনে:
```
android\app\build\outputs\apk\release\app-release.apk
```

## 📤 APK শেয়ার করুন

1. উপরের ফোল্ডার থেকে `app-release.apk` ফাইলটি কপি করুন
2. যেকোনো জায়গায় শেয়ার করুন (WhatsApp, Email, Google Drive, etc.)
3. যে কেউ এই APK ইনস্টল করতে পারবে তাদের Android ফোনে

## ⚠️ গুরুত্বপূর্ণ নোট

### প্রথমবার ব্যবহারের আগে:
যদি প্রথমবার build করছেন, তাহলে Android SDK এবং JDK ইনস্টল থাকতে হবে।

### Installation Permission:
APK ইনস্টল করার সময় ফোনে "Unknown Sources" থেকে ইনস্টল করার permission দিতে হবে।

### File Size:
APK ফাইলের সাইজ প্রায় 30-50 MB হতে পারে।

---

## 🚀 Build Commands (English)

### Debug APK (for testing)
```bash
npm run buildApk
```

### Production APK (smaller size, optimized)
The current command builds a release APK which is optimized for production.

### Find your APK at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Share & Install:
1. Copy the `app-release.apk` file
2. Share it via any method (WhatsApp, Drive, Email)
3. Install on any Android device (requires "Install from Unknown Sources" permission)

## 🔧 Troubleshooting

### Error: JAVA_HOME not set
```bash
# Set JAVA_HOME environment variable to your JDK installation path
```

### Error: SDK not found
```bash
# Make sure Android SDK is installed and ANDROID_HOME is set
```

### Build takes too long?
First build takes 5-10 minutes. Subsequent builds are faster (1-3 minutes).

---

## 📦 APK লোকেশন | APK Location
```
HisabApp/
└── android/
    └── app/
        └── build/
            └── outputs/
                └── apk/
                    └── release/
                        └── app-release.apk  ← এখানে পাবেন (Your APK is here)
```

