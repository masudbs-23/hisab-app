import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'Hisab.db';

let db: any;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabase({
      name: database_name,
      location: 'default',
    });
    console.log('Database opened successfully');
    await createTables();
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

const createTables = async () => {
  try {
    // Users table
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        phone TEXT,
        profile_image TEXT,
        is_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    );
    
    // Check if columns exist, if not add them (for existing databases)
    try {
      await db.executeSql('ALTER TABLE users ADD COLUMN name TEXT');
    } catch (e) {
      // Column already exists
    }
    try {
      await db.executeSql('ALTER TABLE users ADD COLUMN phone TEXT');
    } catch (e) {
      // Column already exists
    }
    try {
      await db.executeSql('ALTER TABLE users ADD COLUMN profile_image TEXT');
    } catch (e) {
      // Column already exists
    }
    
    // Cards table
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        card_type TEXT NOT NULL,
        card_name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        card_number TEXT,
        color TEXT DEFAULT '#00b894',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
    );
    
    // Transactions table
    await db.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        card_id INTEGER,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT,
        balance REAL DEFAULT 0,
        bank TEXT,
        card_no TEXT,
        trx_id TEXT UNIQUE,
        fee REAL DEFAULT 0,
        method TEXT,
        status TEXT DEFAULT 'Completed',
        recipient TEXT,
        account_no TEXT,
        sms_body TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (card_id) REFERENCES cards(id)
      )`,
    );
    
    // Try to add card_id column if it doesn't exist (for existing databases)
    try {
      await db.executeSql('ALTER TABLE transactions ADD COLUMN card_id INTEGER');
    } catch (e) {
      // Column already exists
    }
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

export const registerUser = async (email: string, password: string) => {
  try {
    // Check if user already exists
    const checkResult = await db.executeSql(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );

    if (checkResult[0].rows.length > 0) {
      throw new Error('User already exists');
    }

    // Insert new user
    const result = await db.executeSql(
      'INSERT INTO users (email, password, is_verified) VALUES (?, ?, 0)',
      [email, password],
    );

    console.log('User registered successfully');
    return {
      success: true,
      userId: result[0].insertId,
    };
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    // Fixed OTP is 1234
    if (otp !== '1234') {
      throw new Error('Invalid OTP');
    }

    // Update user verification status
    await db.executeSql(
      'UPDATE users SET is_verified = 1 WHERE email = ?',
      [email],
    );

    console.log('User verified successfully');
    return {success: true};
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const result = await db.executeSql(
      'SELECT * FROM users WHERE email = ? AND password = ? AND is_verified = 1',
      [email, password],
    );

    if (result[0].rows.length === 0) {
      throw new Error('Invalid email or password, or account not verified');
    }

    const user = result[0].rows.item(0);
    console.log('User logged in successfully');
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        profileImage: user.profile_image,
      },
    };
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const checkUserExists = async (email: string) => {
  try {
    const result = await db.executeSql(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    return result[0].rows.length > 0;
  } catch (error) {
    console.error('Error checking user:', error);
    return false;
  }
};

export const addTransaction = async (userId: number, transaction: any) => {
  try {
    await db.executeSql(
      `INSERT INTO transactions (
        user_id, card_id, type, amount, description, date, category, balance,
        bank, card_no, trx_id, fee, method, status, recipient, account_no, sms_body
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        transaction.cardId || null,
        transaction.type,
        transaction.amount,
        transaction.description,
        transaction.date,
        transaction.category || '',
        transaction.balance || 0,
        transaction.bank || '',
        transaction.cardNo || '',
        transaction.trxId || '',
        transaction.fee || 0,
        transaction.method || '',
        transaction.status || 'Completed',
        transaction.recipient || '',
        transaction.accountNo || '',
        transaction.smsBody || '',
      ],
    );
    console.log('Transaction added successfully');
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      console.log('Transaction already exists (duplicate trxId)');
    } else {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }
};

export const getUserTransactions = async (userId: number) => {
  try {
    const result = await db.executeSql(
      `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC`,
      [userId],
    );
    
    const transactions = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      transactions.push({
        id: row.id.toString(),
        type: row.type,
        amount: row.amount,
        description: row.description,
        date: row.date,
        category: row.category,
        balance: row.balance,
        bank: row.bank,
        cardNo: row.card_no,
        trxId: row.trx_id,
        fee: row.fee,
        method: row.method,
        status: row.status,
        recipient: row.recipient,
        accountNo: row.account_no,
      });
    }
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const getCurrentBalance = async (userId: number) => {
  try {
    const result = await db.executeSql(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
       FROM transactions WHERE user_id = ?`,
      [userId],
    );
    
    if (result[0].rows.length > 0) {
      const row = result[0].rows.item(0);
      const income = row.total_income || 0;
      const expense = row.total_expense || 0;
      return {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
      };
    }
    return {totalIncome: 0, totalExpense: 0, balance: 0};
  } catch (error) {
    console.error('Error calculating balance:', error);
    return {totalIncome: 0, totalExpense: 0, balance: 0};
  }
};

export const getUserProfile = async (userId: number) => {
  try {
    const result = await db.executeSql(
      'SELECT id, email, name, phone, profile_image FROM users WHERE id = ?',
      [userId],
    );
    
    if (result[0].rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result[0].rows.item(0);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      profileImage: user.profile_image,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: number,
  name: string,
  phone: string,
  profileImage?: string,
) => {
  try {
    let query = 'UPDATE users SET name = ?, phone = ?';
    let params: any[] = [name, phone];
    
    if (profileImage !== undefined) {
      query += ', profile_image = ?';
      params.push(profileImage);
    }
    
    query += ' WHERE id = ?';
    params.push(userId);
    
    await db.executeSql(query, params);
    
    console.log('User profile updated successfully');
    return {success: true};
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Card Management Functions
export const addCard = async (userId: number, card: any) => {
  try {
    await db.executeSql(
      `INSERT INTO cards (user_id, card_type, card_name, balance, card_number, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        card.cardType,
        card.cardName,
        card.balance || 0,
        card.cardNumber || '',
        card.color || '#00b894',
      ],
    );
    console.log('Card added successfully');
  } catch (error) {
    console.error('Error adding card:', error);
    throw error;
  }
};

export const getUserCards = async (userId: number) => {
  try {
    const result = await db.executeSql(
      'SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
    );
    
    const cards = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      cards.push({
        id: row.id,
        cardType: row.card_type,
        cardName: row.card_name,
        balance: row.balance,
        cardNumber: row.card_number,
        color: row.color,
      });
    }
    return cards;
  } catch (error) {
    console.error('Error getting cards:', error);
    return [];
  }
};

export const updateCardBalance = async (cardId: number, newBalance: number) => {
  try {
    await db.executeSql(
      'UPDATE cards SET balance = ? WHERE id = ?',
      [newBalance, cardId],
    );
    console.log('Card balance updated successfully');
  } catch (error) {
    console.error('Error updating card balance:', error);
    throw error;
  }
};

export const deleteCard = async (cardId: number) => {
  try {
    await db.executeSql('DELETE FROM cards WHERE id = ?', [cardId]);
    console.log('Card deleted successfully');
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};

export const getCardBalance = async (cardId: number) => {
  try {
    const result = await db.executeSql(
      'SELECT balance FROM cards WHERE id = ?',
      [cardId],
    );
    
    if (result[0].rows.length > 0) {
      return result[0].rows.item(0).balance;
    }
    return 0;
  } catch (error) {
    console.error('Error getting card balance:', error);
    return 0;
  }
};

export const closeDatabase = async () => {
  if (db) {
    await db.close();
    console.log('Database closed');
  }
};

