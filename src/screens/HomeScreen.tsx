import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {
  getUserTransactions,
  getCurrentBalance,
  addTransaction,
} from '../services/DatabaseService';
import {readAndParseSMS, requestSMSPermission, testSMSParsing} from '../services/SMSService';
import Button from '../components/Button';
import Input from '../components/Input';

const {width, height} = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: string;
  balance: number;
  bank: string;
  cardNo?: string;
  trxId: string;
  fee: number;
  method: string;
  status: string;
  recipient?: string;
  accountNo?: string;
}

const HomeScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];
  
  // Add Transaction Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');
  const addSlideAnim = useState(new Animated.Value(height))[0];
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Title suggestions
  const expenseSuggestions = ['Rent', 'Travel', 'Shopping', 'Food', 'Bills', 'Entertainment', 'Health', 'Education'];
  const incomeSuggestions = ['Salary', 'Part-time', 'Freelance', 'Business', 'Investment', 'Gift', 'Bonus'];
  
  // Month Filter
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  useEffect(() => {
    loadData();
    requestSMSAccess();
  }, []);

  const requestSMSAccess = async () => {
    const hasPermission = await requestSMSPermission();
    if (hasPermission && user) {
      syncSMSTransactions();
    }
  };

  const handleTestParsing = () => {
    console.log('Running SMS parsing test...');
    testSMSParsing();
    Alert.alert(
      'Test Running',
      'Check console logs (Metro bundler) to see test results',
    );
  };

  const syncSMSTransactions = async () => {
    if (!user) return;
    
    try {
      console.log('Starting SMS sync...');
      const result: any = await readAndParseSMS(user.id);
      console.log('SMS sync result:', result);
      
      if (result.success) {
        if (result.count > 0) {
          Alert.alert(
            'Success',
            `${result.count} transactions synced from SMS`,
          );
          loadData();
        } else {
          Alert.alert(
            'Info',
            'No new transactions found. Please check:\n1. You have bKash SMS\n2. SMS permission is granted',
          );
        }
      } else {
        Alert.alert(
          'Error',
          'Failed to read SMS. Please check SMS permission.',
        );
      }
    } catch (error: any) {
      console.error('Error syncing SMS:', error);
      Alert.alert(
        'Error',
        `Error syncing SMS: ${error.message || error}`,
      );
    }
  };

  const loadData = async () => {
    if (!user) return;

    try {
      const [txns, balance] = await Promise.all([
        getUserTransactions(user.id),
        getCurrentBalance(user.id),
      ]);

      setTransactions(txns);
      setFilteredTransactions(txns);
      setSummary(balance);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    filterTransactionsByMonth();
  }, [selectedMonth, transactions]);

  const filterTransactionsByMonth = () => {
    if (selectedMonth === 'all') {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      const txnMonthYear = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`;
      return txnMonthYear === selectedMonth;
    });
    setFilteredTransactions(filtered);
  };

  const getAvailableMonths = () => {
    const months = new Set<string>();
    transactions.forEach(txn => {
      const date = new Date(txn.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthYear);
    });
    return Array.from(months).sort().reverse();
  };

  const formatMonthDisplay = (monthStr: string) => {
    if (monthStr === 'all') return 'All Transactions';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const openAddModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setTitle('');
    setAmount('');
    setTitleError('');
    setAmountError('');
    setShowSuggestions(false);
    setAddModalVisible(true);
    Animated.timing(addSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setTitle(suggestion);
    setShowSuggestions(false);
    if (titleError) {
      setTitleError('');
    }
  };

  const closeAddModal = () => {
    Animated.timing(addSlideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setAddModalVisible(false);
      setTitle('');
      setAmount('');
      setTitleError('');
      setAmountError('');
      setShowSuggestions(false);
    });
  };

  const validateInputs = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!amount.trim()) {
      setAmountError('Amount is required');
      isValid = false;
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError('Please enter a valid amount');
      isValid = false;
    } else {
      setAmountError('');
    }

    return isValid;
  };

  const handleSaveTransaction = async () => {
    if (!validateInputs() || !user) return;

    try {
      const transaction = {
        type: transactionType,
        amount: parseFloat(amount),
        description: title,
        date: new Date().toISOString(),
        category: transactionType === 'income' ? 'Income' : 'Expense',
        bank: 'Manual Entry',
        method: 'Manual',
        status: 'Completed',
        trxId: `MANUAL-${Date.now()}`,
        fee: 0,
        balance: 0,
      };

      await addTransaction(user.id, transaction);
      
      Alert.alert(
        'Success',
        `${transactionType === 'income' ? 'Income' : 'Expense'} added successfully!`,
      );

      closeAddModal();
      loadData();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      Alert.alert(
        'Error',
        'Failed to add transaction. Please try again.',
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await syncSMSTransactions();
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', {minimumFractionDigits: 2})}`;
  };

  const openModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedTransaction(null);
    });
  };

  const TransactionCard = ({item}: {item: Transaction}) => (
    <TouchableOpacity
      style={[
        styles.transactionCard,
        item.type === 'income' ? styles.incomeCard : styles.expenseCard,
      ]}
      onPress={() => openModal(item)}
      activeOpacity={0.7}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <Text
          style={[
            styles.amount,
            item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
          ]}>
          {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
        </Text>
      </View>

      <View style={styles.transactionDetails}>
        <View
          style={[
            styles.typeBadge,
            item.type === 'income' ? styles.incomeBadge : styles.expenseBadge,
          ]}>
          <Text style={styles.typeText}>
            {item.type === 'income' ? 'Income' : 'Expense'}
          </Text>
        </View>
        <Text style={styles.bank}>{item.bank}</Text>
      </View>
    </TouchableOpacity>
  );

  const SummaryCard = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Financial Summary</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryAmount, styles.incomeAmount]}>
            +{formatCurrency(summary.totalIncome)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={[styles.summaryAmount, styles.expenseAmount]}>
            -{formatCurrency(summary.totalExpense)}
          </Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Net Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            summary.balance >= 0 ? styles.incomeAmount : styles.expenseAmount,
          ]}>
          {formatCurrency(Math.abs(summary.balance))}
        </Text>
      </View>
    </View>
  );

  const AddTransactionModal = () => (
    <Modal
      animationType="none"
      transparent={true}
      visible={addModalVisible}
      onRequestClose={closeAddModal}>
      <TouchableWithoutFeedback onPress={closeAddModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {transform: [{translateY: addSlideAnim}]},
              ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Add {transactionType === 'income' ? 'Income' : 'Expense'}
                </Text>
                <TouchableOpacity
                  onPress={closeAddModal}
                  style={styles.closeButton}>
                  <Icon name="close" size={24} color="#636e72" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalBody} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Title</Text>
                  
                  <View>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => setShowSuggestions(!showSuggestions)}>
                      <TextInput
                        style={[styles.textInput, titleError && styles.inputError]}
                        placeholder="Select or enter title"
                        placeholderTextColor="#b2bec3"
                        value={title}
                        onChangeText={(text) => {
                          setTitle(text);
                          if (titleError && text.trim()) {
                            setTitleError('');
                          }
                        }}
                        autoCorrect={false}
                        autoCapitalize="sentences"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onFocus={() => setShowSuggestions(true)}
                      />
                      <Icon
                        name={showSuggestions ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#636e72"
                        style={styles.dropdownIcon}
                      />
                    </TouchableOpacity>
                    
                    {/* Dropdown Suggestions */}
                    {showSuggestions && (
                      <View style={styles.dropdownContainer}>
                        <ScrollView
                          style={styles.dropdownScroll}
                          nestedScrollEnabled={true}
                          showsVerticalScrollIndicator={false}>
                          {(transactionType === 'expense' ? expenseSuggestions : incomeSuggestions).map((suggestion, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.dropdownItem}
                              onPress={() => handleSuggestionSelect(suggestion)}
                              activeOpacity={0.7}>
                              <Icon
                                name={transactionType === 'income' ? "trending-up" : "trending-down"}
                                size={18}
                                color={transactionType === 'income' ? "#00b894" : "#e74c3c"}
                              />
                              <Text style={styles.dropdownItemText}>{suggestion}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.errorTextContainer}>
                    {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Amount (৳)</Text>
                  <TextInput
                    style={[styles.textInput, amountError && styles.inputError]}
                    placeholder="Enter amount"
                    placeholderTextColor="#b2bec3"
                    value={amount}
                    onChangeText={(text) => {
                      setAmount(text);
                      if (amountError && text.trim()) {
                        setAmountError('');
                      }
                    }}
                    onFocus={() => setShowSuggestions(false)}
                    keyboardType="numeric"
                    autoCorrect={false}
                    returnKeyType="done"
                  />
                  <View style={styles.errorTextContainer}>
                    {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeAddModal}
                    activeOpacity={0.8}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, transactionType === 'income' ? styles.incomeButton : styles.expenseButton]}
                    onPress={handleSaveTransaction}
                    activeOpacity={0.8}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const TransactionModal = () => (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {transform: [{translateY: slideAnim}]},
              ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Transaction Details</Text>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}>
                  <Icon name="close" size={24} color="#636e72" />
                </TouchableOpacity>
              </View>

              {selectedTransaction && (
                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}>
                  <View
                    style={[
                      styles.amountSection,
                      selectedTransaction.type === 'income'
                        ? styles.incomeBackground
                        : styles.expenseBackground,
                    ]}>
                    <Text style={styles.modalAmount}>
                      {selectedTransaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(selectedTransaction.amount)}
                    </Text>
                    <Text style={styles.modalDescription}>
                      {selectedTransaction.description}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        selectedTransaction.type === 'income'
                          ? styles.incomeBadge
                          : styles.expenseBadge,
                      ]}>
                      <Text style={styles.statusText}>
                        {selectedTransaction.type === 'income'
                          ? 'Income'
                          : 'Expense'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Transaction Info</Text>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedTransaction.date)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Bank/Service</Text>
                      <Text style={styles.detailValue}>
                        {selectedTransaction.bank}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>
                        {selectedTransaction.category}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Method</Text>
                      <Text style={styles.detailValue}>
                        {selectedTransaction.method}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={[styles.detailValue, styles.statusCompleted]}>
                        {selectedTransaction.status}
                      </Text>
                    </View>

                    {selectedTransaction.trxId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.trxId}
                        </Text>
                      </View>
                    )}

                    {selectedTransaction.cardNo && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Card Number</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.cardNo}
                        </Text>
                      </View>
                    )}

                    {selectedTransaction.accountNo && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Number</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.accountNo}
                        </Text>
                      </View>
                    )}

                    {selectedTransaction.recipient && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Recipient</Text>
                        <Text style={styles.detailValue}>
                          {selectedTransaction.recipient}
                        </Text>
                      </View>
                    )}

                    {selectedTransaction.fee !== undefined && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fee</Text>
                        <Text style={styles.detailValue}>
                          {formatCurrency(selectedTransaction.fee)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Balance</Text>
                      <Text style={[styles.detailValue, styles.balanceValue]}>
                        {formatCurrency(selectedTransaction.balance)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.screenContainer} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Welcome</Text>
            <Text style={styles.userName}>
              {user?.email?.split('@')[0] || 'User'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.syncButton}
          onPress={syncSMSTransactions}
          onLongPress={handleTestParsing}>
          <Icon name="sync-outline" size={24} color="#00b894" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00b894']} />
        }>
        <SummaryCard />

        {/* Add Income, Expense, and Statistics Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.incomeButton]}
            onPress={() => openAddModal('income')}>
            <Icon name="add-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Add Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.expenseButton]}
            onPress={() => openAddModal('expense')}>
            <Icon name="remove-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.statisticsButton]}
            onPress={() => navigation.navigate('Statistics')}>
            <Icon name="stats-chart" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Statistics</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsHeaderRow}>
          <View>
            <Text style={styles.transactionsTitle}>Transactions</Text>
            <Text style={styles.transactionsCount}>
              {filteredTransactions.length} found
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowMonthFilter(!showMonthFilter)}>
            <Icon name="filter" size={18} color="#00b894" />
            <Text style={styles.filterButtonText}>
              {formatMonthDisplay(selectedMonth)}
            </Text>
            <Icon name={showMonthFilter ? "chevron-up" : "chevron-down"} size={18} color="#00b894" />
          </TouchableOpacity>
        </View>

        {showMonthFilter && (
          <View style={styles.monthFilterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.monthChip, selectedMonth === 'all' && styles.monthChipActive]}
                onPress={() => {
                  setSelectedMonth('all');
                  setShowMonthFilter(false);
                }}>
                <Text style={[styles.monthChipText, selectedMonth === 'all' && styles.monthChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {getAvailableMonths().map(month => (
                <TouchableOpacity
                  key={month}
                  style={[styles.monthChip, selectedMonth === month && styles.monthChipActive]}
                  onPress={() => {
                    setSelectedMonth(month);
                    setShowMonthFilter(false);
                  }}>
                  <Text style={[styles.monthChipText, selectedMonth === month && styles.monthChipTextActive]}>
                    {formatMonthDisplay(month)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            renderItem={({item}) => <TransactionCard item={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.transactionsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="wallet-outline" size={80} color="#dfe6e9" />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>
              {selectedMonth === 'all' 
                ? 'Add income or expense to get started'
                : 'No transactions in this month'}
            </Text>
          </View>
        )}
      </ScrollView>

      <AddTransactionModal />
      <TransactionModal />

      <View style={styles.decorativeElements} pointerEvents="none">
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fffe',
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00b894',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  syncButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#27ae60',
  },
  expenseAmount: {
    color: '#e74c3c',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 8,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  transactionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    marginTop: 10,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  transactionsCount: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },
  transactionsList: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  transactionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  incomeCard: {
    // No special styling
  },
  expenseCard: {
    // No special styling
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#636e72',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  incomeBadge: {
    backgroundColor: '#d5f4e6',
  },
  expenseBadge: {
    backgroundColor: '#fdeaea',
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  bank: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#636e72',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#b2bec3',
    marginTop: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
  },
  amountSection: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  incomeBackground: {
    backgroundColor: '#d5f4e6',
  },
  expenseBackground: {
    backgroundColor: '#fdeaea',
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d3436',
  },
  modalDescription: {
    fontSize: 16,
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  detailsSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  detailLabel: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statusCompleted: {
    color: '#27ae60',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00b894',
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 100,
  },
  incomeButton: {
    backgroundColor: '#27ae60',
  },
  expenseButton: {
    backgroundColor: '#e74c3c',
  },
  statisticsButton: {
    backgroundColor: '#4A90E2',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  // Filter
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d5f4e6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#00b894',
    fontWeight: '600',
    maxWidth: 120,
  },
  monthFilterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  monthChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  monthChipActive: {
    backgroundColor: '#00b894',
    borderColor: '#00b894',
  },
  monthChipText: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '600',
  },
  monthChipTextActive: {
    color: '#fff',
  },
  // Add Transaction Modal
  inputContainer: {
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    paddingRight: 40,
    fontSize: 16,
    color: '#2d3436',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#2d3436',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1.5,
  },
  errorTextContainer: {
    minHeight: 20,
    marginBottom: 10,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  cancelButtonText: {
    color: '#636e72',
    fontSize: 16,
    fontWeight: '600',
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#00b894',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#00a085',
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#00b894',
    top: height * 0.3,
    right: -50,
  },
});

export default HomeScreen;
