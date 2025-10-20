# Authentication System - Hisab App

## 📱 Overview

এই app এ SQLite database ব্যবহার করে সম্পূর্ণ authentication system implement করা হয়েছে।

## 🗄️ Database Structure

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🔐 Authentication Flow

### 1. **Registration (Signup)**
```
User → Signup Screen → Enter Email & Password → Database এ save হয় (is_verified = 0)
→ Alert দেখায় "OTP: 1234" → OTP Screen এ redirect
```

**Code Location:** `src/screens/SignupScreen.tsx`

**Database Function:** `registerUser(email, password)`
- Check করে email already exist করে কিনা
- New user insert করে `is_verified = 0` দিয়ে
- Success হলে OTP screen এ navigate করে

### 2. **OTP Verification**
```
OTP Screen → User enters 1234 (first 4 of 6 digits) → Database এ verify করে
→ is_verified = 1 হয় → Login screen এ redirect
```

**Fixed OTP:** `1234` (hardcoded)

**Code Location:** `src/screens/OTPVerificationScreen.tsx`

**Database Function:** `verifyOTP(email, otp)`
- OTP check করে (must be "1234")
- Match হলে database এ `is_verified = 1` করে
- User কে login screen এ পাঠায়

### 3. **Login**
```
Login Screen → Enter Email & Password → Database থেকে verify করে
→ AsyncStorage এ user save হয় → Main App (Home) তে redirect
```

**Code Location:** `src/screens/LoginScreen.tsx`

**Database Function:** `loginUser(email, password)`
- Email, password এবং `is_verified = 1` check করে
- Match হলে user data return করে
- AuthContext এ user save হয় (AsyncStorage এ persist করে)

### 4. **Auto-Login Check**
```
App Start → AuthContext load হয় → AsyncStorage check করে
→ User থাকলে: Main App দেখায়
→ User না থাকলে: Onboarding → Login/Signup দেখায়
```

**Code Location:** `src/context/AuthContext.tsx` এবং `src/navigation/AppNavigator.tsx`

### 5. **Logout**
```
Profile Screen → Logout Button → Confirmation Alert → AsyncStorage clear হয়
→ Auth state reset → Onboarding screen এ redirect
```

**Code Location:** `src/screens/ProfileScreen.tsx`

## 📂 File Structure

```
src/
├── services/
│   └── DatabaseService.ts         # SQLite database operations
├── context/
│   └── AuthContext.tsx            # Authentication state management
├── screens/
│   ├── OnboardingScreen.tsx       # Welcome screen
│   ├── SignupScreen.tsx           # Registration
│   ├── LoginScreen.tsx            # Login
│   ├── OTPVerificationScreen.tsx # OTP verification
│   └── ProfileScreen.tsx          # User profile with logout
└── navigation/
    └── AppNavigator.tsx           # Auth-based navigation logic
```

## 🔑 Key Features

### ✅ Database Features
- SQLite local database
- User table with email, password, verification status
- UNIQUE constraint on email (no duplicate accounts)
- Automatic table creation on first app launch

### ✅ Security Features
- Password storage (আসল production এ bcrypt দিয়ে hash করা উচিত)
- OTP verification required before login
- Only verified users can login
- Session persistence with AsyncStorage

### ✅ UX Features
- Loading states during async operations
- Form validation (email format, password length, etc.)
- Error messages with proper feedback
- Confirmation alerts for important actions
- Auto-redirect based on login status

## 🧪 Testing Flow

### Test User Registration:
1. Open app → Skip onboarding → Go to Signup
2. Enter email: `test@example.com`
3. Enter password: `password123` (min 8 characters)
4. Confirm password: `password123`
5. Click "Create Account"
6. See alert: "Use OTP: 1234"
7. Navigate to OTP screen

### Test OTP Verification:
1. Enter: `1` `2` `3` `4` `0` `0` (first 4 digits are important)
2. Click "Verify OTP"
3. See success alert
4. Navigate to Login

### Test Login:
1. Enter email: `test@example.com`
2. Enter password: `password123`
3. Click "Login"
4. See success alert
5. Auto navigate to Home screen

### Test Auto-Login:
1. Close app completely
2. Reopen app
3. Should automatically go to Home screen (skip Onboarding/Login)

### Test Logout:
1. Go to Profile tab
2. Click "Logout" button
3. Confirm logout
4. Should navigate back to Onboarding screen

## 🔄 Navigation Logic

```typescript
if (isLoading) {
  // Show loading spinner
} else if (isLoggedIn) {
  // Show Main App (Home, Transaction, Profile)
} else {
  // Show Auth Screens (Onboarding, Login, Signup, OTP)
}
```

## 📝 Important Notes

### Fixed OTP
- OTP সবসময় `1234`
- Production এ email/SMS পাঠানো উচিত
- OTP screen এ 6 digit input, কিন্তু শুধু প্রথম 4 digit (`1234`) check করে

### Password Storage
- এখন plain text store করছে
- **Production এ অবশ্যই bcrypt/crypto দিয়ে hash করতে হবে**

### Error Handling
- Duplicate email registration blocked
- Unverified users can't login
- Wrong OTP shows error and clears inputs
- Network errors properly caught and displayed

## 🚀 Future Enhancements

1. **Password Hashing** - bcrypt দিয়ে secure করা
2. **Real OTP Service** - Email/SMS OTP পাঠানো
3. **Forgot Password** - Password reset flow
4. **Token-based Auth** - JWT tokens for API calls
5. **Biometric Auth** - Fingerprint/Face ID
6. **Social Login** - Google, Facebook login

## 📞 Support

কোন সমস্যা হলে database reset করতে:
- App uninstall করুন এবং reinstall করুন
- অথবা app data clear করুন

