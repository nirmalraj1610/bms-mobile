import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

// Mock booking data
const mockBookings = [
  {
    id: '1',
    studioName: 'Rez Photography',
    date: 'Monday, Dec 11',
    time: '2:00 PM',
    status: 'Confirmed',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
    isFavorite: true,
  },
  {
    id: '2',
    studioName: 'Mk Studioz',
    date: 'Tue, Sep 24',
    time: '5:00 PM',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1554048612-b6ebae92138d?w=400',
    isFavorite: true,
  },
];

const mockPastBookings = [
  {
    id: '3',
    studioName: 'JD Capture',
    date: 'Tue, Sep 24',
    time: '5:00 PM',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    isFavorite: true,
  },
];

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockBookings;
    return mockBookings.filter((booking) =>
      booking.studioName.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredPastBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockPastBookings;
    return mockPastBookings.filter((booking) =>
      booking.studioName.toLowerCase().includes(q)
    );
  }, [query]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return COLORS.success;
      case 'Completed':
        return COLORS.bg;
      default:
        return COLORS.text.secondary;
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.studioName}>{item.studioName}</Text>
          <TouchableOpacity>
            <Icon 
              name="favorite" 
              size={20} 
              color={item.isFavorite ? COLORS.favColor : COLORS.text.secondary} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.dateTime}>{item.date} {item.time}</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>My Bookings</Text>
          <Text style={styles.screenSubtitle}>View your upcoming & past sessions</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Icon name="search" size={18} color={COLORS.text.secondary} />
              <TextInput
                style={styles.searchPlaceholder}
                placeholder="Search..."
                placeholderTextColor={COLORS.text.secondary}
                value={query}
                onChangeText={setQuery}
              />
              <TouchableOpacity style={styles.searchIconButton}>
                <Icon name="search" size={20} color={COLORS.background} />
              </TouchableOpacity>
            </View>
          </View>

        {/* Upcoming Bookings */}
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            filteredBookings.length > 0 ? null : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming bookings found</Text>
              </View>
            )
          }
          ListFooterComponent={
            <View>
              {/* Past Sessions Section */}
              <Text style={styles.sectionTitle}>Past Sessions</Text>
              {filteredPastBookings.map((item) => (
                <View key={item.id}>
                  {renderBookingItem({ item })}
                </View>
              ))}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBlock: {
    marginTop: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  screenSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 30,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: COLORS.background,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  searchIconButton: {
    width: 60,
    height: 40,
    padding: 10,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    // backgroundColor: COLORS.bg2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#ffffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#F0F2F5',
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studioName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  dateTime: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default BookingScreen;