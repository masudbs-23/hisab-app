import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import {
  addTransaction,
  getUserCards,
  updateCardBalance,
} from '../services/DatabaseService';

const AddTransactionScreen = ({navigation, route}: any) => {
  const {user} = useAuth();
  const {t} = useLanguage();
  const transactionType = route.params?.type || 'income'; // 'income' or 'expense'
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [cardError, setCardError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Title suggestions
  const expenseSuggestions = [
    t('suggestions.rent'),
    t('suggestions.travel'),
    t('suggestions.shopping'),
    t('suggestions.food'),
    t('suggestions.bills'),
    t('suggestions.entertainment'),
    t('suggestions.health'),
    t('suggestions.education'),
  ];
  const incomeSuggestions = [
    t('suggestions.salary'),
    t('suggestions.partTime'),
    t('suggestions.freelance'),
    t('suggestions.business'),
    t('suggestions.investment'),
    t('suggestions.gift'),
    t('suggestions.bonus'),
  ];

  useEffect(() => {
    loadCards();
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

  const handleSuggestionSelect = (suggestion: string) => {
    setTitle(suggestion);
    setShowSuggestions(false);
    if (titleError) {
      setTitleError('');
    }
  };

  const validateInputs = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError(t('addTransaction.titleRequired'));
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!amount.trim()) {
      setAmountError(t('addTransaction.amountRequired'));
      isValid = false;
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError(t('addTransaction.validAmount'));
      isValid = false;
    } else {
      setAmountError('');
    }

    if (!selectedCard) {
      setCardError(t('addTransaction.selectCardRequired'));
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
        t('common.success'),
        transactionType === 'income' ? t('addTransaction.incomeSuccess') : t('addTransaction.expenseSuccess'),
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      Alert.alert(
        t('common.error'),
        t('addTransaction.failed'),
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#2d3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {transactionType === 'income' ? t('addTransaction.addIncome') : t('addTransaction.addExpense')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Card Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('addTransaction.selectCard')}</Text>
          
          <View style={styles.cardSelectWrapper}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (cards.length > 0) {
                  setShowCardDropdown(!showCardDropdown);
                  setShowSuggestions(false);
                }
              }}
              style={[styles.cardSelectInput, cardError && styles.inputError]}>
              <View style={styles.cardSelectContent}>
                <Icon name="card-outline" size={20} color="#636e72" />
                <Text style={[styles.cardSelectText, !selectedCard && styles.placeholderText]}>
                  {selectedCard 
                    ? `${selectedCard.cardType} - ${selectedCard.cardName}` 
                    : cards.length === 0 
                      ? t('addTransaction.noCards')
                      : t('addTransaction.selectCard')}
                </Text>
              </View>
              {cards.length > 0 && (
                <Icon
                  name={showCardDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#636e72"
                />
              )}
            </TouchableOpacity>
            
            {/* Card Dropdown */}
            {showCardDropdown && cards.length > 0 && (
              <View style={styles.cardDropdownContainer}>
                <ScrollView
                  style={styles.cardDropdownScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}>
                  {cards.map((card: any) => (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.cardDropdownItem,
                        selectedCard?.id === card.id && styles.cardDropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedCard(card);
                        setShowCardDropdown(false);
                        if (cardError) setCardError('');
                      }}
                      activeOpacity={0.7}>
                      <View style={styles.cardDropdownItemContent}>
                        <View style={[styles.cardColorIndicator, {backgroundColor: card.color}]} />
                        <View style={styles.cardDropdownItemInfo}>
                          <Text style={styles.cardDropdownItemType}>{card.cardType}</Text>
                          <Text style={styles.cardDropdownItemName}>{card.cardName}</Text>
                        </View>
                        <View style={styles.cardDropdownItemBalance}>
                          <Text style={styles.cardDropdownItemBalanceLabel}>{t('home.balance')}</Text>
                          <Text style={styles.cardDropdownItemBalanceValue}>
                            ৳{card.balance.toLocaleString('en-BD')}
                          </Text>
                        </View>
                      </View>
                      {selectedCard?.id === card.id && (
                        <Icon name="checkmark-circle" size={20} color="#00b894" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          <View style={styles.errorTextContainer}>
            {cardError ? <Text style={styles.errorText}>{cardError}</Text> : null}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('addTransaction.title')}</Text>
          
          <View style={styles.titleInputWrapper}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setShowSuggestions(!showSuggestions);
                setShowCardDropdown(false);
              }}>
              <TextInput
                style={[styles.textInput, titleError && styles.inputError]}
                placeholder={t('addTransaction.selectOrEnter')}
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
                onFocus={() => {
                  setShowSuggestions(true);
                  setShowCardDropdown(false);
                }}
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
          <Text style={styles.inputLabel}>{t('addTransaction.amount')} (৳)</Text>
          <TextInput
            style={[styles.textInput, amountError && styles.inputError]}
            placeholder={t('addTransaction.enterAmount')}
            placeholderTextColor="#b2bec3"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              if (amountError && text.trim()) {
                setAmountError('');
              }
            }}
            onFocus={() => {
              setShowSuggestions(false);
              setShowCardDropdown(false);
            }}
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}>
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, transactionType === 'income' ? styles.incomeButton : styles.expenseButton]}
            onPress={handleSaveTransaction}
            activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  titleInputWrapper: {
    position: 'relative',
    zIndex: 5,
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
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
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
    zIndex: 1000,
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
  incomeButton: {
    backgroundColor: '#27ae60',
  },
  expenseButton: {
    backgroundColor: '#e74c3c',
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
  // Card Selection Dropdown
  cardSelectWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  cardSelectInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardSelectText: {
    fontSize: 14,
    color: '#2d3436',
    flex: 1,
  },
  placeholderText: {
    color: '#b2bec3',
  },
  cardDropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  cardDropdownScroll: {
    maxHeight: 250,
  },
  cardDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  cardDropdownItemSelected: {
    backgroundColor: '#e8f8f5',
  },
  cardDropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardColorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDropdownItemInfo: {
    flex: 1,
  },
  cardDropdownItemType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 2,
  },
  cardDropdownItemName: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
  },
  cardDropdownItemBalance: {
    alignItems: 'flex-end',
  },
  cardDropdownItemBalanceLabel: {
    fontSize: 10,
    color: '#636e72',
    marginBottom: 2,
  },
  cardDropdownItemBalanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00b894',
  },
});

export default AddTransactionScreen;

