import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TransactionScreen = () => {
  const transactions = [
    {
      id: 1,
      title: 'Salary',
      category: 'Income',
      amount: 5000,
      date: 'Oct 15, 2025',
      icon: 'cash-multiple',
      type: 'income',
    },
    {
      id: 2,
      title: 'Grocery Shopping',
      category: 'Food',
      amount: -150,
      date: 'Oct 18, 2025',
      icon: 'cart',
      type: 'expense',
    },
    {
      id: 3,
      title: 'Electric Bill',
      category: 'Bills',
      amount: -85,
      date: 'Oct 19, 2025',
      icon: 'lightning-bolt',
      type: 'expense',
    },
    {
      id: 4,
      title: 'Freelance Work',
      category: 'Income',
      amount: 800,
      date: 'Oct 20, 2025',
      icon: 'briefcase',
      type: 'income',
    },
    {
      id: 5,
      title: 'Restaurant',
      category: 'Food',
      amount: -65,
      date: 'Oct 20, 2025',
      icon: 'food',
      type: 'expense',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-variant" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>This Month</Text>
          <Text style={styles.summaryAmount}>$5,500</Text>
        </View>
      </View>

      <ScrollView style={styles.transactionList}>
        <Text style={styles.sectionTitle}>Recent</Text>
        {transactions.map(transaction => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      transaction.type === 'income' ? '#E8F5E9' : '#FFEBEE',
                  },
                ]}>
                <Icon
                  name={transaction.icon}
                  size={24}
                  color={transaction.type === 'income' ? '#4CAF50' : '#F44336'}
                />
              </View>
              <View>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionCategory}>
                  {transaction.category} • {transaction.date}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                {color: transaction.type === 'income' ? '#4CAF50' : '#F44336'},
              ]}>
              {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton}>
        <Icon name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  summary: {
    backgroundColor: '#4A90E2',
    margin: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#E8F4FD',
    fontSize: 16,
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default TransactionScreen;

