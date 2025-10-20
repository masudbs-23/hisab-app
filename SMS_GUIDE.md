# SMS Transaction Tracking Guide - Hisab App

## 📱 Overview

Hisab app automatically reads SMS from your phone to track financial transactions from banks like bKash, City Bank, City Amex, etc.

## 🔐 Permissions Required

### Android Manifest
```xml
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
```

The app requests these permissions:
1. **On first login** - Automatically requests SMS permission
2. **Manual sync** - Click sync button on Home screen

## 🏦 Supported Banks/Services

### Currently Supported:
- ✅ **bKash**
- ✅ **City Bank**
- ✅ **City Amex**
- 🔄 **More banks coming soon**

## 📊 Transaction Types Detected

### bKash Transactions:
1. **Payment/Send Money**
   - SMS Format: `Tk550.00 sent to BKASH.COM...TrxID BKSH782364`
   - Parsed as: **Expense**

2. **Cash In/Deposit**
   - SMS Format: `Tk550.00 deposited...TrxID CJK3FL5BBF`
   - Parsed as: **Income**

3. **Bill Payment**
   - SMS Format: `Tk50.00 bill payment...TrxID CJI5E7812X`
   - Parsed as: **Expense**

4. **Send Money**
   - SMS Format: `Send Money Tk250.00 to 01621161449...TrxID CJF8BLXLD4`
   - Parsed as: **Expense**

### City Bank Transactions:
1. **Card Purchase**
   - SMS Format: `BDT550.00 spent on card ending 571...Txn ID: BKSH782364`
   - Parsed as: **Expense**

2. **ATM Withdrawal**
   - SMS Format: `BDT5000.00 withdrawn from ATM...Account 2394***3001`
   - Parsed as: **Expense** (with ৳15 fee)

3. **Bank Deposit**
   - SMS Format: `BDT15000.00 deposited...Account 2394***3001`
   - Parsed as: **Income**

## 🗄️ Database Structure

### Transactions Table:
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  type TEXT ('income' | 'expense'),
  amount REAL,
  description TEXT,
  date TEXT (ISO 8601),
  category TEXT,
  balance REAL,
  bank TEXT,
  card_no TEXT,
  trx_id TEXT UNIQUE,
  fee REAL,
  method TEXT,
  status TEXT,
  recipient TEXT,
  account_no TEXT,
  sms_body TEXT (original SMS),
  created_at DATETIME
)
```

## 🔄 How SMS Sync Works

### 1. **On Login**
```
Login → Request SMS Permission → Read Last 100 SMS 
→ Parse Bank SMS → Store in Database → Show Count
```

### 2. **Manual Sync**
```
Home Screen → Click Sync Button → Read New SMS 
→ Parse → Store → Refresh UI
```

### 3. **Pull to Refresh**
```
Home Screen → Pull Down → Sync SMS → Reload Data
```

## 📝 Transaction Details Captured

For each transaction, we store:
- ✅ Amount
- ✅ Description
- ✅ Date & Time
- ✅ Transaction ID (Unique - prevents duplicates)
- ✅ Bank/Service name
- ✅ Transaction type (Income/Expense)
- ✅ Fee (if any)
- ✅ Card/Account number (masked)
- ✅ Recipient (for transfers)
- ✅ Balance after transaction
- ✅ Original SMS body

## 💰 Financial Summary

The app calculates:
- **Total Income** = Sum of all income transactions
- **Total Expense** = Sum of all expense transactions
- **Net Balance** = Total Income - Total Expense

## 🎨 UI Features

### Home Screen:
- Financial summary card
- Recent transactions list (last 10)
- Pull to refresh
- Sync button
- Transaction details modal

### Transaction Card:
- Type badge (Income/Expense)
- Amount with sign (+/-)
- Description
- Bank name
- Date & time
- Color coding (Green for income, Red for expense)

### Transaction Modal:
Shows full details:
- Amount
- Description
- Date & Time
- Bank/Service
- Category
- Method
- Status
- Transaction ID
- Card/Account Number
- Recipient (if any)
- Fee
- Balance

## 🔍 SMS Parsing Examples

### Example 1: bKash Payment
```
SMS: "Tk550.00 sent to BKASH.COM on 20/10/2025 at 10:46 AM. 
Fee Tk0.00. Balance Tk28,443.91. TrxID BKSH782364"

Parsed:
- Type: expense
- Amount: 550.00
- Description: "Purchased at BKASH.COM"
- Bank: bKash
- TrxID: BKSH782364
- Fee: 0.00
- Balance: 28,443.91
- Category: Shopping
- Method: Payment
```

### Example 2: City Bank Card Payment
```
SMS: "BDT550.00 spent on card ending 571 on 20/10/2025.
Txn ID: BKSH782364. Balance: BDT28,443.91"

Parsed:
- Type: expense
- Amount: 550.00
- Description: "Card Purchase"
- Bank: City Bank
- TrxID: BKSH782364
- CardNo: ***571
- Balance: 28,443.91
- Category: Shopping
- Method: Card Payment
```

## ⚙️ Configuration

### Add New Bank:
Edit `SMSService.ts`:

```typescript
// Add bank sender ID
const BANK_SENDERS = [
  'bKash',
  'CityBank',
  'NewBank', // Add here
];

// Add parsing function
export const parseNewBankSMS = (body: string) => {
  // Parse SMS format
  // Return transaction object
};
```

## 🔒 Privacy & Security

- ✅ SMS stored locally (SQLite)
- ✅ No data sent to external servers
- ✅ Only bank SMS are parsed
- ✅ Original SMS preserved
- ✅ User data encrypted in database
- ✅ Per-user transaction isolation

## 🐛 Troubleshooting

### Issue: No transactions showing
**Solution:**
1. Check SMS permission granted
2. Click sync button
3. Pull to refresh
4. Check if you have bank SMS

### Issue: Duplicate transactions
**Solution:**
- Duplicate TrxID automatically prevented
- Each transaction ID is unique

### Issue: Wrong balance
**Solution:**
- Balance is calculated from all transactions
- Delete unwanted transactions
- Re-sync SMS

### Issue: SMS not parsing
**Solution:**
- Check SMS format matches supported banks
- View SMS_GUIDE.md for supported formats
- Contact support with SMS example

## 📈 Future Enhancements

- 📱 More banks support
- 🔔 Real-time SMS listening
- 📊 Advanced analytics
- 💳 Category auto-detection
- 🎯 Budget tracking
- 📅 Monthly reports

## 🧪 Testing

### Test SMS Sync:
1. Login to app
2. Grant SMS permission
3. Check console logs for parsed SMS count
4. View Home screen
5. Verify transactions appear

### Test with Sample SMS:
Send yourself test SMS:
```
From: bKash
Msg: Tk550.00 sent to TEST.COM on 20/10/2025 at 10:46 AM. 
Fee Tk0.00. Balance Tk28,443.91. TrxID TEST123456
```

Should parse as expense transaction!

## 📞 Support

For issues or feature requests:
- Check database: Use SQLite viewer
- Check logs: `console.log` in SMSService.ts
- Reset: Uninstall app and reinstall

