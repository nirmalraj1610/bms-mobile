import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants';
import { DashboardComponent } from '../components/studioOwner/Dashboard';
import { MyStudioComponent } from '../components/studioOwner/MyStudio';
import { BookingsComponent } from '../components/studioOwner/Bookings';
import { ManageEquipmentComponent } from '../components/studioOwner/ManageEquipment';
import AddStudioComponent from '../components/studioOwner/AddStudio';
import { getUserData } from '../lib/http';
import { typography } from '../constants/typography';

const StudioDashboardScreen: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const [editStudio, setEditStudio] = useState(false);
  const [editStudioValues, setEditStudioValues] = useState({});
  const [currentUser, setCurrentUser] = useState<string | null>('User');

  useEffect(() => {
    if (selectedMenu !== 'Add Studio') {
      setEditStudio(false);
      setEditStudioValues({})
    }
  }, [selectedMenu])

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

  const menus = [
    'Dashboard',
    'My Studios',
    'Bookings',
    'Add Studio',
    'Manage Equipments',
  ];

  const iconMap = {
    Dashboard: "space-dashboard",
    "My Studios": "photo-camera",
    Bookings: "calendar-month",
    "Add Studio": "add-business",
    "Manage Equipments": "handyman", // default/fallback example
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
                <Icon name="location-on" size={16} color="#034833" />
                <Text style={styles.locationText}>{currentUser?.customer_profiles?.address?.city}</Text>
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
          <View style={styles.pickerWrapper}>
            <Icon name={iconMap[selectedMenu] || "menu"} size={18} color="#FFFFFF" />
            <Picker
              selectedValue={selectedMenu}
              onValueChange={(value) => setSelectedMenu(value)}
              dropdownIconColor="#FFFFFF"
              style={styles.picker}
            >
              {menus.map((menu, index) => (
                <Picker.Item key={index} label={menu} value={menu} />
              ))}
            </Picker>
          </View>
        </View>
        {selectedMenu === "Dashboard" && <DashboardComponent />}
        {selectedMenu === "My Studios" && <MyStudioComponent onPressAddStudio={(i) => setSelectedMenu(i)} editStudio={(i) => setEditStudio(i)} editStudioValues={(values) => setEditStudioValues(values)} />}
        {selectedMenu === "Bookings" && <BookingsComponent />}
        {selectedMenu === "Manage Equipments" && <ManageEquipmentComponent />}
        {selectedMenu === "Add Studio" && <AddStudioComponent onPressSelectmenu={(i) => setSelectedMenu(i)} editStudio={editStudio} editStudioValues={editStudioValues} />}
      </View>
    </SafeAreaView>
  );
};

export default StudioDashboardScreen;

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
    fontSize: 16,
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
  pickerWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#034833',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  picker: {
    color: '#FFFFFF',
    width: '100%',
  },

});
