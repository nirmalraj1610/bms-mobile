import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { philosopherTypography, typography } from '../constants/typography';
import imagePaths from '../constants/imagePaths';
import { showSuccess } from '../utils/helperFunctions';
import { Dropdown } from 'react-native-element-dropdown';
import { authSignup } from '../lib/api';

const SignUpScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation<any>();
  const [userType, setUserType] = useState<'client' | 'photographer' | 'studio_owner'>('client');
  const USER_TYPES = [
    { label: 'Client', value: 'client' },
    { label: 'Photographer', value: 'photographer' },
    { label: 'Studio Owner', value: 'studio_owner' },
  ];
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedPhone = String(phone || '').replace(/\D/g, '');
      const res = await authSignup({
        email,
        password,
        full_name: name,
        phone: sanitizedPhone,
        user_type: userType,
        user_metadata: { full_name: name, user_type: userType, phone: sanitizedPhone },
      });
      setIsLoading(false);
      if (res?.session?.access_token) {
        navigation.replace('Main');
      } else {
        setModalTitle('Signup Successful');
        setModalMessage('Account created. Please check your email for verification.');
        setModalVisible(true);
      }
    } catch (e: any) {
      setIsLoading(false);
      setModalTitle('Signup Failed');
      setModalMessage(e?.message || 'Failed to sign up');
      setModalVisible(true);
    }
  };

  const navigateToLogin = () => {
    navigation.goBack();
  };

      const handleTermsAndConditions = (provider: string) => {
      Alert.alert(provider, `${provider} will be implemented soon.`);
    };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
            <ImageBackground
        source={imagePaths.SignupBg}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={imagePaths.logo}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Discover Your</Text>
            <Text style={styles.taglineSecond}>Best Photo Studio, Photographers</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.titleOutline}>
              <Text style={styles.formTitle}>Sign Up</Text>
              <View style={styles.borderLine} />
            </View>

            {/* User Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>User type</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.dropdownContainerStyle}
                data={USER_TYPES}
                maxHeight={250}
                labelField="label"
                valueField="value"
                placeholder="Select user type"
                value={userType}
                onChange={(item: any) => setUserType(item.value)}
              />
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#616161"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mail id</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your mail"
                placeholderTextColor="#616161"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#616161"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Set password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#616161"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#171725"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#616161"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#171725"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{'\n'}
                <Text onPress={() => handleTermsAndConditions('Terms of Service')} style={styles.linkText}>Terms of Service</Text> and <Text onPress={() => handleTermsAndConditions('Privacy Policy')} style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </ImageBackground>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>{modalTitle}</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalMessageText}>{modalMessage}</Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => {
                setModalVisible(false);
                if (modalTitle === 'Signup Successful') {
                  navigation.navigate('Auth', { screen: 'Login' });
                }
              }}>
                <Text style={styles.modalPrimaryBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
      backgroundImage: {
    flex: 1,
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLogo: {
    width: 160,
    height: 120,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#2C5530',
    ...philosopherTypography.bold,
    textAlign: 'center',
  },
  taglineSecond: {
    fontSize: 18,
    color: '#2C5530',
    ...philosopherTypography.bold,
    textAlign: 'center',
  },
  formContainer: {
    // marginTop: 50,
    flex: 1,
  },
    titleOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  borderLine: {
    height: 1,
    backgroundColor: '#79736B',
    opacity: 0.4,
    marginTop: 2,
    width: '75%'
  },
  formTitle: {
    fontSize: 18,
    ...typography.bold,
    color: '#423F3F',
  },
  inputGroup: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2A2A2A',
    marginBottom: 5,
    ...typography.bold,
  },
  input: {
  borderWidth: 1,
    borderColor: '#616161',
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#101010',
    backgroundColor: 'transparent',
    ...typography.semibold,
  },
  passwordContainer: {
   flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#616161',
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#101010',
    backgroundColor: 'transparent',
    ...typography.semibold,
  },
  eyeIcon: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  signUpButton: {
    backgroundColor: '#034833',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    ...typography.bold,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#1C1C1C',
  },
  signInLink: {
    fontSize: 14,
    ...typography.bold,
    color: '#034833',
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  termsText: {
    marginTop: 20,
    fontSize: 12,
    color: '#423F3F',
    textAlign: 'center',
    lineHeight: 20,
    ...typography.medium,
  },
  linkText: {
    color: '#034833',
    ...typography.semibold,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#616161',
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: 'transparent',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#616161',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#101010',
    ...typography.semibold,
  },
  dropdownContainerStyle: {
    borderRadius: 10,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
  },
  modalHeader: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#F9F9F9',
  },
  modalHeaderText: {
    fontSize: 18,
    color: '#101010',
    ...typography.bold,
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalMessageText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    ...typography.semibold,
  },
  modalFooter: {
    padding: 15,
    backgroundColor: '#F9F9F9',
  },
  modalPrimaryBtn: {
    backgroundColor: '#034833',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalPrimaryBtnText: {
    color: '#fff',
    fontSize: 16,
    ...typography.bold,
  },
});

export default SignUpScreen;