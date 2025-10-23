import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';

// Dummy components for each tab
const MyStudios = () => <Text style={styles.contentText}>My Studios Component</Text>;
const Bookings = () => <Text style={styles.contentText}>Bookings Component</Text>;
const AddStudio = () => <Text style={styles.contentText}>Add Studio Component</Text>;
const ManageEquipments = () => <Text style={styles.contentText}>Manage Equipments Component</Text>;

const DashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studios' | 'bookings' | 'add' | 'equipments'>('studios');

  const renderContent = () => {
    switch (activeTab) {
      case 'studios':
        return <MyStudios />;
      case 'bookings':
        return <Bookings />;
      case 'add':
        return <AddStudio />;
      case 'equipments':
        return <ManageEquipments />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('studios')}>
          <MaterialIcons
            name="business"
            size={26}
            color={activeTab === 'studios' ? '#000000' : '#525050'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'studios' ? '#000000' : '#525050' },
            ]}
          >
            My Studios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('bookings')}>
          <MaterialIcons
            name="event"
            size={26}
            color={activeTab === 'bookings' ? '#000000' : '#525050'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'bookings' ? '#000000' : '#525050' },
            ]}
          >
            Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('add')}>
          <MaterialIcons
            name="add-circle-outline"
            size={28}
            color={activeTab === 'add' ? '#000000' : '#525050'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'add' ? '#000000' : '#525050' },
            ]}
          >
            Add Studio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('equipments')}>
          <MaterialIcons
            name="build"
            size={26}
            color={activeTab === 'equipments' ? '#000000' : '#525050'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'equipments' ? '#000000' : '#525050' },
            ]}
          >
            Equipments
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>{renderContent()}</View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  tabBar: {
    margin: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    paddingVertical: 10,
    borderWidth:1,
    borderColor: '#595656'
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
