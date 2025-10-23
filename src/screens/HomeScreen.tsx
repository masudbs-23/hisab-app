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
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {
  getUserTransactions,
  getCurrentBalance,
  addTransaction,
  getUserCards,
  updateCardBalance,
} from '../services/DatabaseService';
import {readAndParseSMS, requestSMSPermission, testSMSParsing} from '../services/SMSService';
import Button from '../components/Button';
import Input from '../components/Input';
import LanguageSwitch from '../components/LanguageSwitch';

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
  const [balanceVisible, setBalanceVisible] = useState(false);
  
  // Add Transaction Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [cardError, setCardError] = useState('');
  const addSlideAnim = useState(new Animated.Value(height))[0];
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  
  // Language state
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  
  // Title suggestions
  const expenseSuggestions = ['Rent', 'Travel', 'Shopping', 'Food', 'Bills', 'Entertainment', 'Health', 'Education'];
  const incomeSuggestions = ['Salary', 'Part-time', 'Freelance', 'Business', 'Investment', 'Gift', 'Bonus'];
  
  // Month Filter
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  useEffect(() => {
    loadData();
    loadCards();
    requestSMSAccess();
  }, []);

  const loadCards = async () => {
    if (!user) return;
    try {
      const userCards = await getUserCards(user.id);
      setCards(userCards);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

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
    setCardError('');
    setShowSuggestions(false);
    setSelectedCard(null);
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
      setCardError('');
      setShowSuggestions(false);
      setSelectedCard(null);
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

    if (!selectedCard) {
      setCardError('Please select a card');
      isValid = false;
    } else {
      setCardError('');
    }

    return isValid;
  };

  const handleSaveTransaction = async () => {
    if (!validateInputs() || !user || !selectedCard) return;

    try {
      const transactionAmount = parseFloat(amount);
      
      // Update card balance
      let newBalance = selectedCard.balance;
      if (transactionType === 'income') {
        newBalance += transactionAmount;
      } else {
        newBalance -= transactionAmount;
      }
      
      await updateCardBalance(selectedCard.id, newBalance);
      
      const transaction = {
        type: transactionType,
        amount: transactionAmount,
        description: title,
        date: new Date().toISOString(),
        category: transactionType === 'income' ? 'Income' : 'Expense',
        bank: selectedCard.cardType,
        cardId: selectedCard.id,
        method: 'Manual',
        status: 'Completed',
        trxId: `MANUAL-${Date.now()}`,
        fee: 0,
        balance: newBalance,
      };

      await addTransaction(user.id, transaction);
      
      Alert.alert(
        'Success',
        `${transactionType === 'income' ? 'Income' : 'Expense'} added successfully!`,
      );

      closeAddModal();
      loadData();
      loadCards();
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
      <Text style={styles.balanceTitle}>Balance</Text>
      <View style={styles.balanceRow}>
        <Text
          style={[
            styles.balanceAmount,
            summary.balance >= 0 ? styles.incomeAmount : styles.expenseAmount,
          ]}>
          {balanceVisible ? formatCurrency(Math.abs(summary.balance)) : '৳ •••••'}
        </Text>
        <TouchableOpacity 
          onPress={() => setBalanceVisible(!balanceVisible)}
          style={styles.eyeButton}>
          <Icon 
            name={balanceVisible ? "eye-outline" : "eye-off-outline"} 
            size={24} 
            color="#636e72" 
          />
        </TouchableOpacity>
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
                
                {/* Card Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Select Card</Text>
                  {cards.length === 0 ? (
                    <View style={styles.noCardsContainer}>
                      <Icon name="card-outline" size={40} color="#b2bec3" />
                      <Text style={styles.noCardsText}>No cards available</Text>
                      <Text style={styles.noCardsSubText}>Add a card from the Cards tab first</Text>
                    </View>
                  ) : (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.cardSelector}>
                      {cards.map((card: any) => (
                        <TouchableOpacity
                          key={card.id}
                          style={[
                            styles.cardOption,
                            {backgroundColor: card.color},
                            selectedCard?.id === card.id && styles.cardOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedCard(card);
                            if (cardError) setCardError('');
                          }}
                          activeOpacity={0.8}>
                          <View style={styles.cardOptionHeader}>
                            <Icon name="hardware-chip-outline" size={28} color="rgba(255,255,255,0.6)" />
                            {selectedCard?.id === card.id && (
                              <View style={styles.selectedBadge}>
                                <Icon name="checkmark-circle" size={24} color="#fff" />
                              </View>
                            )}
                          </View>
                          <Text style={styles.cardOptionType}>{card.cardType}</Text>
                          <Text style={styles.cardOptionName}>{card.cardName}</Text>
                          <View style={styles.cardOptionBalanceContainer}>
                            <Text style={styles.cardOptionBalanceLabel}>Balance</Text>
                            <Text style={styles.cardOptionBalance}>
                              ৳{card.balance.toLocaleString('en-BD')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                  <View style={styles.errorTextContainer}>
                    {cardError ? <Text style={styles.errorText}>{cardError}</Text> : null}
                  </View>
                </View>

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
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#e8f8f5"
        translucent={false}
      />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'D'}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.userName}>
              {user?.name || 'Demo User'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <LanguageSwitch 
            value={language} 
            onValueChange={setLanguage}
          />
        </View>
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
            <Icon name="add-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Add Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.expenseButton]}
            onPress={() => openAddModal('expense')}>
            <Icon name="remove-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.statisticsButton]}
            onPress={() => navigation.navigate('Statistics')}>
            <Icon name="stats-chart" size={20} color="#fff" />
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
    backgroundColor: '#FFFFFF',
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
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 15,
  },
  incomeAmount: {
    color: '#27ae60',
  },
  expenseAmount: {
    color: '#e74c3c',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  transactionsCount: {
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
    color: '#636e72',
  },
  amount: {
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#636e72',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 13,
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
    fontSize: 18,
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
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d3436',
  },
  modalDescription: {
    fontSize: 14,
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
    fontSize: 16,
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
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 70,
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
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
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
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 14,
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
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: '600',
  },
  // Card Selector
  cardSelector: {
    marginVertical: 10,
  },
  cardOption: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
    justifyContent: 'space-between',
  },
  cardOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{scale: 1.03}],
  },
  cardOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardOptionType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardOptionName: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardOptionBalanceContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 10,
  },
  cardOptionBalanceLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    letterSpacing: 1,
    fontWeight: '600',
  },
  cardOptionBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  selectedBadge: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  noCardsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderStyle: 'dashed',
  },
  noCardsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
    marginTop: 10,
  },
  noCardsSubText: {
    fontSize: 12,
    color: '#b2bec3',
    marginTop: 5,
    textAlign: 'center',
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
