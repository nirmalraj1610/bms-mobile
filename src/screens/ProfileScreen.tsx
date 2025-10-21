import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const navigateToLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const navigateToSignUp = () => {
    navigation.navigate('Auth', { screen: 'SignUp' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Coming Soon...</Text>
      
      <View style={styles.tempButtonsContainer}>
        <Text style={styles.tempTitle}>Temporary Navigation (For Testing)</Text>
        
        <TouchableOpacity style={styles.tempButton} onPress={navigateToLogin}>
          <Text style={styles.tempButtonText}>Go to Login Screen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.tempButton, styles.signUpButton]} onPress={navigateToSignUp}>
          <Text style={[styles.tempButtonText, styles.signUpButtonText]}>Go to SignUp Screen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  tempButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  tempTitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  tempButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
  },
  tempButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  signUpButtonText: {
    color: COLORS.primary,
  },
});

export default ProfileScreen;