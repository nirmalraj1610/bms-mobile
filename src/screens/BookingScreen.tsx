import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getBookings } from '../features/bookings/bookingsSlice';
import type { BookingHistoryItem } from '../types/api';

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');

  // Get booking data from Redux store
  const { items: bookings, loading, error } = useAppSelector((state) => state.bookings);

  // Fetch bookings on component mount
  useEffect(() => {
    dispatch(getBookings({}));
  }, [dispatch]);

  // Helper function to format date and time
  const formatDateTime = (booking: BookingHistoryItem) => {
    const date = new Date(booking.booking_date);
    const startTime = booking.start_time;
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    return {
      date: formattedDate,
      time: startTime
    };
  };
console.log('bookings:', bookings);

  // Transform API data to match component expectations
  const transformedBookings = useMemo(() => {
    return bookings.map((booking: BookingHistoryItem) => {
      const { date, time } = formatDateTime(booking);
      return {
        id: booking.id,
        studioName: booking.studios?.name || 'Unknown Studio',
        date,
        time,
        status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
        bookingType: booking.booking_type || 'studio', // Handle booking_type from API
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400', // Default image
        isFavorite: false, // You can implement favorites logic later
      };
    });
  }, [bookings]);

  // Filter bookings based on search query
  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return transformedBookings.filter(booking => 
        booking.status === 'Confirmed' || booking.status === 'Pending'
      );
    }
    return transformedBookings.filter((booking) =>
      booking.studioName.toLowerCase().includes(q) &&
      (booking.status === 'Confirmed' || booking.status === 'Pending')
    );
  }, [query, transformedBookings]);

  const filteredPastBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return transformedBookings.filter(booking => 
        booking.status === 'Completed' || booking.status === 'Cancelled'
      );
    }
    return transformedBookings.filter((booking) =>
      booking.studioName.toLowerCase().includes(q) &&
      (booking.status === 'Completed' || booking.status === 'Cancelled')
    );
  }, [query, transformedBookings]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          backgroundColor: '#FFFFFF',
          color: COLORS.bg, // Green text
          borderColor: COLORS.bg,
          borderWidth: 1,
        };
      case 'Cancelled':
        return {
          backgroundColor: COLORS.error, // Green background
          color: '#FFFFFF', // White text
          borderWidth: 0,
        };
      case 'Confirmed':
        return {
          backgroundColor: COLORS.bg, // Green background
          color: '#FFFFFF', // White text
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: COLORS.bg,
          color: COLORS.text.secondary,
          borderWidth: 0,
        };
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        {/* <View style={styles.cardHeader}>
          <TouchableOpacity>
            <Icon 
              name="favorite" 
              size={20} 
              color={item.isFavorite ? COLORS.favColor : COLORS.text.secondary} 
            />
          </TouchableOpacity>
        </View> */}
          {/* <Text style={styles.studioName}>{item.studioName}</Text> */}
        <Text style={styles.dateTime1}>{item.studioName}</Text>
        <Text style={styles.dateTime}>{item.date} {item.time}</Text>
        <Text style={styles.bookingType}>
          Booking type : {item.bookingType === 'studio' ? 'Studio Booking' : 'Photographer Booking'}
        </Text>

        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, getStatusStyles(item.status)]}>
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

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.bg} />
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading bookings: {error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => dispatch(getBookings({}))}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Bookings */}
        {!loading && !error && (
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
                {filteredPastBookings.length > 0 ? (
                  filteredPastBookings.map((item) => (
                    <View key={item.id}>
                      {renderBookingItem({ item })}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No past sessions found</Text>
                  </View>
                )}
              </View>
            }
          />
        )}
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
    justifyContent: 'flex-end',
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
    marginBottom: 20,
    // marginTop: 4,

    
    

  },
  dateTime1: {
    fontSize: 16,
    color: COLORS.text.primary,

    fontWeight: '700',

    marginTop: 4,
  },
  bookingType: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  statusContainer: {
    alignSelf: 'flex-end',
    // marginTop: 8,
    marginRight:15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookingScreen;