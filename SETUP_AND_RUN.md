# 🚀 Hisab App - Setup & Run Guide

## 📱 Complete Feature Overview

### ✅ Implemented Features:
1. **User Authentication (SQLite)**
   - Registration with email/password
   - OTP verification (Fixed: 1234)
   - Login with credentials
   - Auto-login on app restart
   - Logout functionality

2. **SMS Transaction Tracking**
   - Auto SMS permission request
   - Read SMS from bKash, City Bank, City Amex
   - Parse transaction details
   - Store in local database
   - Display on Home screen

3. **Beautiful UI**
   - Onboarding screen with Bengali branding (৳ Hisab)
   - Login/Signup with custom design
   - OTP verification (6-digit input)
   - Home screen with financial summary
   - Transaction list with details modal
   - Floating bottom tab navigator (75% width)
   - Profile screen with logout

4. **Database Features**
   - SQLite local database
   - Users table
   - Transactions table
   - Auto balance calculation
   - No duplicate transactions (unique trxId)

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
cd HisabApp
npm install
```

### Step 2: Android Setup (For SMS Features)
সব কিছু already configured আছে:
- ✅ AndroidManifest.xml এ SMS permissions added
- ✅ react-native-sqlite-storage installed
- ✅ react-native-get-sms-android installed
- ✅ @react-native-async-storage/async-storage installed

### Step 3: Build & Run

#### For Android:
```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npx react-native run-android
```

#### For iOS (macOS only):
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## 📋 First Time Usage Flow

### 1. **Registration**
```
Open App → Skip Onboarding → Go to Signup
↓
Enter Email: test@example.com
Enter Password: 12345678 (min 8 chars)
Confirm Password: 12345678
↓
Click "Create Account"
↓
Alert: "Use OTP 1234"
↓
Navigate to OTP Screen
```

### 2. **OTP Verification**
```
Enter: 1 2 3 4 0 0
↓
Click "Verify OTP"
↓
Success! Navigate to Login
```

### 3. **Login**
```
Enter Email: test@example.com
Enter Password: 12345678
↓
Click "Login"
↓
SMS Permission Requested → Grant Permission
↓
SMS Auto-synced (shows count)
↓
Navigate to Home Screen
```

### 4. **Home Screen**
```
✅ Financial Summary Card:
   - Total Income
   - Total Expense
   - Net Balance

✅ Recent Transactions List (last 10)

✅ Sync Button (top right) - Manual SMS sync

✅ Pull to Refresh - Reload transactions

