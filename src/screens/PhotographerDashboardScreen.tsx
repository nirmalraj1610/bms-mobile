import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants';
import { DashboardComponent } from '../components/photographer/Dashboard';
import { BookingsComponent } from '../components/photographer/Bookings';
import { ServicesComponent } from '../components/photographer/Services';
import { PortfolioComponent } from '../components/photographer/portfolio';
import { typography } from '../constants/typography';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from '@react-native-community/blur';
import { getUserData } from '../lib/http';

const PhotographerDashboardScreen: React.FC = () => {
  const isFocused = useIsFocused();
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>('User');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const menus = [
    'Dashboard',
    'Bookings',
    'Services',
    'portfolio',
  ];

  const iconMap = {
    Dashboard: "space-dashboard",
    Bookings: "calendar-month",
    Services: "handyman",
    portfolio: "emoji-events",
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getUserData();
      const user = userData?.customer;
      console.log('userData:', user);
      setCurrentUser(user);
    } catch (err) {
      console.log('Failed to load user data:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      let token: string | null = null;
      try { token = await AsyncStorage.getItem('auth_token'); } catch { }
      if (!token) {
        setShowLoginModal(true);
        return;
      }
      try {
        const userData = await getUserData();
        const exp = userData?.session?.expires_at; // seconds epoch
        if (typeof exp === 'number') {
          const isExpired = exp * 1000 <= Date.now();
          if (isExpired) {
            setShowLoginModal(true);
            return;
          }
        }
      } catch { }
    };

    if(isFocused)
    {
    checkAuth();
    }
  }, [isFocused]);

  // Login modal handlers
  const closeLoginModal = () => setShowLoginModal(false);
  const goToLogin = () => {
    setShowLoginModal(false);
    navigation.navigate('Auth', { screen: 'Login' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* HEADER */}
      <View style={styles.headerOutline}>
        <View style={styles.headerTopRow}>
          {/* Left: Logo + Welcome */}
          <View style={styles.headerLeft}>
            <Image
              source={require('../assets/images/logoo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>
              Hello <Text style={styles.userName}>{currentUser?.full_name}!</Text>
            </Text>
          </View>

          {/* Right: Notifications + Location */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationIconOutline}>
              <Icon name="notifications" size={20} color="#034833" />
            </TouchableOpacity>

            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <View style={styles.locationRow}>
                <Icon name="location-on" size={16} color="#FF6B35" />
                <Text style={styles.locationText}>{currentUser?.customer_profiles?.address?.city || 'Chennai'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.bottomContainer}>
        {/* Menu Selector */}
        <View style={styles.menuOutline}>
          <View style={styles.menuRow}>
            <Icon name="menu" size={18} color="#2F2F2F" />
            <Text style={styles.menuLabel}>Menu</Text>
          </View>
          <View style={styles.dropdownWrapper}>
            {/* Header (always visible) */}
            <TouchableOpacity
              style={styles.dropdownHeader}
              onPress={() => setDropdownVisible(!dropdownVisible)}
              activeOpacity={0.8}
            >
              <Icon
                name={iconMap[selectedMenu] || "menu"}
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dropdownHeaderText}>{selectedMenu}</Text>
              <Icon
                name={dropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          
            {/* Floating dropdown list */}
            {dropdownVisible && (
              <View style={styles.dropdownOverlay}>
                <View style={styles.dropdownList}>
                  {menus.map((menu, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        selectedMenu === menu && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedMenu(menu);
                        setDropdownVisible(false);
                      }}
                    >
                      <Icon
                        name={iconMap[menu] || "menu"}
                        size={18}
                        color={selectedMenu === menu ? "#FFFFFF" : "#034833"}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedMenu === menu && styles.dropdownItemTextActive,
                        ]}
                      >
                        {menu}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
        {selectedMenu === "Dashboard" && <DashboardComponent />}
        {selectedMenu === "Bookings" && <BookingsComponent />}
        {selectedMenu === "Services" && <ServicesComponent />}
        {selectedMenu === "portfolio" && <PortfolioComponent />}
      </View>
      {/* Login Required Modal */}
            <Modal visible={showLoginModal} transparent animationType="fade" statusBarTranslucent onRequestClose={() => { }}>
              <View style={styles.loginBackdrop}>
                {/* True blur backdrop with light, white-tinted feel */}
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={20}
                  reducedTransparencyFallbackColor="white"
                />
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Login Required</Text>
                  </View>
                  <Text style={styles.modalLabel}>Please log in to view your dashboard.</Text>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.confirmButton} onPress={goToLogin}>
                      <Text style={styles.confirmButtonText}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
      {dropdownVisible ? <TouchableOpacity onPress={() => setDropdownVisible(false)} style={{ backgroundColor: 'rgba(0,0,0,0.1)', height: '100%', width: '100%', position: 'absolute' }} ></TouchableOpacity> : null}      
    </SafeAreaView>
  );
};

export default PhotographerDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerOutline: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerLogo: {
    height: 50,
    width: 64,
    marginBottom: 6,
  },
  welcomeText: {
    ...typography.semibold,
    fontSize: 18,
    color: COLORS.text.primary,
  },
  userName: {
    color: '#FF6B35',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  notificationIconOutline: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#034833',
    marginBottom: 8,
  },
  locationContainer: {
    alignItems: 'flex-end',
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#FF6B35',
    ...typography.semibold,
    marginLeft: 4,
  },

  /* MENU SECTION */
  bottomContainer: {
    padding: 20,
  },
  menuOutline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#034833',
    paddingLeft: 12,
    marginBottom: 10
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5
  },
  menuLabel: {
    fontSize: 15,
    color: '#2F2F2F',
    marginLeft: 6,
  },
 dropdownWrapper: {
  position: 'relative',
  zIndex: 10,
  flex: 1,
},
dropdownHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#034833',
  borderTopRightRadius: 22,
  borderBottomRightRadius: 22,
  paddingVertical: 12,
  paddingHorizontal: 16,
  elevation: 3,
},

dropdownHeaderText: {
  flex: 1,
  fontSize: 16,
  color: '#fff',
  fontWeight: '600',
},

dropdownOverlay: {
  position: 'absolute',
  top: 50, // below header
  left: 0,
  right: 0,
  borderRadius: 15,
  paddingVertical: 5,
  backgroundColor: 'rgba(0,0,0,0.1)',
  zIndex: 999,
},

dropdownList: {
  backgroundColor: '#FFFFFF',
  borderRadius: 15,
  marginHorizontal: 5,
  paddingVertical: 6,
  elevation: 8,
},

dropdownItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 10,
},

dropdownItemActive: {
  backgroundColor: '#034833',
  marginHorizontal: 5
},

dropdownItemText: {
  fontSize: 14,
  color: '#034833',
  fontWeight: '500',
},

dropdownItemTextActive: {
  color: '#FFFFFF',
  fontWeight: '600',
},
loginBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '88%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    ...typography.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    ...typography.semibold,
  },

});
