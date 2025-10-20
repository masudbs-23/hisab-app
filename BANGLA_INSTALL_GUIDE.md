# 📱 হিসাব অ্যাপ ইনস্টল গাইড (বাংলা)

## 🚫 সমস্যা: "App blocked to protect your device"

### কেন এই সমস্যা হচ্ছে?
- আপনার অ্যাপ SMS পড়ার permission চাইছে
- Google Play Store এ নেই (unknown source)
- Unsigned APK

### ✅ সমাধান খুব সহজ!

---

## 🎯 দ্রুত সমাধান (২ মিনিট)

### পদ্ধতি ১: Play Protect বন্ধ করুন

#### ধাপ ১: Settings খুলুন
```
Settings (সেটিংস) অ্যাপ খুলুন
```

#### ধাপ ২: Google Play Protect খুঁজুন
```
উপরে Search bar এ লিখুন: "Play Protect"
অথবা
Google → Security → Google Play Protect
অথবা  
Security → Google Play Protect
```

#### ধাপ ৩: Settings এ যান
```
উপরে ডান দিকে ⚙️ (Settings) icon এ ক্লিক করুন
```

#### ধাপ ৪: Scanning বন্ধ করুন
```
"Scan apps with Play Protect" - OFF করুন (বাম দিকে টগল করুন)
```
- সাদা থেকে ধূসর হয়ে যাবে ✅

#### ধাপ ৫: APK Install করুন
```
এখন app-release.apk ফাইল খুলুন
Install button ক্লিক করুন
Block হবে না! ✅
```

#### ধাপ ৬: Install হওয়ার পর (Optional)
```
Play Protect আবার ON করতে পারেন
Already installed অ্যাপ এর কোন সমস্যা হবে না
```

---

## 🔧 পদ্ধতি ২: Developer Options (Alternative)

### Developer Options চালু করুন:

#### ধাপ ১:
```
Settings → About Phone → Build Number
```

#### ধাপ ২:
```
"Build Number" এ ৭ বার ক্লিক করুন
"You are now a developer!" দেখাবে
```

#### ধাপ ৩:
```
Settings → System → Developer Options
```

#### ধাপ ৪: এগুলো ON করুন:
```
✅ USB debugging
✅ Install via USB
```

#### ধাপ ৫: এটা OFF করুন:
```
❌ Verify apps over USB (OFF করুন)
```

#### ধাপ ৬: APK Install করুন
```
এখন install করলে block হবে না
```

---

## 💻 পদ্ধতি ৩: Computer থেকে Install (ADB)

### যদি Computer আছে:

#### প্রয়োজন:
- USB cable
- USB debugging enabled (উপরের পদ্ধতি ২ দেখুন)

#### Commands:
```bash
# HisabApp folder এ যান
cd HisabApp

# Install করুন
install-to-phone.bat
```

অথবা manually:
```bash
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

---

## 🔐 পদ্ধতি ৪: Signed APK তৈরি করুন (Advanced)

### যদি আরো professional ভাবে করতে চান:

#### ধাপ ১: Keystore তৈরি করুন
```bash
cd HisabApp
generate-signed-apk.bat
```

#### প্রশ্নের উত্তর দিন:
```
Password দিন: hisab2025 (মনে রাখুন!)
Re-enter password: hisab2025
নাম: আপনার নাম
Organization: Hisab
City: Dhaka  
State: Dhaka
Country: BD
Correct? yes
```

#### ধাপ ২: Signed APK পাবেন
```
Location: android\app\build\outputs\apk\release\app-release.apk
```

এই APK install করলে একটু কম warning দেখাবে।

---

## 📋 Video Guide Style Instructions

### Method 1 (Play Protect OFF) - Screenshot Guide:

```
1️⃣ Settings খুলুন
   [Screenshot: Phone Settings app icon]

2️⃣ Search করুন "Play Protect"
   [Screenshot: Search bar with "Play Protect"]

