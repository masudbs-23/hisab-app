import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
  ImageBackground,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';

// Import card background images
const cardBackgrounds = {
  'VISA': require('../assets/visa.png'),
  'Mastercard': require('../assets/master.png'),
  'American Express': require('../assets/american.png'),
};
import {
  getUserCards,
  addCard,
  updateCardBalance,
  deleteCard,
} from '../services/DatabaseService';

const {height} = Dimensions.get('window');

interface Card {
  id: number;
  cardType: string;
  cardName: string;
  balance: number;
  cardNumber?: string;
  color: string;
}

const CARD_TYPES = [
  {
    type: 'VISA',
    icon: 'card',
    color: '#3B5998',
    gradient: ['#2C4A7C', '#3B5998'],
    textColor: '#FFFFFF',
    logoColor: '#F7B600',
  },
  {
    type: 'Mastercard',
    icon: 'card',
    color: '#222222',
    gradient: ['#1C1C1C', '#2A2A2A'],
    textColor: '#F79E1B',
    logoColor: '#EB001B',
  },
  {
    type: 'American Express',
    icon: 'card',
    color: '#016FD0',
    gradient: ['#016FD0', '#0582CA'],
    textColor: '#FFFFFF',
    logoColor: '#FFFFFF',
  },
];

const CardsScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState('');
  const [cardName, setCardName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const slideAnim = useState(new Animated.Value(height))[0];

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

  const openAddCardModal = (cardType: string) => {
    setSelectedCardType(cardType);
    setCardName('');
    setInitialBalance('');
    setCardNumber('');
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
      setSelectedCardType('');
      setCardName('');
      setInitialBalance('');
      setCardNumber('');
    });
  };

  const handleAddCard = async () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }

    if (!initialBalance.trim() || isNaN(parseFloat(initialBalance))) {
      Alert.alert('Error', 'Please enter a valid balance');
      return;
    }

    if (!user) return;

    try {
      const cardTypeData = CARD_TYPES.find(ct => ct.type === selectedCardType);
      await addCard(user.id, {
        cardType: selectedCardType,
        cardName: cardName,
        balance: parseFloat(initialBalance),
        cardNumber: cardNumber,
        color: cardTypeData?.color || '#00b894',
      });

      Alert.alert('Success', 'Card added successfully!');
      closeModal();
      loadCards();
    } catch (error: any) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'Failed to add card. Please try again.');
    }
  };

  const handleDeleteCard = (cardId: number, cardName: string) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${cardName}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(cardId);
              Alert.alert('Success', 'Card deleted successfully!');
              loadCards();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete card');
            }
          },
        },
      ],
    );
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', {minimumFractionDigits: 2})}`;
  };

  const getCardIcon = (cardType: string) => {
    const card = CARD_TYPES.find(c => c.type === cardType);
    return card?.icon || 'card-outline';
  };

  const getCardGradient = (cardType: string) => {
    const card = CARD_TYPES.find(c => c.type === cardType);
    return card?.color || '#00b894';
  };

  const CardItem = ({card}: {card: Card}) => (
    <ImageBackground
      source={cardBackgrounds[card.cardType as keyof typeof cardBackgrounds]}
      style={styles.cardItem}
      imageStyle={{borderRadius: 18}}
      resizeMode="cover">
      
      <View style={styles.cardHeader}>
        <View style={styles.chipContainer}>
          <Icon 
            name="hardware-chip-outline" 
            size={45} 
            color={card.cardType === 'American Express' ? '#F7B600' : 'rgba(255,255,255,0.85)'} 
          />
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCard(card.id, card.cardName)}>
          <Icon name="close-circle" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        {card.cardNumber && (
          <Text style={styles.cardNumber}>•••• •••• •••• {card.cardNumber.slice(-4)}</Text>
        )}
        <View style={styles.cardFooter}>
          <View style={styles.cardNameContainer}>
            <Text style={styles.cardNameLabel}>CARDHOLDER</Text>
            <Text style={styles.cardName}>{card.cardName}</Text>
          </View>
          <View style={styles.cardBrandContainer}>
            <Text style={[
              styles.cardBrand,
              card.cardType === 'VISA' && {color: '#F7B600', fontSize: 18},
              card.cardType === 'Mastercard' && {color: '#F79E1B', fontSize: 16},
              card.cardType === 'American Express' && {fontSize: 14, fontWeight: '900'}
            ]}>{card.cardType}</Text>
          </View>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.cardBalance}>{formatCurrency(card.balance)}</Text>
        </View>
      </View>
    </ImageBackground>
  );

  const CardTypeSelector = ({cardTypeData}: any) => (
    <TouchableOpacity
      onPress={() => openAddCardModal(cardTypeData.type)}
      activeOpacity={0.8}>
      <ImageBackground
        source={cardBackgrounds[cardTypeData.type as keyof typeof cardBackgrounds]}
        style={styles.cardTypeItem}
        imageStyle={{borderRadius: 16}}
        resizeMode="cover">
        <View style={styles.cardTypeLeft}>
          <Icon name="hardware-chip-outline" size={32} color="rgba(255,255,255,0.6)" />
          <Text style={styles.cardTypeText}>{cardTypeData.type}</Text>
        </View>
        <Icon name="add-circle" size={28} color="#fff" />
      </ImageBackground>
    </TouchableOpacity>
  );

  const AddCardModal = () => (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add {selectedCardType}</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Icon name="close" size={24} color="#636e72" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., My VISA Card"
                placeholderTextColor="#b2bec3"
                value={cardName}
                onChangeText={setCardName}
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Initial Balance (৳)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter amount"
                placeholderTextColor="#b2bec3"
                value={initialBalance}
                onChangeText={setInitialBalance}
                keyboardType="numeric"
              />
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
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
                activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddCard}
                activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#e8f8f5"
        translucent={false}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cards</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {/* <Text style={styles.sectionTitle}>Your Cards</Text> */}
          {cards.length > 0 ? (
            cards.map(card => <CardItem key={card.id} card={card} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="card-outline" size={60} color="#dfe6e9" />
              <Text style={styles.emptyText}>No cards added yet</Text>
              <Text style={styles.emptySubText}>
                Add a card below to get started
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardsContainer}>
          <Text style={styles.sectionTitle}>Add New Card</Text>
          <View style={styles.cardTypesGrid}>
            {CARD_TYPES.map(cardType => (
              <CardTypeSelector key={cardType.type} cardTypeData={cardType} />
            ))}
          </View>
        </View>
      </ScrollView>

      <AddCardModal />

      <View style={styles.decorativeElements} pointerEvents="none">
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginLeft:20
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
  cardsContainer: {
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 15,
    marginLeft: 5,
  },
  cardItem: {
    padding: 26,
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 18,
    height: 220,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    zIndex: 1,
  },
  chipContainer: {
    opacity: 0.85,
  },
  deleteButton: {
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
  },
  cardBody: {
    gap: 18,
    zIndex: 1,
  },
  cardNumber: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.98)',
    letterSpacing: 3,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  cardNameContainer: {
    flex: 1,
  },
  cardNameLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 1.2,
    marginBottom: 5,
    fontWeight: '700',
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardBrandContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  cardBrand: {
    fontSize: 15,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  balanceLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardBalance: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 12,
    color: '#b2bec3',
    marginTop: 5,
  },
  cardTypesGrid: {
    gap: 10,
  },
  cardTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 120,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  cardTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
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
    maxHeight: height * 0.75,
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
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00b894',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#00b894',
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
});

export default CardsScreen;