✅ Tap Transaction - View Full Details
```

### 5. **Navigate**
```
Bottom Tab Navigator (Floating 75% width):
- Home (Financial summary + transactions)
- Transaction (Full list - coming soon)
- Profile (User info + Logout)
```

## 🏦 Supported Banks & SMS Formats

### bKash:
- ✅ Payment: `Tk550.00 sent to BKASH.COM...TrxID BKSH782364`
- ✅ Cash In: `Tk550.00 deposited...TrxID CJK3FL5BBF`
- ✅ Send Money: `Send Money Tk250.00 to 01621161449...TrxID CJF8BLXLD4`
- ✅ Bill Payment: `Tk50.00 bill payment...TrxID CJI5E7812X`

### City Bank:
- ✅ Card Purchase: `BDT550.00 spent on card ending 571...Txn ID: BKSH782364`
- ✅ ATM Withdrawal: `BDT5000.00 withdrawn from ATM...Account 2394***3001`
- ✅ Deposit: `BDT15000.00 deposited...Account 2394***3001`

## 🗄️ Database Structure

### Users Table:
```sql
id, email (UNIQUE), password, is_verified, created_at
```

### Transactions Table:
```sql
id, user_id, type (income/expense), amount, description, date,
category, balance, bank, card_no, trx_id (UNIQUE), fee, method,
status, recipient, account_no, sms_body, created_at
```

## 🔐 Security Notes

### Current Implementation:
- ✅ Local SQLite database
- ✅ AsyncStorage for session
- ✅ Per-user transaction isolation
- ⚠️ Plain text password (should use bcrypt in production)

### SMS Privacy:
- ✅ Only bank SMS are parsed
- ✅ All data stored locally
- ✅ No external server calls
- ✅ Original SMS preserved

## 🎯 Testing Checklist

### ✅ Authentication Flow:
- [ ] Register new user
- [ ] Verify OTP (1234)
- [ ] Login successfully
- [ ] SMS permission granted
- [ ] Transactions synced
- [ ] Close app and reopen (auto-login)
- [ ] Logout from Profile

### ✅ SMS Sync:
- [ ] Check if you have bKash/City Bank SMS
- [ ] Login → SMS auto-synced
- [ ] Click sync button on Home
- [ ] Pull down to refresh
- [ ] View transaction count

### ✅ UI/UX:
- [ ] Onboarding screen with Hisab logo
- [ ] Login/Signup forms working
- [ ] OTP 6-digit input
- [ ] Home screen showing summary
- [ ] Transaction cards visible
- [ ] Modal opens on tap
- [ ] Bottom tab navigation (floating)
- [ ] Profile shows user email

## 🐛 Troubleshooting

### Issue: "SMS Permission Denied"
**Solution:** 
```
Settings → Apps → Hisab → Permissions → SMS → Allow
```

### Issue: "No transactions showing"
**Solution:**
1. Check if you have bank SMS
2. Click sync button (top right)
3. Pull down to refresh
4. Check console logs

### Issue: "Database error"
**Solution:**
1. Uninstall app
2. Reinstall app
3. Fresh database will be created

### Issue: "Login not working"
**Solution:**
1. Make sure user is verified (OTP done)
2. Check email/password correct
3. Check console logs for errors

### Issue: "Build errors"
**Solution:**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 📊 App Architecture

```
HisabApp/
├── src/
│   ├── context/
│   │   └── AuthContext.tsx          # Auth state management
│   ├── services/
│   │   ├── DatabaseService.ts       # SQLite operations
│   │   └── SMSService.ts            # SMS reading & parsing
│   ├── screens/
│   │   ├── OnboardingScreen.tsx     # Welcome screen
│   │   ├── LoginScreen.tsx          # Login with SMS sync
│   │   ├── SignupScreen.tsx         # Registration
│   │   ├── OTPVerificationScreen.tsx # OTP input (1234)
│   │   ├── HomeScreen.tsx           # Dashboard + transactions
│   │   ├── TransactionScreen.tsx    # Full transaction list
│   │   └── ProfileScreen.tsx        # User profile + logout
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Auth-based routing
│   │   └── BottomTabNavigator.tsx   # Custom floating tabs
│   └── components/
│       ├── Input.tsx                # Custom input field
│       ├── Button.tsx               # Custom button
│       └── CustomTabBar.tsx         # Floating tab bar (75% width)
├── android/
│   └── app/src/main/AndroidManifest.xml  # SMS permissions
├── App.tsx                          # Entry point with AuthProvider
└── index.js                         # Gesture handler import
```

## 🎨 Design Highlights

### Color Scheme:
- Primary: `#00b894` (Green)
- Background: `#f8fffe` (Light mint)
- Income: `#27ae60` (Green)
- Expense: `#e74c3c` (Red)
- Text: `#2d3436` (Dark gray)

### UI Components:
- Bengali Taka symbol (৳)
- Circular avatar with first letter
- Floating bottom navigator (75% width, centered)
- Transaction cards with left border (green/red)
- Modal with slide animation
- Pull to refresh support
- Loading states

## 📱 Running on Device

### Android:
1. Enable Developer Options on phone
2. Enable USB Debugging
3. Connect phone via USB
4. Run: `npx react-native run-android`

### Release APK:
```bash
npm run buildApk
```
APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## 🚀 Future Enhancements

- [ ] Add more banks (DBBL, BRAC, EBL, etc.)
- [ ] Real-time SMS listener
- [ ] Transaction categories with icons
- [ ] Budget tracking
- [ ] Monthly/Yearly reports
- [ ] Export to Excel/PDF
- [ ] Backup & Restore
- [ ] Multi-currency support
- [ ] Dark mode

## 📞 Support & Issues

For any issues:
1. Check console logs
2. Check database: Use SQLite viewer
3. Clear app data and retry
4. Rebuild app

## ✅ Current Status

**✅ FULLY FUNCTIONAL:**
- Authentication (Register, OTP, Login, Logout)
- SMS Reading & Parsing
- Transaction Storage in SQLite
- Home Screen with Real Data
- Balance Calculation
- Transaction Details Modal
- Floating Bottom Navigator
- Pull to Refresh
- Manual Sync

**🎉 App is READY TO USE!**

