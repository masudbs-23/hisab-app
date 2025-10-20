# Hisab - Personal Finance Tracker

A beautiful React Native app for tracking personal finances with a modern UI.

## Features

✨ **Onboarding Screen** - Welcome screen with app introduction
🔐 **Authentication** - Login, Signup, and OTP verification screens
🏠 **Home Screen** - Dashboard with balance overview and quick actions
💰 **Transaction Screen** - View and manage all transactions
👤 **Profile Screen** - User profile and settings
🎨 **Custom Floating Tab Bar** - Beautiful 75% width centered bottom navigation

## Tech Stack

- React Native 0.82.0
- React Navigation (Stack & Bottom Tabs)
- React Native Vector Icons (MaterialCommunityIcons)
- TypeScript

## Project Structure

```
HisabApp/
├── src/
│   ├── screens/
│   │   ├── OnboardingScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── OTPVerificationScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TransactionScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── BottomTabNavigator.tsx
│   └── components/
│       └── CustomTabBar.tsx
├── App.tsx
└── index.js
```

## Installation

1. Navigate to the project directory:
```bash
cd HisabApp
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. For iOS (macOS only):
```bash
cd ios && pod install && cd ..
```

## Running the App

### Android
```bash
npx react-native run-android
```

### iOS (macOS only)
```bash
npx react-native run-ios
```

## Navigation Flow

1. **Onboarding Screen** → Get Started button → Login Screen
2. **Login Screen** → Login button → Home Screen (Main App)
3. **Login Screen** → Sign Up link → Signup Screen
4. **Signup Screen** → Sign Up button → OTP Verification Screen
5. **OTP Verification Screen** → Verify button → Home Screen (Main App)
6. **Main App** → Bottom Tab Navigator (Home, Transaction, Profile)

## Custom Features

### Floating Bottom Tab Bar
- 75% screen width
- Centered horizontally
- Floating design with shadow
- Smooth animations on tab press
- Active tab highlighted with blue background

## Color Scheme

- Primary: #4A90E2 (Blue)
- Success: #4CAF50 (Green)
- Error: #F44336 (Red)
- Background: #F5F5F5 (Light Gray)
- Text: #333333 (Dark Gray)

## Screenshots Flow

1. Onboarding → 2. Login → 3. Signup → 4. OTP → 5. Home → 6. Transaction → 7. Profile

## Development Notes

- All screens are fully responsive
- TypeScript enabled for type safety
- React Native Vector Icons configured for both iOS and Android
- Gesture Handler properly configured
- Custom tab bar implementation for unique design

## License

This project is created for demonstration purposes.

