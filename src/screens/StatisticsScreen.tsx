import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {getUserTransactions} from '../services/DatabaseService';

const {width} = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

const StatisticsScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    incomePercentage: 50,
    expensePercentage: 50,
    monthlyData: [] as {month: string; income: number; expense: number}[],
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    if (!user) return;

    try {
      const allTransactions = await getUserTransactions(user.id);
      setTransactions(allTransactions);

      // Calculate totals
      let totalIncome = 0;
      let totalExpense = 0;

      allTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else {
          totalExpense += transaction.amount;
        }
      });

      const netBalance = totalIncome - totalExpense;
      const total = totalIncome + totalExpense;
      const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 50;
      const expensePercentage = total > 0 ? (totalExpense / total) * 100 : 50;

      // Group by month
      const monthlyMap = new Map<string, {income: number; expense: number}>();
      
      allTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {income: 0, expense: 0});
        }
        
        const data = monthlyMap.get(monthKey)!;
        if (transaction.type === 'income') {
          data.income += transaction.amount;
        } else {
          data.expense += transaction.amount;
        }
      });

      const monthlyData = Array.from(monthlyMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 6)
        .reverse()
        .map(([month, data]) => ({
          month: formatMonth(month),
          income: data.income,
          expense: data.expense,
        }));

      setStats({
        totalIncome,
        totalExpense,
        netBalance,
        incomePercentage,
        expensePercentage,
        monthlyData,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {month: 'short'});
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getMaxValue = () => {
    const values = stats.monthlyData.flatMap(d => [d.income, d.expense]);
    const max = Math.max(...values, 1000);
    // Round up to nearest 1000
    return Math.ceil(max / 1000) * 1000;
  };

  const getYAxisLabels = () => {
    const max = getMaxValue();
    const step = max / 4;
    return [0, step, step * 2, step * 3, max];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.summaryIconContainer}>
              <Icon name="trending-up" size={24} color="#00b894" />
            </View>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryAmount, styles.incomeText]}>
              {formatCurrency(stats.totalIncome)}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.summaryIconContainer}>
              <Icon name="trending-down" size={24} color="#e74c3c" />
            </View>
            <Text style={styles.summaryLabel}>Total Expense</Text>
            <Text style={[styles.summaryAmount, styles.expenseText]}>
              {formatCurrency(stats.totalExpense)}
            </Text>
          </View>
        </View>

        {/* Net Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Icon name="wallet" size={28} color="#4A90E2" />
            <Text style={styles.balanceLabel}>Net Balance</Text>
          </View>
          <Text style={[
            styles.balanceAmount,
            stats.netBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
          ]}>
            {formatCurrency(stats.netBalance)}
          </Text>
          <View style={styles.balanceBar}>
            <View
              style={[
                styles.balanceBarIncome,
                {width: `${stats.incomePercentage}%`},
              ]}
            />
            <View
              style={[
                styles.balanceBarExpense,
                {width: `${stats.expensePercentage}%`},
              ]}
            />
          </View>
          <View style={styles.balanceBarLabels}>
            <View style={styles.balanceBarLabel}>
              <View style={[styles.colorDot, styles.incomeDot]} />
              <Text style={styles.barLabelText}>
                Income ({stats.incomePercentage.toFixed(0)}%)
              </Text>
            </View>
            <View style={styles.balanceBarLabel}>
              <View style={[styles.colorDot, styles.expenseDot]} />
              <Text style={styles.barLabelText}>
                Expense ({stats.expensePercentage.toFixed(0)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Icon name="bar-chart" size={24} color="#4A90E2" />
            <Text style={styles.chartTitle}>Monthly Comparison</Text>
          </View>
          
          {stats.monthlyData.length > 0 ? (
            <View style={styles.chartWrapper}>
              {/* Y-axis */}
              <View style={styles.yAxis}>
                {getYAxisLabels().reverse().map((value, index) => (
                  <View key={index} style={styles.yAxisLabel}>
                    <Text style={styles.yAxisText}>
                      {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Chart Area */}
              <View style={styles.chartArea}>
                {/* Grid Lines */}
                <View style={styles.gridLines}>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <View key={index} style={styles.gridLine} />
                  ))}
                </View>

                {/* Bars */}
                <View style={styles.chart}>
                  {stats.monthlyData.map((data, index) => {
                    const maxValue = getMaxValue();
                    const incomeHeight = (data.income / maxValue) * 150;
                    const expenseHeight = (data.expense / maxValue) * 150;
                    
                    return (
                      <View key={index} style={styles.chartBar}>
                        <View style={styles.chartBars}>
                          <View style={styles.chartBarPair}>
                            <View
                              style={[
                                styles.chartBarIncome,
                                {height: incomeHeight || 2},
                              ]}>
                              {data.income > 0 && incomeHeight > 20 && (
                                <Text style={styles.barValueText}>
                                  {data.income >= 1000 ? `${(data.income / 1000).toFixed(1)}k` : data.income}
                                </Text>
                              )}
                            </View>
                            <View
                              style={[
                                styles.chartBarExpense,
                                {height: expenseHeight || 2},
                              ]}>
                              {data.expense > 0 && expenseHeight > 20 && (
                                <Text style={styles.barValueText}>
                                  {data.expense >= 1000 ? `${(data.expense / 1000).toFixed(1)}k` : data.expense}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                        <Text style={styles.chartLabel}>{data.month}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Icon name="analytics-outline" size={60} color="#b2bec3" />
              <Text style={styles.emptyChartText}>No data available</Text>
            </View>
          )}

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.incomeLegend]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.expenseLegend]} />
              <Text style={styles.legendText}>Expense</Text>
            </View>
          </View>
        </View>

        {/* Transaction Count */}
        <View style={styles.infoCard}>
          <Icon name="receipt" size={24} color="#9B59B6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Total Transactions</Text>
            <Text style={styles.infoValue}>{transactions.length}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    zIndex: 10,
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  incomeCard: {
    borderColor: '#00b894',
    backgroundColor: '#f0fdf9',
  },
  expenseCard: {
    borderColor: '#e74c3c',
    backgroundColor: '#fef5f5',
  },
  summaryIconContainer: {
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#636e72',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#00b894',
  },
  expenseText: {
    color: '#e74c3c',
  },
  balanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 15,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  positiveBalance: {
    color: '#00b894',
  },
  negativeBalance: {
    color: '#e74c3c',
  },
  balanceBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f1f3f5',
    marginBottom: 12,
  },
  balanceBarIncome: {
    backgroundColor: '#00b894',
  },
  balanceBarExpense: {
    backgroundColor: '#e74c3c',
  },
  balanceBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceBarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  incomeDot: {
    backgroundColor: '#00b894',
  },
  expenseDot: {
    backgroundColor: '#e74c3c',
  },
  barLabelText: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 15,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  chartWrapper: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  yAxis: {
    width: 40,
    height: 180,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  yAxisText: {
    fontSize: 10,
    color: '#636e72',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#e9ecef',
    width: '100%',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 10,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBars: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  chartBarPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  chartBarIncome: {
    width: 16,
    backgroundColor: '#00b894',
    borderRadius: 4,
    minHeight: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 3,
  },
  chartBarExpense: {
    width: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 4,
    minHeight: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 3,
  },
  barValueText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  chartLabel: {
    fontSize: 11,
    color: '#636e72',
    marginTop: 8,
    fontWeight: '500',
  },
  emptyChart: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: '#b2bec3',
    marginTop: 10,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  incomeLegend: {
    backgroundColor: '#00b894',
  },
  expenseLegend: {
    backgroundColor: '#e74c3c',
  },
  legendText: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default StatisticsScreen;

