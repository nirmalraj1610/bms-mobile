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
    if (!photographer?.id) return Alert.alert('Error', 'Photographer information missing');
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Book Photographer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.photographerInfo}>
              <Text style={styles.photographerName}>{photographer?.full_name}</Text>
              <Text style={styles.photographerBio}>{photographer?.bio}</Text>
            </View>

            {/* Selected Service Info */}
            {selectedService && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selected Service</Text>
                <View style={styles.selectedServiceInfo}>
                  <Text style={styles.selectedServiceTitle}>{selectedService.title}</Text>
                  <Text style={styles.selectedServicePrice}>₹{selectedService.base_price}</Text>
                </View>
              </View>
            )}

            {/* Calendar */}
            {selectedService && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Date</Text>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={() => navigateMonth('prev')}>
                    <Icon name="chevron-left" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.monthYear}>
                    {monthNames[currentMonth]} {currentYear}
                  </Text>
                  <TouchableOpacity onPress={() => navigateMonth('next')}>
                    <Icon name="chevron-right" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.calendar}>
                  {calendarDays.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      disabled={!day || day.isPast}
                      onPress={() => day && handleDateSelect(day)}
                      style={[
                        styles.calendarDay,
                        day?.isToday && styles.today,
                        selectedDate === day?.date && styles.selectedDay,
                      ]}
                    >
                      <Text style={styles.calendarDayText}>{day?.day || ''}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Time Slots */}
            {showTimeSlots && selectedDate && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Time</Text>
                {availabilityState.loading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <View style={styles.timeSlots}>
                    {timeSlots.map((slot, i) => (
                      <TouchableOpacity
                        key={i}
                        disabled={slot.is_booked}
                        style={[
                          styles.timeSlot,
                          slot.is_booked && styles.bookedSlot,
                          selectedSlot === slot && styles.selectedSlot,
                        ]}
                        onPress={() => handleTimeSlotSelect(slot)}
                      >
                        <Text style={styles.timeSlotText}>
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {selectedService && selectedDate && selectedSlot && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.bookButton, (isBooking || bookingState.loading) && styles.disabledButton]}
                onPress={handleBookNow}
                disabled={isBooking || bookingState.loading}
              >
                {isBooking ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.bookButtonText}>Book Now - ₹{totalAmount}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  closeButton: { padding: 5 },
  content: { padding: 20 },
  photographerInfo: { marginBottom: 20 },
  photographerName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary },
  photographerBio: { fontSize: 14, color: COLORS.text.secondary },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary, marginBottom: 10 },
  selectedServiceInfo: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 10, 
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedServiceTitle: { fontSize: 16, fontWeight: '600', color: COLORS.surface },
  selectedServicePrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.surface },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  monthYear: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary },
  calendar: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: { width: (width - 80) / 7, height: 40, justifyContent: 'center', alignItems: 'center' },
  calendarDayText: { color: COLORS.text.primary },
  today: { backgroundColor: COLORS.warning, borderRadius: 20 },
  selectedDay: { backgroundColor: COLORS.primary, borderRadius: 20 },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { backgroundColor: COLORS.surface, padding: 10, borderRadius: 8 },
  selectedSlot: { backgroundColor: COLORS.primary },
  bookedSlot: { opacity: 0.5 },
  timeSlotText: { color: COLORS.text.primary },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.surface },
  bookButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  disabledButton: { opacity: 0.6 },
  bookButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
});

export default PhotographerBookingModal;
