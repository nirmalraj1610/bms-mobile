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
import { getPhotographerAvailability, createPhotographerBooking } from '../features/photographers/photographersSlice';
import { COLORS } from '../constants';
import { ENV } from '../config/env';

interface PhotographerBookingModalProps {
  visible: boolean;
  onClose: () => void;
  photographer: any;
  services: any[];
  photographerId: string;
  selectedService: any;
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

const PhotographerBookingModal: React.FC<PhotographerBookingModalProps> = ({
  visible,
  onClose,
  photographer,
  services,
  photographerId,
  selectedService,
}) => {
  const dispatch = useAppDispatch();
  const availabilityState = useAppSelector(state => state.photographers.availability);
  const bookingState = useAppSelector(state => state.photographers.booking);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const totalAmount = useMemo(() => {
    if (!selectedService) return 0;
    return selectedService.base_price;
  }, [selectedService]);

  // Format date for display (mirrors studio modal)
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

  const generateAvailableTimeSlots = (timeSlots: any[]) => {
    if (timeSlots && timeSlots.length > 0) {
      return timeSlots.map((slot: any) => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_booked: slot.is_booked || false,
      }));
    }

    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 18; hour += 2) {
      const startTime = `${String(hour).padStart(2, '0')}:00:00`;
      const endTime = `${String(hour + 2).padStart(2, '0')}:00:00`;
      slots.push({ start_time: startTime, end_time: endTime, is_booked: false });
    }
    return slots;
  };

  const generateCalendarDays = (): (CalendarDay | null)[] => {
    const todayDate = new Date();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (CalendarDay | null)[] = [];
    for (let i = 0; i < startDate; i++) days.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const isPast = date < todayDate;
      const isToday = date.toDateString() === todayDate.toDateString();

      days.push({ day, date: dateString, isPast, isToday });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  useEffect(() => {
    if (selectedDate && photographerId) {
      dispatch(getPhotographerAvailability({ id: photographerId, date: selectedDate }));
    }
  }, [selectedDate, photographerId, dispatch]);

  useEffect(() => {
    if (availabilityState.timeSlots) {
      const slots = generateAvailableTimeSlots(availabilityState.timeSlots);
      setTimeSlots(slots);
    }
  }, [availabilityState.timeSlots]);

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isPast) return;
    setSelectedDate(day.date);
    setSelectedSlot(null);
    setShowTimeSlots(true);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.is_booked) return;
    setSelectedSlot(slot);
  };

  const handleBookNow = async () => {
    if (!selectedService) return Alert.alert('Error', 'Please select a service');
    if (!selectedDate || !selectedSlot) return Alert.alert('Error', 'Please select a date and time slot');
    if (!photographerId) return Alert.alert('Error', 'Photographer information missing');
    if (!ENV.RAZORPAY_KEY_ID) return Alert.alert('Error', 'Missing Razorpay key');
    if (totalAmount <= 0) return Alert.alert('Error', 'Invalid booking amount');

    setIsBooking(true);
    try {
      const options = {
        description: `Photographer Booking - ${photographer?.full_name} - ${selectedService.title}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: ENV.RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        name: 'BookMyShoot',
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'User Name',
        },
        theme: { color: COLORS.primary },
      };

      RazorpayCheckout.open({ ...options, order_id: '' })
        .then(async (data: any) => {
          const bookingPayload = {
            photographer_id: photographerId,
            service_id: String(selectedService.id),
            booking_date: selectedDate,
            start_time: selectedSlot.start_time,
            end_time: selectedSlot.end_time,
            total_amount: totalAmount,
          };

          const result = await dispatch(createPhotographerBooking(bookingPayload));
          console.log(result, 'resultttssssssssssssssssttttttt');
          
          if (createPhotographerBooking.fulfilled.match(result)) {
            Alert.alert(
              'Booking Successful!',
              `Your booking is confirmed for ${selectedDate} from ${selectedSlot.start_time} to ${selectedSlot.end_time}.`,
              [{ text: 'OK', onPress: onClose }],
            );
          } else throw new Error('Booking failed');
        })
        .catch(() => Alert.alert('Payment Failed', 'Payment was cancelled or failed.'));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsBooking(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      currentMonth === 0 ? (setCurrentMonth(11), setCurrentYear(currentYear - 1)) : setCurrentMonth(currentMonth - 1);
    } else {
      currentMonth === 11 ? (setCurrentMonth(0), setCurrentYear(currentYear + 1)) : setCurrentMonth(currentMonth + 1);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
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
          <Text style={styles.headerTitle}>Book Photographer</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photographer & Service Info (styled like studio info) */}
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{selectedService?.title || 'Service'}</Text>
            <Text style={styles.servicePrice}>₹{(selectedService?.base_price || 0).toLocaleString()}</Text>
          </View>

          {/* Calendar Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Icon name="calendar-today" size={20} color={COLORS.primary} /> Select Date
            </Text>

            {/* Month Header */}
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                <Icon name="chevron-left" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {monthNames[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
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
                  onPress={() => dayObj && handleDateSelect(dayObj)}
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

              {/* Pricing summary card */}
              <View style={styles.pricingCard}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Service:</Text>
                  <Text style={styles.pricingValue}>₹{(selectedService?.base_price || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.pricingRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
                </View>
              </View>

              {/* Book Button */}
              {selectedSlot && (
                <TouchableOpacity
                  style={[styles.bookButton, isBooking && styles.bookButtonDisabled]}
                  onPress={handleBookNow}
                  disabled={isBooking || bookingState.loading}
                >
                  {isBooking || bookingState.loading ? (
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
              )}
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
  serviceInfo: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
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
  pricingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 16,
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
    marginLeft: 8,
  },
});

export default PhotographerBookingModal;
