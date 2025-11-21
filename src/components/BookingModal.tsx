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
import BookingSuccessModal from './BookingSuccessModal';
import RazorpayCheckout from 'react-native-razorpay';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { studioAvailabilityThunk } from '../features/studios/studiosSlice';
import { doCreateBooking } from '../features/bookings/bookingsSlice';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';
import { ENV } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookingAddEquipment, studioEquipmentList } from '../lib/api';
import TimeSlotSkeleton from './skeletonLoaders/TimeSlotSkeleton';
import ConfirmationModal from './ConfirmationModal';
interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  studio: any;
  disablePayment?: boolean;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  is_booked: boolean;
  hourly_rate?: number;
}

interface CalendarDay {
  day: number;
  date: string;
  isPast: boolean;
  isToday: boolean;
}

const { width } = Dimensions.get('window');

const BookingModal: React.FC<BookingModalProps> = ({ visible, onClose, studio, disablePayment = false }) => {
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
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [dayBookings, setDayBookings] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [equipmentHourlySubtotal, setEquipmentHourlySubtotal] = useState(0);
  const [noSlotsMessage, setNoSlotsMessage] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState<{ equipment_id: string; quantity: number; hourly_rate?: number; name?: string }[]>([]);
  const [equipmentNameMap, setEquipmentNameMap] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [MinSlotsError, setMinSlotsError] = useState('');
  const [messageModalVisible, setMessageModalVisible] = useState({ status: false, header: '', message: '' });
  const [successInfo, setSuccessInfo] = useState({
    dateText: '',
    timeRange: '',
    paymentId: '',
    grandTotal: 0,
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (visible) {
      setSelectedDate('');
      setSelectedTime('');
      setSelectedSlots([]);
      setShowTimeSlots(false);
      setTimeSlots([]);
      setDayBookings([]);
      setNoSlotsMessage('');
      setEquipmentHourlySubtotal(0);
      setSelectedEquipments([]);
    }
  }, [visible, studio?.id]);

  // Convert HH:MM:SS to minutes since midnight
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map((x) => parseInt(x, 10));
    return h * 60 + m;
  };

  // Convert minutes since midnight to HH:MM:SS
  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  };

  // Check if two time ranges [aStart, aEnd] and [bStart, bEnd] overlap
  const rangesOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) => {
    return aStart < bEnd && aEnd > bStart;
  };

  // Generate available time slots based on bookings and selected duration
  const generateAvailableTimeSlots = (bookings: any[], durationHours: number) => {
    const slots: TimeSlot[] = [];

    // Studio working window: 9:00 to 21:00
    const WORK_START = 9 * 60; // minutes
    const WORK_END = 21 * 60; // minutes

    const durationMins = durationHours * 60;
    const latestStart = WORK_END - durationMins; // last valid start time

    // Normalize bookings to minute ranges
    const normalizedBookings = (bookings || []).map((b) => ({
      start: timeToMinutes(String(b.start_time)),
      end: timeToMinutes(String(b.end_time)),
    }));

    // Generate candidate start times in 60-minute increments
    for (let start = WORK_START; start <= latestStart; start += 60) {
      const end = start + durationMins;

      // Determine if this proposed window overlaps any booking
      const overlap = normalizedBookings.some((bk) => rangesOverlap(start, end, bk.start, bk.end));

      slots.push({
        start_time: minutesToTime(start),
        end_time: minutesToTime(end),
        is_booked: overlap,
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
    setSelectedSlots([]);
    setNoSlotsMessage('');

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
        const payload: any = result.payload || {};
        const apiSlots = (payload.available_slots || payload.booking_slots || []).map((s: any) => ({
          start_time: String(s.start_time).slice(0, 5),
          end_time: String(s.end_time).slice(0, 5),
          is_booked: false,
        }));
        setDayBookings(payload.booked_slots || payload.bookings || []);
        setTimeSlots(apiSlots);
        const msg = String(payload.message || (payload.is_available === false ? 'No available slots for this date' : ' Studio is not available on this day'));
        setNoSlotsMessage(apiSlots.length === 0 ? msg : '');
      } else {
        console.error('BookingModal - Failed to fetch availability:', result.payload);
        setDayBookings([]);
        setTimeSlots([]);
        setNoSlotsMessage('Unable to load availability. Please try another date.');
      }
    } catch (error) {
      console.error('BookingModal - Error fetching time slots:', error);
      setDayBookings([]);
      setTimeSlots([]);
    }
  };

  // Handle time slot multi-select toggle
  const handleTimeSlotToggle = (slot: TimeSlot) => {
    setMinSlotsError('');

    setSelectedSlots(prev => {
      const exists = prev.find(
        s => s.start_time === slot.start_time && s.end_time === slot.end_time
      );

      // Sort previous selection
      const sorted = [...prev].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );

      // ─────────────────────────────────────
      // 1) REMOVE SLOT (deselect)
      // ─────────────────────────────────────
      if (exists) {
        // Only allow removing from start or end
        const isFirst = sorted[0].start_time === slot.start_time;
        const isLast = sorted[sorted.length - 1].start_time === slot.start_time;

        // Middle slot removal not allowed
        if (!isFirst && !isLast) {
          setMessageModalVisible({ status: true, header: 'Invalid Selection', message: 'You can only remove the first or last selected time slot. Continuous selection is required.' });
          return prev; // ❌ Deny middle removal
        }

        const next = prev.filter(
          s => !(s.start_time === slot.start_time && s.end_time === slot.end_time)
        );

        updateTimeRange(next);
        return next;
      }

      // ─────────────────────────────────────
      // 2) ADD SLOT — Must be continuous
      // ─────────────────────────────────────
      if (prev.length > 0) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const isNextToEnd = slot.start_time === last.end_time;
        const isBeforeStart = slot.end_time === first.start_time;

        if (!isNextToEnd && !isBeforeStart) {
          setMessageModalVisible({ status: true, header: 'Invalid Selection', message: 'Time slots must be selected in order. Please pick the next available slot.' });
          return prev; // ❌ Not continuous
        }
      }

      // Add it
      const next = [...prev, slot].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );

      updateTimeRange(next);
      return next;
    });


    // Helper function
    const updateTimeRange = (list) => {
      if (list.length === 0) {
        setSelectedTime("");
      } else {
        const start = list[0].start_time;
        const end = list[list.length - 1].end_time;
        setSelectedTime(`${start}-${end}`);
      }
    };

  };

  // Calculate total amount
  const studioHourlyRate = useMemo(() => {
    return studio?.pricing?.hourly_rate || studio?.pricing?.hourlyRate || 100;
  }, [studio]);

  const totalHours = useMemo(() => selectedSlots?.length, [selectedSlots]);

  const studioTotal = useMemo(() => {
    return studioHourlyRate * totalHours;
  }, [studioHourlyRate, totalHours]);

  const equipmentTotal = useMemo(() => {
    return equipmentHourlySubtotal * totalHours;
  }, [equipmentHourlySubtotal, totalHours]);

  const totalAmount = useMemo(() => {
    return studioTotal + equipmentTotal;
  }, [studioTotal, equipmentTotal]);

  const gstPercent = 0.18;

  const subTotal = useMemo(() => {
    return totalAmount * gstPercent;   // 18% of total
  }, [totalAmount]);

  const grandTotal = useMemo(() => {
    return totalAmount + subTotal;     // final payable amount
  }, [totalAmount, subTotal]);

  // Load selected equipments from storage to compute hourly subtotal
  useEffect(() => {
    const loadEquipments = async () => {
      try {
        const key = `selected_equipment_${studio?.id}`;
        if (!studio?.id) return;
        const raw = await AsyncStorage.getItem(key);
        if (!raw) {
          setEquipmentHourlySubtotal(0);
          setSelectedEquipments([]);
          return;
        }
        const parsed = JSON.parse(raw || '{}');
        const items = parsed?.equipment_items || [];
        if (Array.isArray(items)) {
          const normalized = items.map((it: any) => ({
            equipment_id: String(it?.equipment_id ?? it?.id),
            quantity: Number(it?.quantity ?? 0),
            hourly_rate: Number(it?.hourly_rate ?? 0),
            name: String(it?.name ?? ''),
          })).filter((x) => x.quantity > 0);
          setSelectedEquipments(normalized);
          const subtotal = normalized.reduce((sum, item) => sum + (item.hourly_rate || 0) * item.quantity, 0);
          setEquipmentHourlySubtotal(subtotal);
        } else {
          setEquipmentHourlySubtotal(0);
          setSelectedEquipments([]);
        }
      } catch {
        setEquipmentHourlySubtotal(0);
        setSelectedEquipments([]);
      }
    };
    if (visible) loadEquipments();
  }, [visible, studio?.id]);

  // Fallback: fetch equipment names for this studio if not present in storage
  useEffect(() => {
    const fetchNames = async () => {
      try {
        if (!visible || !studio?.id) return;
        const res = await studioEquipmentList(String(studio?.id), true);
        const map: Record<string, string> = {};
        (res?.equipment || []).forEach((e: any) => {
          const id = String(e?.id ?? e?.equipment_id);
          const nm = String(e?.item_name ?? e?.name ?? e?.title ?? 'Equipment');
          if (id) map[id] = nm;
        });
        setEquipmentNameMap(map);
      } catch {
        setEquipmentNameMap({});
      }
    };
    fetchNames();
  }, [visible, studio?.id]);

  // Slots come directly from API; no duration-based recalculation needed

  // Handle booking creation; optional payment
  const handleBookNow = async () => {
    if (!selectedDate || selectedSlots.length === 0) {
      Alert.alert('Error', 'Please select a date and time slot');
      return;
    }

    if (!studio?.id) {
      Alert.alert('Error', 'Studio information is missing');
      return;
    }

    if (grandTotal <= 0) {
      Alert.alert('Error', 'Invalid booking amount');
      return;
    }

    if (selectedSlots.length < studio?.pricing?.minimum_hours) {
      setMinSlotsError(`Please select min ${studio?.pricing?.minimum_hours} time slots`);
      return;
    }

    setIsBooking(true);

    try {
      const sorted = [...selectedSlots].sort((a, b) => a.start_time.localeCompare(b.start_time));
      const bookingPayload = {
        studio_id: String(studio.id),
        booking_date: selectedDate,
        start_time: sorted[0].start_time,
        end_time: sorted[sorted.length - 1].end_time,
        total_amount: grandTotal,
      };

      if (!disablePayment) {
        if (!ENV.RAZORPAY_KEY_ID) {
          Alert.alert('Error', 'Payment configuration is missing');
          return;
        }
        if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
          throw new Error('Payment service is not available');
        }
        const options = {
          description: `Studio Booking - ${studio?.name}`,
          image: 'https://i.imgur.com/3g7nmJC.png',
          currency: 'INR',
          key: ENV.RAZORPAY_KEY_ID,
          amount: grandTotal * 100,
          name: 'BookMyShoot',
          order_id: '',
          prefill: { email: 'user@example.com', contact: '9999999999', name: 'User Name' },
          theme: { color: COLORS.primary }
        };
        RazorpayCheckout.open(options)
          .then(async (data: any) => {
            const result = await dispatch(doCreateBooking(bookingPayload));
            if (doCreateBooking.fulfilled.match(result)) {
              // Attach equipment
              try {
                const booking = result.payload as any;
                const key = `selected_equipment_${studio.id}`;
                const stored = await AsyncStorage.getItem(key);
                if (stored) {
                  const parsed = JSON.parse(stored || '{}');
                  const items = parsed?.equipment_items || parsed?.items || [];
                  if (Array.isArray(items) && items.length > 0) {
                    const equipment_items = items.map((it: any) => ({ equipment_id: String(it?.equipment_id ?? it?.id), quantity: Number(it?.quantity ?? 0) })).filter((x: any) => x.quantity > 0);
                    if (equipment_items.length > 0) {
                      await bookingAddEquipment({ booking_id: String(booking.id), equipment_items });
                      await AsyncStorage.removeItem(key);
                    }
                  }
                }
              } catch { }
              // Success
              setSuccessInfo({
                dateText: formatDateForDisplay(selectedDate),
                timeRange: `${formatTime(sorted[0].start_time)} to ${formatTime(sorted[sorted.length - 1].end_time)}`,
                paymentId: data.razorpay_payment_id,
                grandTotal,
              });
              setShowSuccessModal(true);
            } else {
              Alert.alert('Booking Failed', 'Payment was successful but booking creation failed.');
            }
          })
          .catch((error: any) => {
            if (error.code === 'payment_cancelled') {
              Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
            } else if (error.code === 'payment_failed') {
              Alert.alert('Payment Failed', error.description || 'Payment could not be processed. Please try again.');
            } else {
              Alert.alert('Payment Error', 'An error occurred during payment. Please try again.');
            }
          });
      } else {
        // No payment: directly create booking
        const result = await dispatch(doCreateBooking(bookingPayload));
        if (doCreateBooking.fulfilled.match(result)) {
          try {
            const booking = result.payload as any;
            const key = `selected_equipment_${studio.id}`;
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored || '{}');
              const items = parsed?.equipment_items || parsed?.items || [];
              if (Array.isArray(items) && items.length > 0) {
                const equipment_items = items.map((it: any) => ({ equipment_id: String(it?.equipment_id ?? it?.id), quantity: Number(it?.quantity ?? 0) })).filter((x: any) => x.quantity > 0);
                if (equipment_items.length > 0) {
                  await bookingAddEquipment({ booking_id: String(booking.id), equipment_items });
                  await AsyncStorage.removeItem(key);
                }
              }
            }
          } catch { }
          setSuccessInfo({
            dateText: formatDateForDisplay(selectedDate),
            timeRange: `${formatTime(sorted[0].start_time)} to ${formatTime(sorted[sorted.length - 1].end_time)}`,
            paymentId: '',
            grandTotal,
          });
          setShowSuccessModal(true);
        } else {
          Alert.alert('Booking Failed', 'Unable to create booking');
        }
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', 'Unable to process booking. Please try again.');
    } finally {
      setIsBooking(false);
      setMinSlotsError('');
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date?.toLocaleDateString('en-US', {
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
              ₹{(studio?.pricing?.hourly_rate || studio?.pricing?.hourlyRate || 100)?.toLocaleString()}/hour
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

          {/* Duration selection removed; using API-provided 1-hour slots with multi-select */}

          {/* Time Slots Section - filtered by selected duration */}
          {showTimeSlots && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="access-time" size={20} color={COLORS.primary} /> Available Time Slots
              </Text>

              <Text style={styles.selectedDateText}>
                {formatDateForDisplay(selectedDate)}
              </Text>

              {availabilityState.loading ? (
                <TimeSlotSkeleton />
              ) : (
                timeSlots.length === 0 ? (
                  <View style={styles.noSlotsContainer}>
                    <Text style={styles.noSlotsText}>{noSlotsMessage || 'No available slots for this date'}</Text>
                  </View>
                ) : (
                  <View style={styles.timeSlotsContainer}>
                    <Text style={[styles.noSlotsText, { color: '#065F46' }]}>{`Please select min ${studio?.pricing?.minimum_hours} time slots`} *</Text>
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
                )
              )}

              {/* Pricing summary card below available slots - with detailed equipment lines */}
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>Price Details</Text>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Selected Hours:</Text>
                  <Text style={styles.pricingValue}>{totalHours} hours</Text>
                </View>

                <Text style={styles.pricingSubHeader}>Equipments:</Text>
                {selectedEquipments.length > 0 ? (
                  selectedEquipments.map((item, idx) => {
                    const rawName = String(item?.name || '').trim();
                    const label = rawName && rawName.toLowerCase() !== 'equipment'
                      ? rawName
                      : (equipmentNameMap[item.equipment_id] || `Equipment #${item.equipment_id}`);
                    const lineAmount = (item.hourly_rate || 0) * item.quantity * totalHours;
                    return (
                      <View key={`${item.equipment_id}-${idx}`} style={styles.pricingRowItem}>
                        <View style={styles.pricingRowItemLeft}>
                          <Text style={styles.pricingItemLabel}>{label}</Text>
                          <Text style={styles.pricingItemSub}>Qty: {item.quantity} × ₹{Number(item.hourly_rate || 0)?.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.pricingItemValue}>₹{lineAmount?.toLocaleString()}</Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.pricingRowItem}>
                    <Text style={styles.pricingItemLabelMuted}>No equipments selected</Text>
                    <Text style={styles.pricingItemValue}>₹0</Text>
                  </View>
                )}

                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Studio Rate:</Text>
                  <Text style={styles.pricingValue}>₹{studioTotal?.toLocaleString()}</Text>
                </View>

                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Sub total (18% GST):</Text>
                  <Text style={styles.pricingValue}>₹{subTotal?.toLocaleString()}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.pricingRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>₹{grandTotal?.toLocaleString()}</Text>
                </View>
              </View>

              {/* Book Button */}
              {MinSlotsError ? <Text style={[styles.noSlotsText, { color: '#DC3545', marginBottom: 5 }]}>{`Please select min ${studio?.pricing?.minimum_hours} time slots`} *</Text> : null}
              {selectedSlots.length > 0 && (
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
                      {disablePayment
                        ? 'Book Now'
                        : `Pay & Book : ₹${grandTotal?.toLocaleString()}`
                      }
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
      <BookingSuccessModal
        visible={showSuccessModal}
        dateText={successInfo.dateText}
        timeRange={successInfo.timeRange}
        paymentId={successInfo.paymentId}
        totalAmount={successInfo.grandTotal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
          // Reset states
          setSelectedDate('');
          setSelectedTime('');
          setSelectedSlots([]);
          setShowTimeSlots(false);
        }}
      />

      <ConfirmationModal
        Visible={messageModalVisible.status}
        Header={messageModalVisible.header}
        Message={messageModalVisible.message}
        OnSubmit={() => setMessageModalVisible({ status: false, header: '', message: '' })}
      />

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
    ...typography.bold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  studioPrice: {
    fontSize: 16,
    ...typography.semibold,
    color: COLORS.text.secondary,
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
    ...typography.bold,
  },
  todayDayText: {
    color: COLORS.primary,
    ...typography.bold,
  },
  selectedDateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
    ...typography.regular,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
    ...typography.regular,
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
  noSlotsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    ...typography.medium,
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
    ...typography.medium,
    color: COLORS.text.primary,
  },
  selectedDurationText: {
    color: COLORS.primary,
    ...typography.semibold,
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
    color: COLORS.bg,
    ...typography.bold,
  },
  pricingValue: {
    fontSize: 14,
    ...typography.medium,
    color: COLORS.text.primary,
  },
  pricingTitle: {
    fontSize: 16,
    ...typography.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  pricingSubHeader: {
    fontSize: 14,
    color: COLORS.text.primary,
    ...typography.bold,

    marginTop: 6,
    marginBottom: 4,
  },
  pricingRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  pricingRowItemLeft: {
    flexShrink: 1,
    paddingRight: 8,
  },
  pricingItemLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    ...typography.medium,
  },
  pricingItemLabelMuted: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  pricingItemSub: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
    ...typography.regular,
  },
  pricingItemValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    ...typography.medium,
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
  },
});

export default BookingModal;