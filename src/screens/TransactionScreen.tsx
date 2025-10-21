import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {getUserTransactions} from '../services/DatabaseService';

const {height} = Dimensions.get('window');

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

const TransactionScreen = () => {
  const {user} = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactionsByMonth();
  }, [selectedMonth, transactions]);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      const txns = await getUserTransactions(user.id);
      setTransactions(txns);
      setFilteredTransactions(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

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
    if (monthStr === 'all') return 'All';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowMonthFilter(!showMonthFilter)}>
          <Icon name="filter" size={24} color="#00b894" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00b894']} />
        }>
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

        {/* Filter Info */}
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            Showing: {formatMonthDisplay(selectedMonth)}
          </Text>
          <Text style={styles.filterInfoCount}>
            {filteredTransactions.length} transactions
          </Text>
      </View>

        {/* Transaction List */}
        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            renderItem={({item}) => <TransactionCard item={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.transactionList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="wallet-outline" size={80} color="#dfe6e9" />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubText}>
              {selectedMonth === 'all'
                ? 'Add income or expense to get started'
                : 'No transactions in this month'}
            </Text>
          </View>
        )}
      </ScrollView>

      <TransactionModal />

      {/* Decorative Elements */}
      <View style={styles.decorativeElements} pointerEvents="none">
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#d5f4e6',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
  summary: {
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
  monthFilterContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
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
  filterInfo: {
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterInfoText: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '600',
  },
  filterInfoCount: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },
  transactionList: {
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

export default TransactionScreen;

