import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useAuth} from '../context/AuthContext';
import {getUserProfile, updateUserProfile} from '../services/DatabaseService';

const EditProfileScreen = ({navigation}: any) => {
  const {user, login} = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    profileImage: '',
  });
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editImage, setEditImage] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setEditName(userProfile.name || '');
      setEditPhone(userProfile.phone || '');
      setEditImage(userProfile.profileImage || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
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

      // Update auth context
      await login({
        ...user,
        name: editName.trim(),
        phone: editPhone.trim(),
        profileImage: editImage,
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (editName) {
      return editName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'U';
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
          <Icon name="arrow-left" size={24} color="#2d3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
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

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            activeOpacity={0.8}
            disabled={loading}>
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
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
  imageSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarLarge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#f0f9ff',
    shadowColor: '#00b894',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  avatarImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  cameraIconButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarLargeText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  imageHint: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '600',
    marginBottom: 5,
  },
  imageHintSub: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2d3436',
    minHeight: 56,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1.5,
  },
  errorTextContainer: {
    minHeight: 22,
    marginBottom: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: '#00b894',
    shadowColor: '#00b894',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    minHeight: 56,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default EditProfileScreen;

