import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { studioAvailabilityThunk } from '../features/studios/studiosSlice';
import { doCreateBooking } from '../features/bookings/bookingsSlice';
import { COLORS } from '../constants';
import { ENV } from '../config/env';

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  studio: any;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface CalendarDay {
  day: number;
  date: string;
  isPast: boolean;
  isToday: boolean;
}

const { width } = Dimensions.get('window');

const BookingModal: React.FC<BookingModalProps> = ({ visible, onClose, studio }) => {
  // console.log('BookingModal - Received studio prop:', studio);
  // console.log('BookingModal - Studio ID:', studio?.id);
  // console.log('BookingModal - Studio type:', typeof studio?.id);
  
  const dispatch = useAppDispatch();
  const availabilityState = useAppSelector(state => state.studios.availability);
  const bookingsState = useAppSelector(state => state.bookings);

  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState('');
  
  // Booking state
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDurationHours, setSelectedDurationHours] = useState(2);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate available time slots based on bookings
  const generateAvailableTimeSlots = (bookings: any[]) => {
    const slots: TimeSlot[] = [];
    const bookedSlots = new Set();
    
    // Mark booked time slots
    bookings.forEach(booking => {
      const key = `${booking.start_time}-${booking.end_time}`;
      bookedSlots.add(key);
    });
    
    // Generate all possible time slots (9 AM to 6 PM, 2-hour slots)
    for (let hour = 9; hour <= 18; hour += 2) {
      const startTime = `${String(hour).padStart(2, '0')}:00:00`;
      const endTime = `${String(hour + 2).padStart(2, '0')}:00:00`;
      const slotKey = `${startTime}-${endTime}`;
      
      slots.push({
        start_time: startTime,
        end_time: endTime,
        is_booked: bookedSlots.has(slotKey),
      });
    }
    
    return slots;
  };

  // Generate calendar days for current month
  const generateCalendarDays = (): (CalendarDay | null)[] => {
    const todayDate = new Date();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (CalendarDay | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = date < new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
      days.push({
        day,
        date: dateString,
        isPast,
        isToday: day === todayDate.getDate() && currentMonth === todayDate.getMonth() && currentYear === todayDate.getFullYear(),
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle date selection
  // Test function to manually test availability API
  const testAvailabilityAPI = async () => {
    console.log('=== Testing Availability API ===');
    const testPayload = {
      studio_id: '97098219-80bb-4595-9449-7efeee39d169', // Real studio ID from logs
      date: '2024-01-15'
    };
    console.log('Testing with payload:', testPayload);
    
    try {
      const result = await dispatch(studioAvailabilityThunk(testPayload));
      console.log('Test API result:', result);
      Alert.alert('API Test', `Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('Test API error:', error);
      Alert.alert('API Test Error', `Error: ${error}`);
    }
  };

  const handleDateSelect = async (date: string) => {
    // console.log('=== BookingModal Date Selection Debug ===');
    // console.log('Selected date:', date);
    // console.log('Studio object received:', studio);
    // console.log('Studio object type:', typeof studio);
    // console.log('Studio object keys:', studio ? Object.keys(studio) : 'null');
    // console.log('Full studio object JSON:', JSON.stringify(studio, null, 2));
    
    setSelectedDate(date);
    setShowTimeSlots(true);
    setSelectedTime('');
    setSelectedSlot(null);
    
    // Extract studio ID with comprehensive validation
    let studioId = studio?.id;
    console.log('Initial studioId:', studioId, 'Type:', typeof studioId);
    
    // Check if studio has other ID fields
    if (studio) {
      console.log('Checking for alternative ID fields:');
      console.log('studio._id:', (studio as any)._id);
      console.log('studio.studio_id:', (studio as any).studio_id);
      console.log('studio.studioId:', (studio as any).studioId);
    }
    
    // More robust validation
    if (!studio) {
      console.error('BookingModal - Studio object is null or undefined');
      setTimeSlots([]);
      return;
    }
    
    // Comprehensive validation for studio ID
    if (!studioId || 
        studioId === null || 
        studioId === undefined || 
        studioId === '' || 
        studioId === 'undefined' || 
        studioId === 'null') {
      console.error('❌ Invalid studio ID detected:', studioId);
      console.error('Studio object:', JSON.stringify(studio, null, 2));
      Alert.alert('Error', 'Studio information is not available. Please try again.');
      setTimeSlots([]);
      return;
    }
    
    console.log('✅ Valid studioId confirmed:', studioId);
    
    const studioIdString = String(studioId).trim();
    if (studioIdString === '' || studioIdString === 'undefined' || studioIdString === 'null') {
      console.error('BookingModal - Studio ID is invalid:', studioIdString);
      setTimeSlots([]);
      return;
    }
    
    // console.log('BookingModal - Dispatching studioAvailabilityThunk with studio_id:', studioIdString, 'date:', date);
    
    try {
      const result = await dispatch(studioAvailabilityThunk({ studio_id: studioIdString, date }));
      if (studioAvailabilityThunk.fulfilled.match(result)) {
        console.log('BookingModal - Successfully fetched availability:', result.payload);
        const availableSlots = generateAvailableTimeSlots(result.payload.bookings || []);
        setTimeSlots(availableSlots);
      } else {
        console.error('BookingModal - Failed to fetch availability:', result.payload);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('BookingModal - Error fetching time slots:', error);
      setTimeSlots([]);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setSelectedTime(`${slot.start_time}-${slot.end_time}`);
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    const hourlyRate = studio?.pricing?.hourly_rate || studio?.pricing?.hourlyRate || 100;
    return selectedDurationHours * hourlyRate;
  }, [selectedDurationHours, studio]);

  // Handle Razorpay payment and booking creation
  const handleBookNow = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Error', 'Please select a date and time slot');
      return;
    }

    if (!studio?.id) {
      Alert.alert('Error', 'Studio information is missing');
      return;
    }

    if (!ENV.RAZORPAY_KEY_ID) {
      Alert.alert('Error', 'Payment configuration is missing');
      return;
    }

    if (totalAmount <= 0) {
      Alert.alert('Error', 'Invalid booking amount');
      return;
    }

    setIsBooking(true);
    
    try {
      // Validate RazorpayCheckout is available
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        throw new Error('Payment service is not available');
      }

      // Prepare Razorpay options
      const options = {
        description: `Studio Booking - ${studio?.name}`,
        image: 'https://i.imgur.com/3g7nmJC.png', // Your app logo
        currency: 'INR',
        key: ENV.RAZORPAY_KEY_ID,
        amount: totalAmount * 100, // Amount in paise
        name: 'BookMyShoot',
        order_id: '', // Will be generated from backend if needed
        prefill: {
          email: 'user@example.com', // You can get this from user profile
          contact: '9999999999', // You can get this from user profile
          name: 'User Name' // You can get this from user profile
        },
        theme: {
          color: COLORS.primary
        }
      };

      console.log('Initializing payment with options:', options);

      // Open Razorpay checkout
      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          // Payment successful, now create booking
          console.log('Payment successful:', data);
          
          try {
            const bookingPayload = {
              studio_id: String(studio.id),
              booking_date: selectedDate,
              start_time: selectedSlot.start_time,
              end_time: selectedSlot.end_time,
              total_amount: totalAmount,
            };

            const result = await dispatch(doCreateBooking(bookingPayload));
            console.log('Booking creation result:', result);
            
            if (doCreateBooking.fulfilled.match(result)) {
              Alert.alert(
                'Booking Successful!',
                `Your studio booking has been confirmed for ${selectedDate} from ${selectedSlot.start_time} to ${selectedSlot.end_time}.\n\nPayment ID: ${data.razorpay_payment_id}\nTotal Amount: ₹${totalAmount.toLocaleString()}`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onClose();
                      // Reset states
                      setSelectedDate('');
                      setSelectedTime('');
                      setSelectedSlot(null);
                      setShowTimeSlots(false);
                      setSelectedDurationHours(2);
                    }
                  }
                ]
              );
            } else {
              Alert.alert(
                'Booking Failed', 
                'Payment was successful but booking creation failed. Please contact support with Razorpay payment ID: ' + data.razorpay_payment_id
              );
            }
          } catch (bookingError) {
            console.error('Booking creation error:', bookingError);
            Alert.alert(
              'Booking Failed', 
              'Payment was successful but booking creation failed. Please contact support with payment ID: ' + data.razorpay_payment_id
            );
          }
        })
        .catch((error: any) => {
          // Payment failed or cancelled
          console.log('Payment failed or cancelled:', error);
          
          if (error.code === 'payment_cancelled') {
            Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
          } else if (error.code === 'payment_failed') {
            Alert.alert('Payment Failed', error.description || 'Payment could not be processed. Please try again.');
          } else {
            Alert.alert('Payment Error', 'An error occurred during payment. Please try again.');
          }
        });
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', 'Unable to initialize payment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Studio</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Test Button for API Debugging */}
          {/* <TouchableOpacity 
            style={{
              backgroundColor: '#ff6b6b',
              padding: 10,
              margin: 10,
              borderRadius: 5,
              alignItems: 'center'
            }}
            onPress={testAvailabilityAPI}
          >
            <Text style={{color: 'white', fontWeight: 'bold'}}>
              TEST AVAILABILITY API
            </Text>
          </TouchableOpacity> */}

          {/* Studio Info */}
          <View style={styles.studioInfo}>
            <Text style={styles.studioName}>{studio?.name}</Text>
            <Text style={styles.studioPrice}>
              ₹{(studio?.pricing?.hourly_rate || studio?.pricing?.hourlyRate || 100).toLocaleString()}/hour
            </Text>
          </View>

          {/* Calendar Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="calendar-today" size={20} color={COLORS.primary} /> Select Date
            </Text>
            
            {/* Month Header */}
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                <Icon name="chevron-left" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {monthNames[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                <Icon name="chevron-right" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdayHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((dayObj, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    dayObj?.isPast && styles.pastDay,
                    selectedDate === dayObj?.date && styles.selectedDay,
                    dayObj?.isToday && styles.todayDay,
                  ]}
                  disabled={!dayObj || dayObj.isPast}
                  onPress={() => dayObj && handleDateSelect(dayObj.date)}
                >
                  {dayObj && (
                    <Text
                      style={[
                        styles.calendarDayText,
                        dayObj.isPast && styles.pastDayText,
                        selectedDate === dayObj.date && styles.selectedDayText,
                        dayObj.isToday && styles.todayDayText,
                      ]}
                    >
                      {dayObj.day}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Slots Section */}
          {showTimeSlots && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="access-time" size={20} color={COLORS.primary} /> Available Time Slots
              </Text>
              
              <Text style={styles.selectedDateText}>
                {formatDateForDisplay(selectedDate)}
              </Text>

              {availabilityState.loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading time slots...</Text>
                </View>
              ) : (
                <View style={styles.timeSlotsContainer}>
                  {timeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        slot.is_booked && styles.bookedSlot,
                        selectedSlot === slot && styles.selectedSlot,
                      ]}
                      disabled={slot.is_booked}
                      onPress={() => handleTimeSlotSelect(slot)}
                    >
                      <View style={styles.timeSlotContent}>
                        <Text style={[
                          styles.timeSlotText,
                          slot.is_booked && styles.bookedSlotText,
                          selectedSlot === slot && styles.selectedSlotText,
                        ]}>
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </Text>
                        <View style={[
                          styles.statusBadge,
                          slot.is_booked ? styles.bookedBadge : styles.availableBadge,
                        ]}>
                          <Text style={[
                            styles.statusBadgeText,
                            slot.is_booked ? styles.bookedBadgeText : styles.availableBadgeText,
                          ]}>
                            {slot.is_booked ? 'Booked' : 'Available'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Duration & Pricing */}
          {selectedSlot && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="schedule" size={20} color={COLORS.primary} /> Duration & Pricing
              </Text>
              
              <View style={styles.durationContainer}>
                {[2, 4, 6, 8].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.durationOption,
                      selectedDurationHours === hours && styles.selectedDuration,
                    ]}
                    onPress={() => setSelectedDurationHours(hours)}
                  >
                    <Text style={[
                      styles.durationText,
                      selectedDurationHours === hours && styles.selectedDurationText,
                    ]}>
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.pricingCard}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Duration:</Text>
                  <Text style={styles.pricingValue}>{selectedDurationHours} hours</Text>
                </View>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Rate:</Text>
                  <Text style={styles.pricingValue}>
                    ₹{(studio?.pricing?.hourly_rate || studio?.pricing?.hourlyRate || 100).toLocaleString()}/hour
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.pricingRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
                </View>
              </View>

              {/* Book Button */}
              <TouchableOpacity
                style={[styles.bookButton, isBooking && styles.bookButtonDisabled]}
                onPress={handleBookNow}
                disabled={isBooking || bookingsState.creating}
              >
                {isBooking || bookingsState.creating ? (
                  <View style={styles.bookButtonContent}>
                    <ActivityIndicator size="small" color={COLORS.background} />
                    <Text style={styles.bookButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.bookButtonText}>
                    Pay & Book - ₹{totalAmount.toLocaleString()}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  studioInfo: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  studioName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  studioPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: width / 7 - 4,
    height: 40,
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  pastDay: {
    backgroundColor: '#F3F4F6',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  pastDayText: {
    color: COLORS.text.secondary,
  },
  selectedDayText: {
    color: COLORS.background,
    fontWeight: '700',
  },
  todayDayText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  selectedDateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  timeSlotsContainer: {
    gap: 12,
  },
  timeSlot: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bookedSlot: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  selectedSlot: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  timeSlotContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  bookedSlotText: {
    color: COLORS.text.secondary,
  },
  selectedSlotText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: '#D1FAE5',
  },
  bookedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableBadgeText: {
    color: '#065F46',
  },
  bookedBadgeText: {
    color: '#991B1B',
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  durationOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDuration: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  selectedDurationText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  pricingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BookingModal;