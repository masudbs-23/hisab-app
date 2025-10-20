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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {
  getUserTransactions,
  getCurrentBalance,
} from '../services/DatabaseService';
import {readAndParseSMS, requestSMSPermission, testSMSParsing} from '../services/SMSService';

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

const HomeScreen = () => {
  const {user} = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
            'সফল / Success',
            `${result.count} টি লেনদেন SMS থেকে যোগ হয়েছে\n${result.count} transactions synced from SMS`,
          );
          loadData();
        } else {
          Alert.alert(
            'তথ্য / Info',
            'কোনো নতুন লেনদেন পাওয়া যায়নি। নিশ্চিত করুন:\n\n1. Phone এ bKash SMS আছে\n2. SMS permission দেওয়া আছে\n\nNo new transactions found. Please check:\n1. You have bKash SMS\n2. SMS permission is granted',
          );
        }
      } else {
        Alert.alert(
          'ত্রুটি / Error',
          'SMS পড়তে সমস্যা হয়েছে। SMS permission দিয়েছেন কিনা চেক করুন।\n\nFailed to read SMS. Please check SMS permission.',
        );
      }
    } catch (error: any) {
      console.error('Error syncing SMS:', error);
      Alert.alert(
        'ত্রুটি / Error',
        `SMS sync করতে সমস্যা: ${error.message || error}\n\nError syncing SMS`,
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
      setSummary(balance);
    } catch (error) {
      console.error('Error loading data:', error);
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

        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          <Text style={styles.transactionsCount}>
            {transactions.length} Transactions
          </Text>
        </View>

        {transactions.length > 0 ? (
          <FlatList
            data={transactions.slice(0, 10)}
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
              Pull down to sync SMS transactions
            </Text>
          </View>
        )}
      </ScrollView>

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
  transactionsHeader: {
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
  },
  transactionsCount: {
    fontSize: 14,
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8f8f8',
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
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