3️⃣ Google Play Protect খুলুন
   [Screenshot: Play Protect screen]

4️⃣ Settings (⚙️) click করুন (top right)
   [Screenshot: Settings icon highlighted]

5️⃣ "Scan apps" OFF করুন
   [Screenshot: Toggle switched to OFF]

6️⃣ APK install করুন
   [Screenshot: APK install button]

✅ Done!
```

---

## ❓ সাধারণ প্রশ্ন

### প্রশ্ন: Play Protect বন্ধ করা কি নিরাপদ?
**উত্তর:** হ্যাঁ, শুধুমাত্র নিজের তৈরি অ্যাপ install করার জন্য temporary বন্ধ করলে কোন সমস্যা নেই। Install হওয়ার পর আবার ON করে দিতে পারেন।

### প্রশ্ন: অ্যাপ কি নিরাপদ?
**উত্তর:** হ্যাঁ! আপনার নিজের code, কোন virus নেই। শুধু Google এই অ্যাপ চেনে না তাই warning দিচ্ছে।

### প্রশ্ন: SMS permission কেন?
**উত্তর:** Bank এর SMS (bKash, City Bank) automatically পড়ে transaction track করার জন্য। সব data আপনার ফোনে stored, কোন server এ যায় না।

### প্রশ্ন: কোন পদ্ধতি সবচেয়ে সহজ?
**উত্তর:** **পদ্ধতি ১ (Play Protect OFF)** - সবচেয়ে সহজ এবং দ্রুত।

### প্রশ্ন: Install এর পর কি করতে হবে?
**উত্তর:** 
1. অ্যাপ খুলুন
2. Account তৈরি করুন
3. OTP verify করুন (1234)
4. SMS permission দিন
5. সব ready! ✅

### প্রশ্ন: বন্ধুদের share করলে তাদের কি করতে হবে?
**উত্তর:** তাদেরও Play Protect বন্ধ করতে হবে (পদ্ধতি ১)। অথবা তাদের এই guide পাঠান।

---

## 🎯 সংক্ষেপে

### এখনই করুন (১ মিনিট):
```
Settings → Play Protect → OFF করুন → APK install করুন ✅
```

### পরে করতে পারেন (Professional):
```
Signed APK তৈরি করুন → Share করুন
```

### ভবিষ্যতে (Production):
```
Play Store এ upload করুন → কোন warning থাকবে না
```

---

## 📞 সাহায্য দরকার?

### যদি এখনো install না হয়:

1. **Phone restart করুন**
2. **APK আবার download করুন** (corrupted হতে পারে)
3. **পুরাতন app uninstall করুন** (যদি থাকে)
4. **আবার চেষ্টা করুন**

### ADB Error?
```
- USB cable change করুন
- USB debugging ON আছে কিনা check করুন
- Computer এ phone authorize করুন (popup আসবে phone এ)
```

---

## ✅ শেষ কথা

**আপনার অ্যাপ সম্পূর্ণ নিরাপদ! ✅**

Google Play Protect শুধু জানে না যে এটা আপনার নিজের তৈরি অ্যাপ। তাই warning দিচ্ছে।

**Solution সহজ:**
- Play Protect বন্ধ করুন (temporary)
- APK install করুন
- Play Protect আবার চালু করুন (optional)

**সব ঠিক হয়ে যাবে! 🎉**

---

## 🎁 Bonus Tips

### Install করার পর:
```
1. SMS permission দিন (important)
2. Bank SMS থাকলে automatically sync হবে
3. Manual sync button ও আছে
4. Pull down করে refresh করতে পারবেন
```

### Friends কে share করার আগে:
```
1. Signed APK তৈরি করুন (professional দেখাবে)
2. এই guide share করুন (তারা easily install করতে পারবে)
3. Demo video বানান (optional)
```

**Happy Installing! 🚀**

