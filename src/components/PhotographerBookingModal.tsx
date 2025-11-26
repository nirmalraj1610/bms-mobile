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
import { typography } from '../constants/typography';
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
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const totalAmount = useMemo(() => {
    if (!selectedService) return 0;
    const pricePerHour = Number(selectedService?.base_price || selectedService?.hourly_rate || 0);
    const hours = selectedSlots.length; // each selected slot is 1 hour
    return pricePerHour * hours;
  }, [selectedService, selectedSlots]);

  // Helpers to convert time strings <HH:MM[:SS]> to minutes and back
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map((x) => parseInt(x, 10));
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  };

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

  // Map normalized API slots (already 1-hour windows) to component state
  const mapApiSlots = (rawSlots: any[]) => {
    const normalize = (time: string) => {
      if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
      return time;
    };
    if (!Array.isArray(rawSlots)) return [];
    return rawSlots.map((slot: any) => ({
      start_time: normalize(slot.start_time || slot.time || '09:00'),
      end_time: normalize(slot.end_time || ''),
      is_booked: !!slot.is_booked === true ? true : (slot.available === false ? true : false),
    }));
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
      // Use local Y-M-D to avoid timezone shifting the day
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
      const slots = mapApiSlots(availabilityState.timeSlots);
      setSelectedSlots([]);
      setTimeSlots(slots);
    }
  }, [availabilityState.timeSlots]);

  // Reset internal selection when modal closes to avoid stale state
  useEffect(() => {
    if (!visible) {
      setSelectedDate('');
      setShowTimeSlots(false);
      setSelectedSlots([]);
      setTimeSlots([]);
    }
  }, [visible]);

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isPast) return;
    setSelectedDate(day.date);
    setSelectedSlots([]);
    setShowTimeSlots(true);
  };

  // Free multi-select: toggle any 1-hour slot independently
  const handleTimeSlotToggle = (slot: TimeSlot) => {
    if (slot.is_booked) return;
    setSelectedSlots(prev => {
      const exists = prev.some(s => s.start_time === slot.start_time && s.end_time === slot.end_time);
      const next = exists
        ? prev.filter(s => !(s.start_time === slot.start_time && s.end_time === slot.end_time))
        : [...prev, slot];
      // Keep sorted for consistent range derivation
      next.sort((a, b) => a.start_time.localeCompare(b.start_time));
      return next;
    });
  };

  const handleBookNow = async () => {
    if (!selectedService) return Alert.alert('Error', 'Please select a service');
    if (!selectedDate || selectedSlots.length === 0) return Alert.alert('Error', 'Please select a date and contiguous time slots');
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
          const rangeStart = selectedSlots[0].start_time;
          const rangeEnd = selectedSlots[selectedSlots.length - 1].end_time;
          const bookingPayload = {
            photographer_id: photographerId,
            service_id: String(selectedService.id),
            booking_date: selectedDate,
            start_time: rangeStart,
            end_time: rangeEnd,
            total_amount: totalAmount,
          };

          const result = await dispatch(createPhotographerBooking(bookingPayload));
          
          if (createPhotographerBooking.fulfilled.match(result)) {
            Alert.alert(
              'Booking Successful!',
              `Your booking is confirmed for ${selectedDate} from ${rangeStart} to ${rangeEnd}.`,
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
            {/* {selectedService ? (
              <View style={styles.serviceMetaRow}>
                <Text style={styles.serviceMetaLabel}>Duration:</Text>
                <Text style={styles.serviceMetaValue}>{selectedService.duration_hours} hours</Text>
              </View>
            ) : null} */}
            {selectedService?.equipment_included?.length ? (
              <View style={styles.serviceMetaRow}>
                <Text style={styles.serviceMetaLabel}>Includes:</Text>
                <Text style={styles.serviceMetaValue}>{selectedService.equipment_included.join(', ')}</Text>
              </View>
            ) : null}
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
              ) : timeSlots.length > 0 ? (
                <View style={styles.timeSlotsContainer}>
                  {timeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        slot.is_booked && styles.bookedSlot,
                        selectedSlots.some(s => s.start_time === slot.start_time && s.end_time === slot.end_time) && styles.selectedSlot,
                      ]}
                      disabled={slot.is_booked}
                      onPress={() => handleTimeSlotToggle(slot)}
                    >
                      <View style={styles.timeSlotContent}>
                        <Text style={[
                          styles.timeSlotText,
                          slot.is_booked && styles.bookedSlotText,
                          selectedSlots.some(s => s.start_time === slot.start_time && s.end_time === slot.end_time) && styles.selectedSlotText,
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
              ) : (
                <View style={styles.emptySlotsContainer}>
                  <Text style={styles.emptySlotsText}>No time slots available for this date.</Text>
                  <Text style={styles.emptySlotsSubText}>Try another date or service.</Text>
                </View>
              )}

              {/* Pricing summary card: updates with selected hours */}
              <View style={styles.pricingCard}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Service:</Text>
                  <Text style={styles.pricingValue}>{selectedService?.title || '-'}</Text>
                </View>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Selected Hours:</Text>
                  <Text style={styles.pricingValue}>{selectedSlots.length} hour(s)</Text>
                </View>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Price / hour:</Text>
                  <Text style={styles.pricingValue}>₹{Number(selectedService?.base_price || selectedService?.hourly_rate || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.pricingRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
                </View>
              </View>

              {/* Book Button */}
              {selectedSlots.length > 0 && (
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
    ...typography.semibold,
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
    ...typography.bold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    ...typography.semibold,
    color: COLORS.text.secondary,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  serviceMetaLabel: {
    fontSize: 14,
    ...typography.regular,
    color: COLORS.text.secondary,
  },
  serviceMetaValue: {
    fontSize: 14,
    ...typography.medium,
    color: COLORS.text.primary,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    ...typography.semibold,
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
    ...typography.semibold,
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
    ...typography.semibold,
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
    ...typography.medium,
    color: COLORS.text.primary,
  },
  pastDayText: {
    color: COLORS.text.secondary,
  },
  selectedDayText: {
    color: COLORS.background,
    // backgroundColor:COLORS.bg,
    ...typography.bold,
  },
  selectedDateText: {
    fontSize: 14,
    ...typography.regular,
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
    ...typography.regular,
    color: COLORS.text.secondary,
  },
  timeSlotsContainer: {
    gap: 12,
  },
  emptySlotsContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptySlotsText: {
    fontSize: 16,
    ...typography.semibold,
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  emptySlotsSubText: {
    fontSize: 14,
    ...typography.regular,
    color: COLORS.text.secondary,
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
    ...typography.medium,
    color: COLORS.text.primary,
  },
  bookedSlotText: {
    color: COLORS.text.secondary,
  },
  selectedSlotText: {
    color: COLORS.primary,
    ...typography.semibold,
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
    ...typography.semibold,
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
    ...typography.medium,
    color: COLORS.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    ...typography.semibold,
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 18,
    ...typography.bold,
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
    ...typography.bold,
    marginLeft: 8,
  },
});

export default PhotographerBookingModal;
