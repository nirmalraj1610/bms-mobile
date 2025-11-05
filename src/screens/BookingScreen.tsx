import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getBookings, doCheckinBooking, doCheckoutBooking, doRescheduleBooking, doCancelBooking } from '../features/bookings/bookingsSlice';
import { getStudioEquipmentThunk } from '../features/studios/studiosSlice';
import type { BookingHistoryItem, Equipment } from '../types/api';
import EquipmentSelectionModal from '../components/EquipmentSelectionModal';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [selectedBookingType, setSelectedBookingType] = useState<'studio' | 'photographer'>('studio');
  
  // Equipment selection state
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedBookingForEquipment, setSelectedBookingForEquipment] = useState<any>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<any[]>([]);

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<BookingHistoryItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleStartTime, setRescheduleStartTime] = useState<Date | null>(null);
  const [rescheduleEndTime, setRescheduleEndTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingHistoryItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Local UI state: track check-in/out per booking
  const [checkedInMap, setCheckedInMap] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

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
    const endTime = booking.end_time;
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    return {
      date: formattedDate,
      time: `${startTime} - ${endTime}`,
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
        // Raw fields preserved for logic checks (e.g., expiry)
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
        bookingType: booking.booking_type || 'studio', // Handle booking_type from API
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400', // Default image
        isFavorite: false,
        total_amount: booking.total_amount,
         // You can 
        // implement favorites logic later
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

  // Reschedule helpers
  const formatDateYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const formatTimeHM = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;

  const openRescheduleModal = (booking: any) => {
    // Find original booking by id for accurate date/time
    const original = bookings.find(b => b.id === booking.id);

    const baseDate = original?.booking_date ? new Date(original.booking_date) : new Date();
    setRescheduleDate(baseDate);

    const [sh, sm] = (original?.start_time || '09:00').split(':').map((v) => parseInt(v, 10));
    const [eh, em] = (original?.end_time || '11:00').split(':').map((v) => parseInt(v, 10));
    const start = new Date(baseDate);
    start.setHours(isNaN(sh) ? 9 : sh, isNaN(sm) ? 0 : sm, 0, 0);
    const end = new Date(baseDate);
    end.setHours(isNaN(eh) ? 11 : eh, isNaN(em) ? 0 : em, 0, 0);
    setRescheduleStartTime(start);
    setRescheduleEndTime(end);

    setSelectedBookingForReschedule(original || {
      id: booking.id,
      booking_date: formatDateYMD(baseDate),
      start_time: `${String(sh || 9).padStart(2, '0')}:${String(sm || 0).padStart(2, '0')}:00`,
      end_time: `${String(eh || 11).padStart(2, '0')}:${String(em || 0).padStart(2, '0')}:00`,
    } as unknown as BookingHistoryItem);
    setShowRescheduleModal(true);
  };

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setSelectedBookingForReschedule(null);
    setRescheduleDate(null);
    setRescheduleStartTime(null);
    setRescheduleEndTime(null);
    setShowDatePicker(false);
    setShowStartPicker(false);
    setShowEndPicker(false);
    setRescheduleLoading(false);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedBookingForReschedule || !rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      Alert.alert('Missing details', 'Please select date, start time, and end time.');
      return;
    }
    const new_booking_date = formatDateYMD(rescheduleDate);
    const new_start_time = formatTimeHM(rescheduleStartTime);
    const new_end_time = formatTimeHM(rescheduleEndTime);
    setRescheduleLoading(true);
    try {
      await dispatch(
        doRescheduleBooking({
          booking_id: selectedBookingForReschedule.id,
          new_booking_date,
          new_start_time,
          new_end_time,
        })
      ).unwrap();
      Alert.alert('Rescheduled', 'Your booking has been rescheduled.');
      closeRescheduleModal();
    } catch (err: any) {
      Alert.alert('Reschedule failed', err?.message || 'Unable to reschedule.');
      setRescheduleLoading(false);
    }
  };
  console.log(filteredBookings,'filteredBookingsfilteredBookings');
  
  // Handle Check-In
  const handleCheckInPress = async (bookingId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
      await dispatch(doCheckinBooking({ booking_id: bookingId })).unwrap();
      setCheckedInMap((prev) => ({ ...prev, [bookingId]: true }));
    } catch (e) {
      console.log('❌ Check-in failed:', e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Handle Check-Out
  const handleCheckOutPress = async (bookingId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
      await dispatch(doCheckoutBooking({ booking_id: bookingId })).unwrap();
      setCheckedInMap((prev) => ({ ...prev, [bookingId]: false }));
    } catch (e) {
      console.log('❌ Check-out failed:', e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // View Studio handler
  const handleViewStudio = (booking: any) => {
    const originalBooking = bookings.find(b => b.id === booking.id);
    const studioId = originalBooking?.studios?.id;
    if (studioId) {
      (navigation as any).navigate('StudioDetails', { studioId });
    } else {
      Alert.alert('Studio not found', 'Unable to open studio details.');
    }
  };

  // Cancel helpers
  const openCancelModal = (booking: any) => {
    const original = bookings.find(b => b.id === booking.id) || null;
    setSelectedBookingForCancel(original);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedBookingForCancel(null);
    setCancelReason('');
    setCancelLoading(false);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) {
      Alert.alert('No booking selected', 'Select a booking to cancel.');
      return;
    }
    if (!cancelReason.trim()) {
      Alert.alert('Reason required', 'Please enter a cancellation reason.');
      return;
    }
    setCancelLoading(true);
    try {
      await dispatch(
        doCancelBooking({ booking_id: selectedBookingForCancel.id, cancellation_reason: cancelReason.trim() })
      ).unwrap();
      Alert.alert('Cancelled', 'Your booking has been cancelled.');
      closeCancelModal();
    } catch (err: any) {
      Alert.alert('Cancel failed', err?.message || 'Unable to cancel booking.');
      setCancelLoading(false);
    }
  };
  const renderBookingItem = ({ item }: { item: any }) => {
    // Determine if the booking window has ended based on booking_date + end_time
    let hasEnded = false;
    try {
      const bookingDate = item?.booking_date ? new Date(item.booking_date) : null;
      if (bookingDate) {
        const [eh, em] = String(item?.end_time || '00:00').split(':').map((v) => parseInt(v, 10));
        const endDateTime = new Date(bookingDate);
        endDateTime.setHours(isNaN(eh) ? 0 : eh, isNaN(em) ? 0 : em, 0, 0);
        hasEnded = Date.now() > endDateTime.getTime();
      }
    } catch {}

    return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardMainContent}>
        {/* Left Section - Image and Price */}
        <View style={styles.leftSection}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <Text style={styles.priceText}>₹{item.total_amount || '200'}</Text>
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

          {/* <View style={styles.studioTag}>
            <Text style={styles.studioTagText}>Studio</Text>
          </View> */}

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
              {hasEnded ? (
                // After end time has passed: show only View Studio
                <TouchableOpacity style={styles.viewStudioButton} onPress={() => handleViewStudio(item)}>
                  <Text style={styles.viewStudioButtonText}>View Studio</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.rescheduleButton} onPress={() => openRescheduleModal(item)}>
                    <Icon name="schedule" size={14} color={COLORS.text.primary} />
                    <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                  
              <TouchableOpacity style={styles.cancelButton} onPress={() => openCancelModal(item)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
                  
                  {checkedInMap[item.id] ? (
                    <TouchableOpacity
                      style={styles.checkOutButton}
                      onPress={() => handleCheckOutPress(item.id)}
                      disabled={!!actionLoading[item.id]}
                    >
                      <Icon name="logout" size={14} color={COLORS.background} />
                      <Text style={styles.checkOutButtonText}>Check OUT</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.checkInButton}
                      onPress={() => handleCheckInPress(item.id)}
                      disabled={!!actionLoading[item.id]}
                    >
                      <Icon name="login" size={14} color={COLORS.background} />
                      <Text style={styles.checkInButtonText}>Check IN</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity style={styles.viewStudioButton} onPress={() => handleViewStudio(item)}>
                    <Text style={styles.viewStudioButtonText}>View Studio</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* Buttons for pending bookings */}
          {item.status === 'Pending' && (
            <View style={styles.actionButtonsContainer}>
              {hasEnded ? (
                // After end time: only View Studio
                <TouchableOpacity style={styles.viewStudioButton} onPress={() => handleViewStudio(item)}>
                  <Text style={styles.viewStudioButtonText}>View Studio</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.selectEquipmentButton}
                    onPress={() => handleSelectEquipment(item)}
                  >
                    {/* <Icon name="build" size={14} color="#00BCD4" /> */}
                    <Text style={styles.selectEquipmentButtonText}>Select{'\n'}Equipment</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.viewStudioButton} onPress={() => handleViewStudio(item)}>
                    <Text style={styles.viewStudioButtonText}>View Studio</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* Buttons for cancelled bookings */}
          {item.status === 'Cancelled' && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.viewStudioButton} onPress={() => handleViewStudio(item)}>
                <Text style={styles.viewStudioButtonText}>View Studio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
  };

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

        {/* Reschedule Modal */}
        <Modal
          visible={showRescheduleModal}
          transparent
          animationType="slide"
          onRequestClose={closeRescheduleModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reschedule Booking</Text>
                <TouchableOpacity onPress={closeRescheduleModal}>
                  <Icon name="close" size={22} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="event" size={18} color={COLORS.text.primary} />
                  <Text style={styles.modalButtonText}>
                    {rescheduleDate ? formatDateYMD(rescheduleDate) : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Start time</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Icon name="schedule" size={18} color={COLORS.text.primary} />
                  <Text style={styles.modalButtonText}>
                    {rescheduleStartTime ? formatTimeHM(rescheduleStartTime) : 'Select start'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>End time</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Icon name="schedule" size={18} color={COLORS.text.primary} />
                  <Text style={styles.modalButtonText}>
                    {rescheduleEndTime ? formatTimeHM(rescheduleEndTime) : 'Select end'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButtonModal} onPress={closeRescheduleModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, rescheduleLoading && { opacity: 0.6 }]}
                  onPress={handleConfirmReschedule}
                  disabled={rescheduleLoading}
                >
                  <Text style={styles.confirmButtonText}>{rescheduleLoading ? 'Saving...' : 'Confirm'}</Text>
                </TouchableOpacity>
              </View>

              {/* Pickers */}
              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={rescheduleDate || new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setRescheduleDate(date);
                  }}
                />
              )}
              {showStartPicker && (
                <DateTimePicker
                  mode="time"
                  value={rescheduleStartTime || new Date()}
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (date) setRescheduleStartTime(date);
                  }}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  mode="time"
                  value={rescheduleEndTime || new Date()}
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (date) setRescheduleEndTime(date);
                  }}
                />
              )}
            </View>
          </View>
        </Modal>
        
        {/* Cancel Modal */}
        <Modal
          visible={showCancelModal}
          transparent
          animationType="slide"
          onRequestClose={closeCancelModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cancel Booking</Text>
                <TouchableOpacity onPress={closeCancelModal}>
                  <Icon name="close" size={22} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>

              <View style={{ marginVertical: 8 }}>
                <Text style={styles.modalLabel}>Reason</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Enter cancellation reason"
                  placeholderTextColor={COLORS.text.secondary}
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButtonModal} onPress={closeCancelModal}>
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, cancelLoading && { opacity: 0.6 }]}
                  onPress={handleConfirmCancel}
                  disabled={cancelLoading}
                >
                  <Text style={styles.confirmButtonText}>{cancelLoading ? 'Cancelling...' : 'OK'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  checkOutButton: {
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
  checkOutButtonText: {
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
  // Reschedule modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  modalTextInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButtonModal: {
    backgroundColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default BookingScreen;