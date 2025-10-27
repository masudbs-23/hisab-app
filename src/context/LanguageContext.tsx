import React, {createContext, useContext, useState, ReactNode} from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

const translations: Translations = {
  // Common
  'common.save': {en: 'Save', bn: 'সংরক্ষণ'},
  'common.cancel': {en: 'Cancel', bn: 'বাতিল'},
  'common.delete': {en: 'Delete', bn: 'মুছুন'},
  'common.edit': {en: 'Edit', bn: 'সম্পাদনা'},
  'common.success': {en: 'Success', bn: 'সফল'},
  'common.error': {en: 'Error', bn: 'ত্রুটি'},
  'common.loading': {en: 'Loading...', bn: 'লোড হচ্ছে...'},
  
  // Home Screen
  'home.title': {en: 'Home', bn: 'হোম'},
  'home.noCards': {en: 'No cards added yet', bn: 'এখনো কোনো কার্ড যোগ করা হয়নি'},
  'home.addCard': {en: 'Add Card', bn: 'কার্ড যোগ করুন'},
  'home.addIncome': {en: 'Add Income', bn: 'আয় যোগ করুন'},
  'home.addExpense': {en: 'Add Expense', bn: 'খরচ যোগ করুন'},
  'home.statistics': {en: 'Statistics', bn: 'পরিসংখ্যান'},
  'home.transactions': {en: 'Transactions', bn: 'লেনদেন'},
  'home.seeAll': {en: 'See all', bn: 'সব দেখুন'},
  'home.noTransactions': {en: 'No transactions yet', bn: 'এখনো কোনো লেনদেন নেই'},
  'home.getStarted': {en: 'Add income or expense to get started', bn: 'শুরু করতে আয় বা খরচ যোগ করুন'},
  'home.balance': {en: 'Balance', bn: 'ব্যালেন্স'},
  'home.cardholder': {en: 'CARDHOLDER', bn: 'কার্ডধারী'},
  
  // Add Transaction Screen
  'addTransaction.addIncome': {en: 'Add Income', bn: 'আয় যোগ করুন'},
  'addTransaction.addExpense': {en: 'Add Expense', bn: 'খরচ যোগ করুন'},
  'addTransaction.selectCard': {en: 'Select Card', bn: 'কার্ড নির্বাচন করুন'},
  'addTransaction.noCards': {en: 'No cards available', bn: 'কোনো কার্ড নেই'},
  'addTransaction.addCardFirst': {en: 'Add a card from the Cards tab first', bn: 'প্রথমে কার্ড ট্যাব থেকে একটি কার্ড যোগ করুন'},
  'addTransaction.title': {en: 'Title', bn: 'শিরোনাম'},
  'addTransaction.selectOrEnter': {en: 'Select or enter title', bn: 'নির্বাচন করুন বা লিখুন'},
  'addTransaction.amount': {en: 'Amount', bn: 'পরিমাণ'},
  'addTransaction.enterAmount': {en: 'Enter amount', bn: 'পরিমাণ লিখুন'},
  'addTransaction.titleRequired': {en: 'Title is required', bn: 'শিরোনাম আবশ্যক'},
  'addTransaction.amountRequired': {en: 'Amount is required', bn: 'পরিমাণ আবশ্যক'},
  'addTransaction.validAmount': {en: 'Please enter a valid amount', bn: 'একটি সঠিক পরিমাণ লিখুন'},
  'addTransaction.selectCardRequired': {en: 'Please select a card', bn: 'একটি কার্ড নির্বাচন করুন'},
  'addTransaction.incomeSuccess': {en: 'Income added successfully!', bn: 'আয় সফলভাবে যোগ হয়েছে!'},
  'addTransaction.expenseSuccess': {en: 'Expense added successfully!', bn: 'খরচ সফলভাবে যোগ হয়েছে!'},
  'addTransaction.failed': {en: 'Failed to add transaction. Please try again.', bn: 'লেনদেন যোগ করতে ব্যর্থ। আবার চেষ্টা করুন।'},
  
  // Expense Suggestions
  'suggestions.rent': {en: 'Rent', bn: 'ভাড়া'},
  'suggestions.travel': {en: 'Travel', bn: 'ভ্রমণ'},
  'suggestions.shopping': {en: 'Shopping', bn: 'কেনাকাটা'},
  'suggestions.food': {en: 'Food', bn: 'খাবার'},
  'suggestions.bills': {en: 'Bills', bn: 'বিল'},
  'suggestions.entertainment': {en: 'Entertainment', bn: 'বিনোদন'},
  'suggestions.health': {en: 'Health', bn: 'স্বাস্থ্য'},
  'suggestions.education': {en: 'Education', bn: 'শিক্ষা'},
  
  // Income Suggestions
  'suggestions.salary': {en: 'Salary', bn: 'বেতন'},
  'suggestions.partTime': {en: 'Part-time', bn: 'খণ্ডকালীন'},
  'suggestions.freelance': {en: 'Freelance', bn: 'ফ্রিল্যান্স'},
  'suggestions.business': {en: 'Business', bn: 'ব্যবসা'},
  'suggestions.investment': {en: 'Investment', bn: 'বিনিয়োগ'},
  'suggestions.gift': {en: 'Gift', bn: 'উপহার'},
  'suggestions.bonus': {en: 'Bonus', bn: 'বোনাস'},
  
  // Cards Screen
  'cards.title': {en: 'My Cards', bn: 'আমার কার্ড'},
  'cards.noCards': {en: 'No cards yet', bn: 'এখনো কোনো কার্ড নেই'},
  'cards.addFirst': {en: 'Add your first card to get started', bn: 'শুরু করতে আপনার প্রথম কার্ড যোগ করুন'},
  'cards.addCard': {en: 'Add New Card', bn: 'নতুন কার্ড যোগ করুন'},
  'cards.balance': {en: 'Balance', bn: 'ব্যালেন্স'},
  'cards.totalBalance': {en: 'Total Balance', bn: 'মোট ব্যালেন্স'},
  
  // Add Card Screen
  'addCard.title': {en: 'Add New Card', bn: 'নতুন কার্ড যোগ করুন'},
  'addCard.cardName': {en: 'Card Name', bn: 'কার্ডের নাম'},
  'addCard.enterCardName': {en: 'Enter card name', bn: 'কার্ডের নাম লিখুন'},
  'addCard.cardType': {en: 'Card Type', bn: 'কার্ডের ধরন'},
  'addCard.selectType': {en: 'Select card type', bn: 'কার্ডের ধরন নির্বাচন করুন'},
  'addCard.cardNumber': {en: 'Card Number (Last 4 digits)', bn: 'কার্ড নম্বর (শেষ ৪ সংখ্যা)'},
  'addCard.enterCardNumber': {en: 'Enter last 4 digits', bn: 'শেষ ৪ সংখ্যা লিখুন'},
  'addCard.initialBalance': {en: 'Initial Balance', bn: 'প্রাথমিক ব্যালেন্স'},
  'addCard.enterBalance': {en: 'Enter initial balance', bn: 'প্রাথমিক ব্যালেন্স লিখুন'},
  'addCard.success': {en: 'Card added successfully!', bn: 'কার্ড সফলভাবে যোগ হয়েছে!'},
  'addCard.failed': {en: 'Failed to add card', bn: 'কার্ড যোগ করতে ব্যর্থ'},
  
  // Profile Screen
  'profile.title': {en: 'Profile', bn: 'প্রোফাইল'},
  'profile.personalInfo': {en: 'Personal Information', bn: 'ব্যক্তিগত তথ্য'},
  'profile.name': {en: 'Name', bn: 'নাম'},
  'profile.email': {en: 'Email', bn: 'ইমেইল'},
  'profile.phone': {en: 'Phone', bn: 'ফোন'},
  'profile.settings': {en: 'Settings', bn: 'সেটিংস'},
  'profile.language': {en: 'Language', bn: 'ভাষা'},
  'profile.notifications': {en: 'Notifications', bn: 'বিজ্ঞপ্তি'},
  'profile.security': {en: 'Security & Privacy', bn: 'নিরাপত্তা ও গোপনীয়তা'},
  'profile.about': {en: 'About', bn: 'সম্পর্কে'},
  'profile.help': {en: 'Help & Support', bn: 'সাহায্য ও সহায়তা'},
  'profile.terms': {en: 'Terms of Service', bn: 'সেবার শর্তাবলী'},
  'profile.privacy': {en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি'},
  'profile.logout': {en: 'Logout', bn: 'লগআউট'},
  
  // Statistics Screen
  'stats.title': {en: 'Statistics', bn: 'পরিসংখ্যান'},
  'stats.overview': {en: 'Overview', bn: 'সারসংক্ষেপ'},
  'stats.totalIncome': {en: 'Total Income', bn: 'মোট আয়'},
  'stats.totalExpense': {en: 'Total Expense', bn: 'মোট খরচ'},
  'stats.netSavings': {en: 'Net Savings', bn: 'নিট সঞ্চয়'},
  'stats.thisMonth': {en: 'This Month', bn: 'এই মাসে'},
  'stats.lastMonth': {en: 'Last Month', bn: 'গত মাসে'},
  'stats.thisYear': {en: 'This Year', bn: 'এই বছরে'},
  'stats.categories': {en: 'Categories', bn: 'বিভাগ'},
  'stats.trends': {en: 'Trends', bn: 'প্রবণতা'},
  
  // Transaction Screen
  'transaction.title': {en: 'All Transactions', bn: 'সব লেনদেন'},
  'transaction.filter': {en: 'Filter', bn: 'ছাঁকনি'},
  'transaction.all': {en: 'All', bn: 'সব'},
  'transaction.income': {en: 'Income', bn: 'আয়'},
  'transaction.expense': {en: 'Expense', bn: 'খরচ'},
  'transaction.date': {en: 'Date & Time', bn: 'তারিখ ও সময়'},
  'transaction.bank': {en: 'Bank/Service', bn: 'ব্যাংক/সেবা'},
  'transaction.category': {en: 'Category', bn: 'বিভাগ'},
  'transaction.method': {en: 'Method', bn: 'পদ্ধতি'},
  'transaction.status': {en: 'Status', bn: 'অবস্থা'},
  'transaction.transactionId': {en: 'Transaction ID', bn: 'লেনদেন আইডি'},
  'transaction.details': {en: 'Transaction Details', bn: 'লেনদেনের বিস্তারিত'},
  
  // Onboarding Screen
  'onboarding.title': {en: 'Smart Money Management', bn: 'স্মার্ট অর্থ ব্যবস্থাপনা'},
  'onboarding.subtitle': {en: 'Track expenses, manage cards, and gain insights for better financial decisions', bn: 'খরচ ট্র্যাক করুন, কার্ড পরিচালনা করুন এবং ভালো আর্থিক সিদ্ধান্তের জন্য অন্তর্দৃষ্টি পান'},
  'onboarding.feature1': {en: 'Easy Tracking', bn: 'সহজ ট্র্যাকিং'},
  'onboarding.feature1Desc': {en: 'Monitor daily transactions effortlessly', bn: 'দৈনিক লেনদেন সহজে পর্যবেক্ষণ করুন'},
  'onboarding.feature2': {en: 'Visual Insights', bn: 'চাক্ষুষ তথ্য'},
  'onboarding.feature2Desc': {en: 'Beautiful charts & statistics', bn: 'সুন্দর চার্ট ও পরিসংখ্যান'},
  'onboarding.feature3': {en: 'Multi Cards', bn: 'একাধিক কার্ড'},
  'onboarding.feature3Desc': {en: 'Manage all your cards easily', bn: 'সব কার্ড সহজে পরিচালনা করুন'},
  'onboarding.getStarted': {en: 'Get Started', bn: 'শুরু করুন'},
  'onboarding.terms': {en: 'By continuing, you agree to our Terms & Privacy Policy', bn: 'অব্যাহত রেখে, আপনি আমাদের শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন'},
  'onboarding.appName': {en: 'Hisab', bn: 'হিসাব'},
  'onboarding.tagline': {en: 'Your Financial Companion', bn: 'আপনার আর্থিক সঙ্গী'},
};

export const LanguageProvider = ({children}: {children: ReactNode}) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{language, setLanguage, t}}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

