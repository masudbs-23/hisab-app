import {PermissionsAndroid, Platform} from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import {addTransaction} from './DatabaseService';

// Bank SMS sender IDs
const BANK_SENDERS = [
  'bKash',
  'BKASH',
  'CityBank',
  'CITYBANK',
  'CityAmex',
  'CITYAMEX',
  'CITY',
  'DBBL',
  'EBL',
  'BRAC',
  'Dutch-Bangla',
];

export const requestSMSPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'Hisab needs access to your SMS to track transactions',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting SMS permission:', err);
      return false;
    }
  }
  return false;
};

export const parseBkashSMS = (body: string) => {
  const patterns = {
    // Payment/Send Money: "Tk550.00 sent to BKASH.COM..."
    payment: /Tk([\d,]+\.?\d*)\s+sent\s+to\s+(.+?)\s+.*TrxID\s+(\w+)/i,
    // Cash In: "Tk550.00 deposited..."
    cashIn: /Tk([\d,]+\.?\d*)\s+deposited.*TrxID\s+(\w+)/i,
    // Bill Payment: "Tk50.00 bill payment..."
    billPay: /Tk([\d,]+\.?\d*)\s+bill payment.*TrxID\s+(\w+)/i,
    // Send Money: "Send Money Tk250.00 to 01621161449..."
    sendMoney: /Send Money Tk([\d,]+\.?\d*)\s+to\s+([\d]+).*TrxID\s+(\w+)/i,
    // Balance
    balance: /balance is Tk([\d,]+\.?\d*)/i,
    // Fee
    fee: /fee Tk([\d,]+\.?\d*)/i,
  };

  let transaction: any = null;

  // Check Payment
  const paymentMatch = body.match(patterns.payment);
  if (paymentMatch) {
    const amount = parseFloat(paymentMatch[1].replace(/,/g, ''));
    const merchant = paymentMatch[2].trim();
    const trxId = paymentMatch[3];
    const balanceMatch = body.match(patterns.balance);
    const feeMatch = body.match(patterns.fee);

    transaction = {
      type: 'expense',
      amount,
      description: `Purchased at ${merchant}`,
      trxId,
      bank: 'bKash',
      method: 'Payment',
      category: 'Shopping',
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : 0,
      smsBody: body,
    };
  }

  // Check Cash In
  const cashInMatch = body.match(patterns.cashIn);
  if (cashInMatch && !transaction) {
    const amount = parseFloat(cashInMatch[1].replace(/,/g, ''));
    const trxId = cashInMatch[2];
    const balanceMatch = body.match(patterns.balance);

    transaction = {
      type: 'income',
      amount,
      description: 'Deposit to bKash',
      trxId,
      bank: 'bKash',
      method: 'Cash In',
      category: 'Deposit',
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: 0,
      smsBody: body,
    };
  }

  // Check Send Money
  const sendMoneyMatch = body.match(patterns.sendMoney);
  if (sendMoneyMatch && !transaction) {
    const amount = parseFloat(sendMoneyMatch[1].replace(/,/g, ''));
    const recipient = sendMoneyMatch[2];
    const trxId = sendMoneyMatch[3];
    const balanceMatch = body.match(patterns.balance);
    const feeMatch = body.match(patterns.fee);

    transaction = {
      type: 'expense',
      amount,
      description: `Send Money to ${recipient}`,
      trxId,
      bank: 'bKash',
      method: 'Send Money',
      category: 'Money Transfer',
      recipient,
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : 0,
      smsBody: body,
    };
  }

  // Check Bill Payment
  const billPayMatch = body.match(patterns.billPay);
  if (billPayMatch && !transaction) {
    const amount = parseFloat(billPayMatch[1].replace(/,/g, ''));
    const trxId = billPayMatch[2];
    const balanceMatch = body.match(patterns.balance);
    const feeMatch = body.match(patterns.fee);

    transaction = {
      type: 'expense',
      amount,
      description: 'Bill Payment',
      trxId,
      bank: 'bKash',
      method: 'Bill Pay',
      category: 'Bill Payment',
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : 0,
      smsBody: body,
    };
  }

  return transaction;
};

