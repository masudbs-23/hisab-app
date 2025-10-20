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
    // Cash In from number: "Cash In Tk 3,045.00 from 01851528913 successful..."
    cashInFrom: /Cash In Tk\s*([\d,]+\.?\d*)\s+from\s+([\d]+)\s+successful.*TrxID\s+(\w+)/i,
    // Received Deposit: "You have received deposit of Tk 550.00 from..."
    receivedDeposit: /received deposit of Tk\s*([\d,]+\.?\d*).*from\s+(.+?)\s*\..*TrxID\s+(\w+)/i,
    // Bill Payment: "Bill Payment of Tk 50.00 for..."
    billPayment: /Bill Payment of Tk\s*([\d,]+\.?\d*)\s+for\s+(.+?)\s+is successful.*TrxID\s+(\w+)/i,
    // Send Money: "Send Money Tk 250.00 to 01621161449..."
    sendMoney: /Send Money Tk\s*([\d,]+\.?\d*)\s+to\s+([\d]+)\s+successful.*TrxID\s+(\w+)/i,
    // Payment/Send Money: "Tk550.00 sent to BKASH.COM..."
    payment: /Tk([\d,]+\.?\d*)\s+sent\s+to\s+(.+?)\s+.*TrxID\s+(\w+)/i,
    // Cash In: "Tk550.00 deposited..."
    cashIn: /Tk([\d,]+\.?\d*)\s+deposited.*TrxID\s+(\w+)/i,
    // Balance: "Balance Tk 557.40"
    balance: /Balance Tk\s*([\d,]+\.?\d*)/i,
    // Fee: "Fee Tk 0.00"
    fee: /Fee Tk\s*([\d,]+\.?\d*)/i,
  };

  let transaction: any = null;

  // Check Cash In from number (Income)
  const cashInFromMatch = body.match(patterns.cashInFrom);
  if (cashInFromMatch) {
    const amount = parseFloat(cashInFromMatch[1].replace(/,/g, ''));
    const phoneNumber = cashInFromMatch[2];
    const trxId = cashInFromMatch[3];
    const balanceMatch = body.match(patterns.balance);
    const feeMatch = body.match(patterns.fee);

    transaction = {
      type: 'income',
      amount,
      description: `Cash In from ${phoneNumber}`,
      trxId,
      bank: 'bKash',
      method: 'Cash In',
      category: 'Cash In',
      recipient: phoneNumber,
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : 0,
      smsBody: body,
    };
  }

  // Check Received Deposit (Income)
  const receivedDepositMatch = body.match(patterns.receivedDeposit);
  if (receivedDepositMatch && !transaction) {
    const amount = parseFloat(receivedDepositMatch[1].replace(/,/g, ''));
    const source = receivedDepositMatch[2].trim();
    const trxId = receivedDepositMatch[3];
    const balanceMatch = body.match(patterns.balance);
    const feeMatch = body.match(patterns.fee);

    transaction = {
      type: 'income',
      amount,
      description: `Received from ${source}`,
      trxId,
      bank: 'bKash',
      method: 'Received Deposit',
      category: 'Deposit',
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : 0,
      smsBody: body,
    };
  }

  // Check Bill Payment (Expense)
  const billPaymentMatch = body.match(patterns.billPayment);
  if (billPaymentMatch && !transaction) {
    const amount = parseFloat(billPaymentMatch[1].replace(/,/g, ''));
    const billFor = billPaymentMatch[2].trim();
    const trxId = billPaymentMatch[3];
    const balanceMatch = body.match(patterns.balance);
    const feeMatch = body.match(patterns.fee);

    transaction = {
      type: 'expense',
      amount,
      description: `Bill Payment for ${billFor}`,
      trxId,
      bank: 'bKash',
      method: 'Bill Payment',
      category: 'Bill Payment',
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : 0,
      smsBody: body,
    };
  }

  // Check Send Money (Expense)
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

  // Check Payment (Expense) - Old format
  const paymentMatch = body.match(patterns.payment);
  if (paymentMatch && !transaction) {
    const amount = parseFloat(paymentMatch[1].replace(/,/g, ''));
    const merchant = paymentMatch[2].trim();
    const trxId = paymentMatch[3];
    const balanceMatch = body.match(patterns.balance);
    const feeMatch = body.match(patterns.fee);

    transaction = {
      type: 'expense',
      amount,
      description: `Payment to ${merchant}`,
      trxId,
      bank: 'bKash',
      method: 'Payment',
      category: 'Shopping',
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : 0,
      smsBody: body,
    };
  }

  // Check Cash In (Income) - Old format
  const cashInMatch = body.match(patterns.cashIn);
  if (cashInMatch && !transaction) {
    const amount = parseFloat(cashInMatch[1].replace(/,/g, ''));
    const trxId = cashInMatch[2];
    const balanceMatch = body.match(patterns.balance);

    transaction = {
      type: 'income',
      amount,
      description: 'Cash In to bKash',
      trxId,
      bank: 'bKash',
      method: 'Cash In',
      category: 'Deposit',
      balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
      fee: 0,
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
  console.log('SMS Address:', address, 'Body preview:', body.substring(0, 50));
  
  // Check if sender is from a bank
  const isBank = BANK_SENDERS.some(sender =>
    address.toUpperCase().includes(sender.toUpperCase()),
  );

  if (!isBank) {
    console.log('Not a bank sender');
    return null;
  }

  console.log('Bank SMS detected from:', address);

  // Try to parse based on bank
  if (address.toUpperCase().includes('BKASH')) {
    const result = parseBkashSMS(body);
    console.log('bKash parse result:', result ? 'SUCCESS' : 'FAILED');
    return result;
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

            console.log(`Total SMS read: ${messages.length}`);

            for (const sms of messages) {
              console.log('Processing SMS from:', sms.address);
              const parsedTransaction = parseSMS(sms.address, sms.body);
              
              if (parsedTransaction) {
                console.log('Transaction parsed:', parsedTransaction.description, parsedTransaction.amount);
                // Add date from SMS
                parsedTransaction.date = new Date(sms.date).toISOString();
                
                try {
                  await addTransaction(userId, parsedTransaction);
                  transactionCount++;
                  console.log('Transaction added successfully');
                } catch (error) {
                  console.log('Transaction already exists or error:', error);
                }
              }
            }

            console.log(`Parsed ${transactionCount} transactions from ${messages.length} SMS`);
            resolve({success: true, count: transactionCount});
          } catch (error) {
            console.error('Error parsing SMS list:', error);
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

// Test function to verify SMS parsing
export const testSMSParsing = () => {
  const testMessages = [
    {
      address: 'bKash',
      body: 'Cash In Tk 3,045.00 from 01851528913 successful. Fee Tk 0.00. Balance Tk 10,601.71. TrxID CIP6OK01LU at 25/09/2025 12:09.',
    },
    {
      address: 'bKash',
      body: 'You have received deposit of Tk 550.00 from Amex Card. Fee Tk 0.00. Balance Tk 557.40. TrxID CJK3FL5BBF at 20/10/2025 10:45',
    },
    {
      address: 'bKash',
      body: 'Bill Payment of Tk 50.00 for VISA Credit Card is successful. Fee Tk 0.74. Balance Tk 25.90. TrxID CJI5E7812X at 18/10/2025 20:17',
    },
    {
      address: 'bKash',
      body: 'Send Money Tk 250.00 to 01621161449 successful. Ref 1. Fee Tk 0.00. Balance Tk 44.97. TrxID CJF8BLXLD4 at 15/10/2025 23:42',
    },
  ];

  console.log('===== Testing SMS Parsing =====');
  testMessages.forEach((msg, index) => {
    console.log(`\nTest ${index + 1}:`);
    console.log('Address:', msg.address);
    console.log('Body:', msg.body.substring(0, 100));
    const result = parseSMS(msg.address, msg.body);
    console.log('Result:', result);
    if (result) {
      console.log('Type:', result.type, '| Amount:', result.amount, '| Description:', result.description);
    }
  });
  console.log('===== Test Complete =====');
};

