import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getBookings } from '../features/bookings/bookingsSlice';
import { getStudioEquipmentThunk } from '../features/studios/studiosSlice';
import type { BookingHistoryItem, Equipment } from '../types/api';
import EquipmentSelectionModal from '../components/EquipmentSelectionModal';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [selectedBookingType, setSelectedBookingType] = useState<'studio' | 'photographer'>('studio');
  
  // Equipment selection state
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedBookingForEquipment, setSelectedBookingForEquipment] = useState<any>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<any[]>([]);

  // Get booking data from Redux store
  const { items: bookings, loading, error } = useAppSelector((state) => state.bookings);
  
  // Get equipment data from Redux store
  const equipmentState = useAppSelector((state) => state.studios.equipment);

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

  // Filter bookings based on search query and booking type
  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return transformedBookings.filter(booking => 
        (booking.status === 'Confirmed' || booking.status === 'Pending') &&
        booking.bookingType === selectedBookingType
      );
    }
    return transformedBookings.filter((booking) =>
      booking.studioName.toLowerCase().includes(q) &&
      (booking.status === 'Confirmed' || booking.status === 'Pending') &&
      booking.bookingType === selectedBookingType
    );
  }, [query, transformedBookings, selectedBookingType]);

  const filteredPastBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return transformedBookings.filter(booking => 
        (booking.status === 'Completed' || booking.status === 'Cancelled') &&
        booking.bookingType === selectedBookingType
      );
    }
    return transformedBookings.filter((booking) =>
      booking.studioName.toLowerCase().includes(q) &&
      (booking.status === 'Completed' || booking.status === 'Cancelled') &&
      booking.bookingType === selectedBookingType
    );
  }, [query, transformedBookings, selectedBookingType]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          backgroundColor: '#9E9E9E',
          borderWidth: 0,
        };
      case 'Cancelled':
        return {
          backgroundColor: COLORS.error,
          borderWidth: 0,
        };
      case 'Confirmed':
        return {
          backgroundColor: '#FFC107',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: COLORS.bg,
          borderWidth: 0,
        };
    }
  };

  const getStatusTextStyles = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          color: '#FFFFFF',
        };
      case 'Cancelled':
        return {
          color: '#FFFFFF',
        };
      case 'Confirmed':
        return {
          color: '#000000',
        };
      default:
        return {
          color: COLORS.text.secondary,
        };
    }
  };

  // Equipment selection handler
  const handleSelectEquipment = (booking: any) => {
    console.log('🔧 Select Equipment clicked for booking:', booking);
    
    // Find the original booking data to get studio_id
    const originalBooking = bookings.find(b => b.id === booking.id);
    console.log('📍 Original booking data:', originalBooking);
    
    if (originalBooking?.studios?.id) {
      console.log('✅ Studio ID found:', originalBooking.studios.id);
      console.log('📡 Dispatching getStudioEquipmentThunk...');
      
      setSelectedBookingForEquipment(booking);
      
      dispatch(getStudioEquipmentThunk({ 
        studio_id: originalBooking.studios.id, 
        available_only: true 
      }));
      
      setShowEquipmentModal(true);
      console.log('✅ Equipment modal should now be visible');
    } else {
      console.log('❌ No studio ID found in booking data');
      console.log('📊 Available booking data:', originalBooking);
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardMainContent}>
        {/* Left Section - Image and Price */}
        <View style={styles.leftSection}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <Text style={styles.priceText}>₹{item.price || '200'}</Text>
        </View>

        {/* Middle Section - Main Content */}
        <View style={styles.middleSection}>
          <Text style={styles.studioName}>{item.studioName}</Text>
          
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color={COLORS.text.secondary} />
            <Text style={styles.locationText}>{item.location || 'chennai'}</Text>
          </View>
          
          <View style={styles.dateRow}>
            <Icon name="calendar-today" size={16} color={COLORS.text.secondary} />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          
          <View style={styles.timeRow}>
            <Icon name="access-time" size={16} color={COLORS.text.secondary} />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>

          <View style={styles.studioTag}>
            <Text style={styles.studioTagText}>Studio</Text>
          </View>

          {/* <Text style={styles.bookingId}>Booking ID: {item.bookingId || '1349c3e1-55a9-4cce-8154-a0ca17f84d03'}</Text>
          <Text style={styles.bookedOn}>Booked on: {item.bookedOn || '2025-10-29T12:44:18.429259+00:00'}</Text> */}
        </View>

        {/* Right Section - Status and Action Buttons */}
        <View style={styles.rightSection}>
          <View style={[styles.statusBadge, getStatusStyles(item.status)]}>
          
            <Text style={[styles.statusBadgeText, getStatusTextStyles(item.status)]}>
                {/* {item.status === 'Cancelled' && (
              <Icon name="close" size={14} color="#FFFFFF" style={styles.iconStyle} />
            )} */}
              {item.status}
            </Text>
          </View>

          {/* Conditional buttons based on status */}
          {item.status === 'Confirmed' && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.rescheduleButton}>
                <Icon name="schedule" size={14} color={COLORS.text.primary} />
                <Text style={styles.rescheduleButtonText}>Reschedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.checkInButton}>
                <Icon name="login" size={14} color={COLORS.background} />
                <Text style={styles.checkInButtonText}>Check IN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.viewStudioButton}>
                <Text style={styles.viewStudioButtonText}>View Studio</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Buttons for pending bookings */}
          {item.status === 'Pending' && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.selectEquipmentButton}
                onPress={() => handleSelectEquipment(item)}
              >
                {/* <Icon name="build" size={14} color="#00BCD4" /> */}
                <Text style={styles.selectEquipmentButtonText}>Select{'\n'}Equipment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.viewStudioButton}>
                <Text style={styles.viewStudioButtonText}>View Studio</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Buttons for cancelled bookings */}
          {item.status === 'Cancelled' && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.viewStudioButton}>
                <Text style={styles.viewStudioButtonText}>View Studio</Text>
              </TouchableOpacity>
            </View>
          )}
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

        {/* Booking Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedBookingType === 'studio' && styles.toggleButtonActive
            ]}
            onPress={() => setSelectedBookingType('studio')}
          >
            <Icon 
              name="business" 
              size={16} 
              color={selectedBookingType === 'studio' ? COLORS.background : COLORS.text.secondary} 
            />
            <Text style={[
              styles.toggleButtonText,
              selectedBookingType === 'studio' && styles.toggleButtonTextActive
            ]}>
              Studio 
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedBookingType === 'photographer' && styles.toggleButtonActive
            ]}
            onPress={() => setSelectedBookingType('photographer')}
          >
            <Icon 
              name="camera-alt" 
              size={16} 
              color={selectedBookingType === 'photographer' ? COLORS.background : COLORS.text.secondary} 
            />
            <Text style={[
              styles.toggleButtonText,
              selectedBookingType === 'photographer' && styles.toggleButtonTextActive
            ]}>
              Photographer
            </Text>
          </TouchableOpacity>
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

      {/* Equipment Selection Modal */}
      <EquipmentSelectionModal
        visible={showEquipmentModal}
        equipment={equipmentState.equipment}
        loading={equipmentState.loading}
        selectedEquipment={selectedEquipment}
        bookingId={selectedBookingForEquipment?.id}
        onClose={() => {
          console.log('🚪 Closing equipment modal');
          setShowEquipmentModal(false);
          setSelectedBookingForEquipment(null);
        }}
        onSelectEquipment={(equipment: Equipment, quantity: number) => {
          console.log('✅ Equipment selected:', equipment, 'Quantity:', quantity);
          const existingIndex = selectedEquipment.findIndex(eq => eq.id === equipment.id);
          if (existingIndex >= 0) {
            // Update existing equipment quantity
            const updatedEquipment = [...selectedEquipment];
            updatedEquipment[existingIndex] = { ...equipment, selectedQuantity: quantity };
            setSelectedEquipment(updatedEquipment);
          } else {
            // Add new equipment
            setSelectedEquipment([...selectedEquipment, { ...equipment, selectedQuantity: quantity }]);
          }
        }}
        onRemoveEquipment={(equipmentId: string) => {
          console.log('❌ Removing equipment:', equipmentId);
          setSelectedEquipment(selectedEquipment.filter(eq => eq.id !== equipmentId));
        }}
      />
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
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  cardMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 16,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  middleSection: {
    flex: 1,
    paddingRight: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  studioName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  studioTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  studioTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  bookingId: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  bookedOn: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconStyle: {
   
    marginRight: 4,
    marginTop: 10,
  },
  actionButtonsContainer: {
    gap: 8,
    alignItems: 'flex-end',
  },
  rescheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffff',
    borderWidth: 1,
    borderColor: '#ffcc00ff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 4,
    minWidth: 100,
    elevation: 1,

  },
  rescheduleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.black,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff0000ff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 100,
    elevation: 1,
    
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff0000ff',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    minWidth: 100,
  },
  checkInButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.background,
  },
  viewStudioButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  viewStudioButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  selectEquipmentButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00BCD4',
    paddingVertical: 5,
    paddingHorizontal: 5,
    gap: 4,
    minWidth: 100,
    minHeight: 50,
  },
  selectEquipmentButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BCD4',
    textAlign: 'center',
    lineHeight: 16,
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    borderColor: COLORS.bg,
    borderWidth: 1,
    padding: 8,
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.bg,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginLeft: 6,
  },
  toggleButtonTextActive: {
    color: COLORS.background,
  },
});

export default BookingScreen;