export const parseCityBankSMS = (body: string) => {
  const patterns = {
    // Purchase: "BDT550.00 spent on 376***571..."
    purchase: /BDT([\d,]+\.?\d*)\s+spent.*card ending (\d+).*Txn ID:\s*(\w+)/i,
    // ATM Withdrawal: "BDT5000.00 withdrawn from ATM..."
    atmWithdraw: /BDT([\d,]+\.?\d*)\s+withdrawn from ATM.*Account\s+(\d+)/i,
    // Deposit: "BDT15000.00 deposited..."
    deposit: /BDT([\d,]+\.?\d*)\s+deposited.*Account\s+(\d+)/i,
    // Balance
    balance: /balance is BDT([\d,]+\.?\d*)/i,
  };

  let transaction: any = null;

  // Check Purchase
  const purchaseMatch = body.match(patterns.purchase);
  if (purchaseMatch) {
    const amount = parseFloat(purchaseMatch[1].replace(/,/g, ''));
    const cardNo = purchaseMatch[2];
    const trxId = purchaseMatch[3];
    const balanceMatch = body.match(patterns.balance);

    transaction = {
      type: 'expense',
      amount,
      description: 'Card Purchase',
      trxId,
      bank: 'City Bank',
      method: 'Card Payment',
      category: 'Shopping',
      cardNo: `***${cardNo}`,
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: 0,
      smsBody: body,
    };
  }

  // Check ATM Withdrawal
  const atmMatch = body.match(patterns.atmWithdraw);
  if (atmMatch && !transaction) {
    const amount = parseFloat(atmMatch[1].replace(/,/g, ''));
    const accountNo = atmMatch[2];

    transaction = {
      type: 'expense',
      amount,
      description: 'ATM Withdrawal',
      trxId: `ATM${Date.now()}`,
      bank: 'City Bank',
      method: 'ATM',
      category: 'Cash Withdrawal',
      accountNo: `***${accountNo.slice(-4)}`,
      balance: 0,
      fee: 15,
      smsBody: body,
    };
  }

  // Check Deposit
  const depositMatch = body.match(patterns.deposit);
  if (depositMatch && !transaction) {
    const amount = parseFloat(depositMatch[1].replace(/,/g, ''));
    const accountNo = depositMatch[2];

    transaction = {
      type: 'income',
      amount,
      description: 'Bank Deposit',
      trxId: `DEP${Date.now()}`,
      bank: 'City Bank',
      method: 'Bank Transfer',
      category: 'Deposit',
      accountNo: `***${accountNo.slice(-4)}`,
      balance: amount,
      fee: 0,
      smsBody: body,
    };
  }

  return transaction;
};

export const parseSMS = (address: string, body: string) => {
  // Check if sender is from a bank
  const isBank = BANK_SENDERS.some(sender =>
    address.toUpperCase().includes(sender.toUpperCase()),
  );

  if (!isBank) {
    return null;
  }

  // Try to parse based on bank
  if (address.toUpperCase().includes('BKASH')) {
    return parseBkashSMS(body);
  } else if (
    address.toUpperCase().includes('CITY') ||
    address.toUpperCase().includes('AMEX')
  ) {
    return parseCityBankSMS(body);
  }

  return null;
};

export const readAndParseSMS = async (userId: number) => {
  try {
    const hasPermission = await requestSMSPermission();
    if (!hasPermission) {
      console.log('SMS permission denied');
      return {success: false, count: 0};
    }

    return new Promise((resolve, reject) => {
      const filter = {
        box: 'inbox',
        maxCount: 100, // Read last 100 SMS
      };

      SmsAndroid.list(
        JSON.stringify(filter),
        (fail: string) => {
          console.error('Failed to read SMS:', fail);
          reject(new Error(fail));
        },
        async (count: number, smsList: string) => {
          try {
            const messages = JSON.parse(smsList);
            let transactionCount = 0;

            for (const sms of messages) {
              const parsedTransaction = parseSMS(sms.address, sms.body);
              
              if (parsedTransaction) {
                // Add date from SMS
                parsedTransaction.date = new Date(sms.date).toISOString();
                
                try {
                  await addTransaction(userId, parsedTransaction);
                  transactionCount++;
                } catch (error) {
                  console.log('Transaction already exists or error:', error);
                }
              }
            }

            console.log(`Parsed ${transactionCount} transactions from SMS`);
            resolve({success: true, count: transactionCount});
          } catch (error) {
            reject(error);
          }
        },
      );
    });
  } catch (error) {
    console.error('Error reading SMS:', error);
    return {success: false, count: 0};
  }
};

