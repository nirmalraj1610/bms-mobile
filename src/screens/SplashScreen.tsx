import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants';
import imagePaths from '../constants/imagePaths';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const decideRoute = async () => {
      try {
        const flag = await AsyncStorage.getItem('has_seen_getting_started');
        const hasSeen = flag === 'true';
        if (!hasSeen) {
          // Mark as seen BEFORE navigating, so it won't show again next launch
          try { await AsyncStorage.setItem('has_seen_getting_started', 'true'); } catch {}
        }
        timer = setTimeout(() => {
          navigation.replace(hasSeen ? 'Main' : 'GettingStarted');
        }, 1200);
      } catch {
        timer = setTimeout(() => {
          navigation.replace('GettingStarted');
        }, 1200);
      }
    };
    decideRoute();
    return () => { if (timer) clearTimeout(timer); };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ImageBackground
          source={imagePaths.Splash}
        style={styles.background}
        resizeMode="cover"
      >

      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: width * 0.6,
    height: 110,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default SplashScreen;