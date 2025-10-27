import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ImageBackground,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {addCard} from '../services/DatabaseService';

// Import card background images
const cardBackgrounds = {
  'VISA': require('../assets/visa.png'),
  'Mastercard': require('../assets/master.png'),
  'American Express': require('../assets/american.png'),
};

const CARD_TYPES = [
  {
    type: 'VISA',
    icon: 'card',
    color: '#3B5998',
  },
  {
    type: 'Mastercard',
    icon: 'card',
    color: '#222222',
  },
  {
    type: 'American Express',
    icon: 'card',
    color: '#016FD0',
  },
];

const AddCardScreen = ({navigation, route}: any) => {
  const {user} = useAuth();
  const {cardType} = route.params;
  const [cardName, setCardName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardNameError, setCardNameError] = useState('');
  const [balanceError, setBalanceError] = useState('');

  const cardTypeData = CARD_TYPES.find(ct => ct.type === cardType);

  const validateInputs = () => {
    let isValid = true;
    
    if (!cardName.trim()) {
      setCardNameError('Card name is required');
      isValid = false;
    } else {
      setCardNameError('');
    }

    if (!initialBalance.trim()) {
      setBalanceError('Balance is required');
      isValid = false;
    } else if (isNaN(parseFloat(initialBalance)) || parseFloat(initialBalance) < 0) {
      setBalanceError('Please enter a valid amount');
      isValid = false;
    } else {
      setBalanceError('');
    }

    return isValid;
  };

  const handleAddCard = async () => {
    if (!validateInputs() || !user) return;

    try {
      await addCard(user.id, {
        cardType: cardType,
        cardName: cardName,
        balance: parseFloat(initialBalance),
        cardNumber: cardNumber,
        color: cardTypeData?.color || '#00b894',
      });

      Alert.alert('Success', 'Card added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'Failed to add card. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#e8f8f5"
        translucent={false}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2d3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add {cardType}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Card Preview */}
        <ImageBackground
          source={cardBackgrounds[cardType as keyof typeof cardBackgrounds]}
          style={styles.cardPreview}
          imageStyle={{borderRadius: 18}}
          resizeMode="cover">
          <View style={styles.cardPreviewHeader}>
            <Icon 
              name="hardware-chip-outline" 
              size={45} 
              color={cardType === 'American Express' ? '#F7B600' : 'rgba(255,255,255,0.85)'} 
            />
          </View>
          <View style={styles.cardPreviewBody}>
            {cardNumber && (
              <Text style={styles.cardPreviewNumber}>
                •••• •••• •••• {cardNumber}
              </Text>
            )}
            <View style={styles.cardPreviewFooter}>
              <View>
                <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
                <Text style={styles.cardPreviewName}>
                  {cardName || 'Card Name'}
                </Text>
              </View>
              <Text style={[
                styles.cardPreviewBrand,
                cardType === 'VISA' && {color: '#F7B600', fontSize: 18},
                cardType === 'Mastercard' && {color: '#F79E1B', fontSize: 16},
                cardType === 'American Express' && {fontSize: 14, fontWeight: '900'}
              ]}>{cardType}</Text>
            </View>
            <View style={styles.cardPreviewBalanceRow}>
              <Text style={styles.cardPreviewBalanceLabel}>BALANCE</Text>
              <Text style={styles.cardPreviewBalance}>
                ৳{initialBalance || '0.00'}
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* Input Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Name *</Text>
            <TextInput
              style={[styles.textInput, cardNameError && styles.inputError]}
              placeholder="e.g., My VISA Card"
              placeholderTextColor="#b2bec3"
              value={cardName}
              onChangeText={(text) => {
                setCardName(text);
                if (cardNameError && text.trim()) {
                  setCardNameError('');
                }
              }}
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
            />
            {cardNameError ? (
              <Text style={styles.errorText}>{cardNameError}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Initial Balance (৳) *</Text>
            <TextInput
              style={[styles.textInput, balanceError && styles.inputError]}
              placeholder="Enter amount"
              placeholderTextColor="#b2bec3"
              value={initialBalance}
              onChangeText={(text) => {
                setInitialBalance(text);
                if (balanceError && text.trim()) {
                  setBalanceError('');
                }
              }}
              keyboardType="numeric"
              returnKeyType="next"
              blurOnSubmit={false}
            />
            {balanceError ? (
              <Text style={styles.errorText}>{balanceError}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Card Number (Optional - Last 4 digits)
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 1234"
              placeholderTextColor="#b2bec3"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={4}
              returnKeyType="done"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {backgroundColor: cardTypeData?.color || '#00b894'},
              ]}
              onPress={handleAddCard}
              activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save Card</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'space-between',
    // paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
  cardPreview: {
    margin: 20,
    padding: 26,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 18,
    minHeight: 220,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardPreviewHeader: {
    marginBottom: 24,
  },
  cardPreviewBody: {
    gap: 18,
  },
  cardPreviewNumber: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.98)',
    letterSpacing: 3,
    fontWeight: '600',
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPreviewLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 1.2,
    marginBottom: 5,
    fontWeight: '700',
  },
  cardPreviewName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardPreviewBrand: {
    fontSize: 15,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardPreviewBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardPreviewBalanceLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardPreviewBalance: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
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
    fontSize: 14,
    color: '#2d3436',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    marginTop: 20,
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
    shadowOpacity: 0.3,
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
});

export default AddCardScreen;

