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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { philosopherTypography, typography } from '../constants/typography';
import imagePaths from '../constants/imagePaths';

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
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.replace('Main') }
      ]);
    }, 1500);
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
    color: '101010',
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
    color: '101010',
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
});

export default SignUpScreen;