import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../context/AuthContext';
import {getUserProfile, updateUserProfile} from '../services/DatabaseService';

const {height} = Dimensions.get('window');

const ProfileScreen = ({navigation}: any) => {
  const {user, logout, login} = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    profileImage: '',
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editImage, setEditImage] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const userProfile = await getUserProfile(user.id);
      setProfile({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        profileImage: userProfile.profileImage || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const openEditModal = () => {
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setEditImage(profile.profileImage);
    setNameError('');
    setPhoneError('');
    setEditModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleImageSelection = () => {
    Alert.alert(
      'Select Profile Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.7,
        maxWidth: 500,
        maxHeight: 500,
        includeBase64: true,
      });

      if (result.assets && result.assets[0]) {
        const imageData = `data:${result.assets[0].type};base64,${result.assets[0].base64}`;
        setEditImage(imageData);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 500,
        maxHeight: 500,
        includeBase64: true,
      });

      if (result.assets && result.assets[0]) {
        const imageData = `data:${result.assets[0].type};base64,${result.assets[0].base64}`;
        setEditImage(imageData);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const closeEditModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setEditModalVisible(false);
    });
  };

  const validateInputs = () => {
    let isValid = true;

    if (!editName.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!editPhone.trim()) {
      setPhoneError('Phone is required');
      isValid = false;
    } else if (!/^[0-9]{10,15}$/.test(editPhone.trim())) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    return isValid;
  };

  const handleSaveProfile = async () => {
    if (!validateInputs() || !user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.id, editName.trim(), editPhone.trim(), editImage);

      // Update local state
      const updatedProfile = {
        name: editName.trim(),
        phone: editPhone.trim(),
        profileImage: editImage,
      };
      setProfile(updatedProfile);

      // Update auth context
      await login({
        ...user,
        name: editName.trim(),
        phone: editPhone.trim(),
        profileImage: editImage,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      closeEditModal();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Alert.alert('Success', 'You have been logged out.');
        },
      },
    ]);
  };

  const getInitials = () => {
    if (profile.name) {
      return profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const menuItems = [
    {id: 1, title: 'Personal Information', icon: 'account-circle', color: '#4A90E2', action: openEditModal},
    {id: 2, title: 'Notifications', icon: 'bell', color: '#FF9800', action: () => navigation.navigate('Notification')},
    {id: 3, title: 'Privacy Policy', icon: 'file-document', color: '#607D8B', action: () => navigation.navigate('PrivacyPolicy')},
    {id: 4, title: 'Help & Support', icon: 'help-circle', color: '#00BCD4', action: null},
  ];

  const EditProfileModal = () => (
    <Modal
      animationType="none"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={closeEditModal}>
      <TouchableWithoutFeedback onPress={closeEditModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {transform: [{translateY: slideAnim}]},
              ]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#636e72" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* Profile Image */}
                <View style={styles.imageSection}>
                  <TouchableOpacity onPress={handleImageSelection} activeOpacity={0.8}>
                    <View style={styles.avatarLarge}>
                      {editImage ? (
                        <Image source={{uri: editImage}} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarLargeText}>{getInitials()}</Text>
                      )}
                      <View style={styles.cameraIconButton}>
                        <Icon name="camera" size={22} color="#fff" />
                      </View>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.imageHint}>Tap photo to change</Text>
                  <Text style={styles.imageHintSub}>Camera or Gallery</Text>
                </View>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={[styles.textInput, nameError && styles.inputError]}
                    placeholder="Enter your name"
                    placeholderTextColor="#b2bec3"
                    value={editName}
                    onChangeText={(text) => {
                      setEditName(text);
                      if (nameError && text.trim()) {
                        setNameError('');
                      }
                    }}
                    autoCorrect={false}
                    autoCapitalize="words"
                  />
                  <View style={styles.errorTextContainer}>
                    {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                  </View>
                </View>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput
                    style={[styles.textInput, phoneError && styles.inputError]}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#b2bec3"
                    value={editPhone}
                    onChangeText={(text) => {
                      setEditPhone(text);
                      if (phoneError && text.trim()) {
                        setPhoneError('');
                      }
                    }}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                  />
                  <View style={styles.errorTextContainer}>
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeEditModal}
                    activeOpacity={0.8}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                    activeOpacity={0.8}
                    disabled={loading}>
                    <Text style={styles.saveButtonText}>
                      {loading ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}} edges={['top']}>
      {/* Header Bar with Title and Logout */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
          <Icon name="logout" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profile.profileImage ? (
              <Image source={{uri: profile.profileImage}} style={styles.avatarImageSmall} />
            ) : (
              <Text style={styles.avatarText}>{getInitials()}</Text>
            )}
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>
              {profile.name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            {profile.phone && (
              <Text style={styles.userPhone}>{profile.phone}</Text>
            )}
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action || (() => {})}
              activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, {backgroundColor: `${item.color}20`}]}>
                  <Icon name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.version}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      <EditProfileModal />

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
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarImageSmall: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#00b894',
    fontWeight: '500',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  version: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
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
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  avatarLargeText: {
    fontSize: 42,
    color: '#fff',
    fontWeight: 'bold',
  },
  imageHint: {
    fontSize: 15,
    color: '#2d3436',
    fontWeight: '600',
    marginBottom: 4,
  },
  imageHintSub: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
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
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2d3436',
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
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#00b894',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default ProfileScreen;
