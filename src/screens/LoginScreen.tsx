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
import { philosopherTypography, typography } from '../constants/typography';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/authSlice';
import imagePaths from '../constants/imagePaths';
import { showError, showSuccess } from '../utils/helperFunctions';
import ConfirmationModal from '../components/ConfirmationModal';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [keyboardType, setKeyboardType] = useState('email-address');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<any>();
  const [messageModalVisible, setMessageModalVisible] = useState({ status: false, header: '', message: '' });
  const [loginError, setLoginError] = useState({
    emailOrPhone: false,
    password: false,
  })

  const handleLogin = async () => {

    // 🧩 login Validation
    const newErrors = {
      emailOrPhone: !emailOrPhone,
      password: !password,
    };

    setLoginError(newErrors);

    // ❌ If any value is empty → show alert and stop
    if (Object.values(newErrors).includes(true)) {
      showError('Please fill all the required fields!...');
      return;
    }

    // Validation section
    const trimmed = emailOrPhone.trim();

    const firstChar = trimmed.charAt(0);

    if (/[0-9]/.test(firstChar)) {
      // User is trying to log in with mobile number
      if (!isValidMobile(trimmed)) {
        setMessageModalVisible({ status: true, header: 'Invalid Mobile Number', message: 'Please enter a valid 10-digit mobile number' });
        return;
      }
    } else {
      // User is trying to log in with email
      if (!isValidEmail(trimmed)) {
        setMessageModalVisible({ status: true, header: 'Invalid Email', message: 'Please enter a valid email address' });
        return;
      }
    }

    try {
      setIsLoading(true);

      const result = await dispatch(login({ email: trimmed, password })).unwrap();
      showSuccess('User Logged in successfully!...');
      navigation.replace('Main');
    } catch (err: any) {
      console.error('Login Error:', err);
      setMessageModalVisible({ status: true, header: 'Login Failed', message: err?.message || 'Something went wrong, please try again' });
      showError('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  };


  const isValidEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const isValidMobile = (value: string) => {
    const mobileRegex = /^[0-9]{10}$/;   // Strict 10-digit Indian mobile number
    return mobileRegex.test(value);
  };


  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality will be implemented soon.');
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Social Login', `${provider} login will be implemented soon.`);
  };

  const handleTermsAndConditions = (provider: string) => {
    Alert.alert(provider, `${provider} will be implemented soon.`);
  };

  const handleChangeUserInput = (text: any) => {
    setEmailOrPhone(text);
    setLoginError({ ...loginError, emailOrPhone: false });

    if (text.length === 0) {
      // reset to default
      setKeyboardType('email-address');
      return;
    }

    // Check first character
    const firstChar = text.charAt(0);

    if (/[0-9]/.test(firstChar)) {
      setKeyboardType('phone-pad');     // numeric keypad
    } else {
      setKeyboardType('email-address'); // email keypad
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ImageBackground
        source={imagePaths.LoginBg}
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
                <Text style={styles.formTitle}>Log In</Text>
                <View style={styles.borderLine} />
              </View>

              {/* Email/Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mail id or  Phone  Number<Text style={styles.required}> *</Text></Text>
                <TextInput
                  style={[styles.input, { borderColor: loginError.emailOrPhone ? "#DC3545" : "#616161" }]}
                  placeholder="Enter your mail or mobile number"
                  placeholderTextColor="#616161"
                  value={emailOrPhone}
                  onChangeText={handleChangeUserInput}
                  keyboardType={keyboardType}
                  autoCapitalize="none"
                />
                {loginError.emailOrPhone && (
                  <Text style={styles.errorText}>Mail Id or Mobile number is required</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.passwordContainer, { borderColor: loginError.password ? "#DC3545" : "#616161" }]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#616161"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setLoginError({ ...loginError, password: false });
                    }}
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
                {loginError.password && (
                  <Text style={styles.errorText}>Password is required</Text>
                )}
                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={navigateToSignUp}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* delete this View when you use the social logins*/}
              <View style={{ height: 50 }} />

              {/* Divider */}
              {/* <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View> */}

              {/* Social Login Buttons */}
              {/* <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton} 
                onPress={() => handleSocialLogin('Google')}
              >
                <Image source={imagePaths.Google} resizeMode='contain' style={styles.socialIcons} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton} 
                onPress={() => handleSocialLogin('Apple')}
              >
                <Image source={imagePaths.Apple} resizeMode='contain' style={styles.socialIcons} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton} 
                onPress={() => handleSocialLogin('Facebook')}
              >
                <Image source={imagePaths.Facebook} resizeMode='contain' style={styles.socialIcons} />
              </TouchableOpacity>
            </View> */}

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
      <ConfirmationModal
        Visible={messageModalVisible.status}
        Header={messageModalVisible.header}
        Message={messageModalVisible.message}
        OnSubmit={() => setMessageModalVisible({ status: false, header: '', message: '' })}
      />
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
    marginBottom: 10
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
    marginTop: 50,
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
    width: '80%'
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
  required: {
    color: '#DC3545'
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#034833',
    fontSize: 14,
    ...typography.medium,
  },
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    ...typography.bold,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#1C1C1C',
  },
  signUpLink: {
    fontSize: 14,
    ...typography.bold,
    color: '#034833',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#79736B',
    opacity: 0.4
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
    marginBottom: 20
  },
  socialButton: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#034833',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  socialIcons: {
    height: 24,
    width: 24,
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  termsText: {
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

export default LoginScreen;