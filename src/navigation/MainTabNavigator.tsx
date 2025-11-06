import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from '../types';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';
import BookingScreen from '../screens/BookingScreen';
import StudioDashboardScreen from '../screens/StudioDashboardScreen';
import PhotographerDashboardScreen from '../screens/PhotographerDashboardScreen';
import { getUserData } from '../lib/http';
import { useDispatch } from 'react-redux';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null); // 'client', 'studio_owner', or 'photographer'
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        const userType = userData?.customer?.customer_profiles?.user_type;
        console.log('User type:', userType);
        setCurrentUser(userType);
      } catch (err) {
        console.log('Failed to load user data:', err);
      }
    };

    fetchUserData();
  }, [dispatch]);


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Bookings':
              iconName = 'book';
              break;

            case 'Dashboard':
              iconName = 'space-dashboard';
              break;
            
            case 'Favorites':
              iconName = focused ? 'star' : 'star-border';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
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
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingScreen} 
        options={{ title: 'Bookings' }}
      />
      {currentUser && currentUser !== 'client' && (
        <Tab.Screen
          name="Dashboard"
          component={currentUser === 'studio_owner' ? StudioDashboardScreen : PhotographerDashboardScreen}
          options={{ title: 'Dashboard' }}
        />
      )}
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
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tabBarLabel: {
    fontSize: 12,
    ...typography.regular,
    color: COLORS.background,
  },
});

export default MainTabNavigator;