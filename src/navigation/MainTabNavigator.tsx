import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';

import HomeStackNavigator from './HomeStackNavigator';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from '../types';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';
import BookingScreen from '../screens/BookingScreen';
import StudioDashboardScreen from '../screens/StudioDashboardScreen';
import PhotographerDashboardScreen from '../screens/PhotographerDashboardScreen';
import { useDispatch } from 'react-redux';
import imagePaths from '../constants/imagePaths';
import { getUserProfile } from '../lib/api';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null); // 'client', 'studio_owner', or 'photographer'
  const [validUser, setValidUser] = useState<boolean | null>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProfile();
  }, [dispatch]);

  const fetchProfile = async () => {
    try {
      const userData: any = await getUserProfile();
      const userType = userData?.customer?.customer_profiles?.user_type;
      console.log('User type:', userType);
      setCurrentUser(userType);
      setValidUser(true);
    } catch (err) {
      setValidUser(false);
    }
  };


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let imageName: ImageSourcePropType;

          switch (route.name) {
            case 'Home':
              imageName = imagePaths.Home;
              break;
            case 'Bookings':
              imageName = imagePaths.Bookings;
              break;

            case 'Dashboard':
              imageName = imagePaths.Dashboard;
              break;

            case 'Favorites':
              imageName = imagePaths.Favorites;
              break;
            case 'Profile':
              imageName = imagePaths.Profile;
              break;
            default:
              imageName = imagePaths.Home;
          }

          return <Image source={imageName} resizeMode='contain' tintColor={focused ? "#FFFFFF" : "#AFAFAF"} style={styles.tabImages} />
        },
        tabBarActiveTintColor: COLORS.surface,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingScreen}
        options={{ title: 'Bookings' }}
      />
      {validUser && currentUser !== 'client' ?
        <Tab.Screen
          name="Dashboard"
          component={currentUser === 'studio_owner' ? StudioDashboardScreen : PhotographerDashboardScreen}
          options={{ title: 'Dashboard' }}
        /> : null
      }
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bg,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    ...typography.regular,
    color: COLORS.background,
  },
  tabImages: {
    width: 22,
    height: 22
  },
});

export default MainTabNavigator;