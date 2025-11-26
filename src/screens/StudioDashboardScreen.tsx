import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { DashboardComponent } from '../components/studioOwner/Dashboard';
import { MyStudioComponent } from '../components/studioOwner/MyStudio';
import { BookingsComponent } from '../components/studioOwner/Bookings';
import { ManageEquipmentComponent } from '../components/studioOwner/ManageEquipment';
import AddStudioComponent from '../components/studioOwner/AddStudio';
import { getUserData } from '../lib/http';
import { typography } from '../constants/typography';
import { BlurView } from '@react-native-community/blur';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import imagePaths from '../constants/imagePaths';
import { showInfo } from '../utils/helperFunctions';

/**
 * Minimal user type that matches fields used in this screen.
 * You can expand this with the real shape from your API.
 */
type Customer = {
  full_name?: string;
  customer_profiles?: {
    address?: {
      city?: string;
    };
  };
  // any other fields you use
};

const StudioDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [selectedMenu, setSelectedMenu] = useState<string>('Dashboard');
  const [editStudio, setEditStudio] = useState<boolean>(false);
  const [editStudioId, setEditStudioId] = useState('');
  const [currentUser, setCurrentUser] = useState<Customer | null>(null); // <-- fixed type
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    if (selectedMenu !== 'Add Studio' && selectedMenu !== 'Edit Studio') {
      setEditStudio(false);
      setEditStudioId('');
    }
  }, [selectedMenu]);

  useEffect(() => {
    const checkAuth = async () => {
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem('auth_token');
      } catch {
        // ignore
      }
      if (!token) {
        setShowLoginModal(true);
        showInfo('Please log in to view your dashboard!...');
        return;
      }
      try {
        const userData = await getUserData();
        const exp = userData?.session?.expires_at; // seconds epoch
        if (typeof exp === 'number') {
          const isExpired = exp * 1000 <= Date.now();
          if (isExpired) {
            setShowLoginModal(true);
            showInfo('Please log in to view your dashboard!...');
            return;
          } else {
            const user = userData?.customer;
            // cast/assign safely
            setCurrentUser((user as Customer) ?? null);
          }
        } else {
          // If no session expiry in response, still try to set customer if provided
          const user = userData?.customer;
          if (user) setCurrentUser(user as Customer);
        }
      } catch (err) {
        // optionally log
        console.warn('getUserData error', err);
      }
    };

    if (isFocused) {
      checkAuth();
    }
  }, [isFocused]);

  // Login modal handlers
  const closeLoginModal = () => setShowLoginModal(false);
  const goToLogin = () => {
    setShowLoginModal(false);
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const menus = [
    'Dashboard',
    'My Studios',
    'Bookings',
    editStudio ? 'Edit Studio' : 'Add Studio',
    'Manage Equipments',
  ];


const iconMap: Record<string, string> = {
    Dashboard: "space-dashboard",
    "My Studios": "photo-camera",
    Bookings: "calendar-month",
    "Add Studio": "add-business",
    "Edit Studio": "edit",
    "Manage Equipments": "handyman", // default/fallback example
  };

  const activeMenuLabel =
    selectedMenu === "Add Studio" && editStudio ? "Edit Studio" : selectedMenu;

  // safe-first-name extraction
  const firstName =
    typeof currentUser?.full_name === 'string' && currentUser.full_name.length > 0
      ? currentUser.full_name.split(' ')[0]
      : 'User';

  const city =
    currentUser?.customer_profiles?.address?.city ?? 'Unknown';

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
              Hello<Text style={styles.userName}> {firstName} !</Text>
            </Text>
          </View>

          {/* Right: Notifications + Location */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationIconOutline}>
              <Image source={imagePaths.NotificationNew} resizeMode="contain" style={styles.notificationIcon} />
            </TouchableOpacity>

            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <View style={styles.locationRow}>
                <Image source={imagePaths.LocationNew} resizeMode="contain" style={{ height: 14, width: 14 }} />
                <Text style={styles.locationText}>{city}</Text>
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
                name={iconMap[activeMenuLabel] || "menu"}
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dropdownHeaderText}>{activeMenuLabel}</Text>
              <Icon
                name={dropdownVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
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
                        activeMenuLabel === menu && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedMenu(menu);
                        setDropdownVisible(false);
                      }}
                    >
                      <Icon
                        name={iconMap[menu] || 'menu'}
                        size={18}
                        color={activeMenuLabel === menu ? "#FFFFFF" : "#034833"}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.dropdownItemText,
                          activeMenuLabel === menu && styles.dropdownItemTextActive,
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

        {activeMenuLabel === "Dashboard" && <DashboardComponent />}
        {activeMenuLabel === "My Studios" && <MyStudioComponent onPressAddStudio={(i) => setSelectedMenu(i)} editStudio={(i) => setEditStudio(i)} editStudioId={(id) => setEditStudioId(id)} />}
        {activeMenuLabel === "Bookings" && <BookingsComponent />}
        {activeMenuLabel === "Manage Equipments" && <ManageEquipmentComponent />}
        {(activeMenuLabel === "Add Studio" || activeMenuLabel === "Edit Studio") && (
          <AddStudioComponent
            onPressSelectmenu={(i) => setSelectedMenu(i)}
            editStudio={editStudio}
            editStudioId={editStudioId}
          />
        )}
      </View>

      {/* Login Required Modal */}
      {showLoginModal && (
        <View style={{ flex: 1, height: '100%', width: '100%', position: 'absolute', margin: 0, zIndex: 99 }}>
          <View style={styles.loginBackdrop}>
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
        </View>
      )}

      {dropdownVisible ? (
        <TouchableOpacity onPress={() => setDropdownVisible(false)} style={{ backgroundColor: 'rgba(0,0,0,0.1)', height: '100%', width: '100%', position: 'absolute' }} />
      ) : null}
    </SafeAreaView>
  );
};

export default StudioDashboardScreen;

// styles unchanged (kept as in your original file)
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
    marginTop: 10,
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
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#034833',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  notificationIcon: {
    height: 22,
    width: 22,
  },
  locationContainer: {
    alignItems: 'flex-end',
  },
  locationLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginBottom: 2,
    ...typography.medium,
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

  bottomContainer: {
    padding: 20,
  },
  menuOutline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#034833',
    paddingLeft: 12,
    marginBottom: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  menuLabel: {
    fontSize: 14,
    color: '#2F2F2F',
    marginLeft: 6,
    ...typography.medium,
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
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 3,
  },
  dropdownHeaderText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    ...typography.semibold,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 50,
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
    marginHorizontal: 5,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#034833',
    ...typography.semibold,
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    ...typography.bold,
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
    ...typography.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: COLORS.bg,
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...typography.semibold,
  },
});
