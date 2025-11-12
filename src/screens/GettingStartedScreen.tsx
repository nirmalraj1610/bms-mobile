import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants';
import { philosopherTypography, typography } from '../constants/typography';
import imagePaths from '../constants/imagePaths';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const GettingStartedScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Ensure the flag is set once the screen is shown (extra safety)
  useEffect(() => {
    (async () => {
      try { await AsyncStorage.setItem('has_seen_getting_started', 'true'); } catch {}
    })();
  }, []);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('has_seen_getting_started', 'true');
    } catch {}
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ImageBackground
        source={require('../assets/images/Getting_started.png')}
        style={styles.background}
        resizeMode="cover"
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

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
            <Text style={styles.ctaText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  background: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  ctaButton: {
    backgroundColor: COLORS.bg,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.background,
    fontSize: 18,
    ...typography.semibold,
  },
});

export default GettingStartedScreen;