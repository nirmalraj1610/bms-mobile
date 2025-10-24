import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { RootState, AppDispatch } from '../store/store';
import {
  getphotographerDetail, // <- FIXED import name
  getPhotographerServices,
  getPhotographerAvailability,
  createReview,
} from '../features/photographers/photographersSlice';
import { getBookings } from '../features/bookings/bookingsSlice';
import PhotographerBookingModal from '../components/PhotographerBookingModal';

const PhotographerDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  
  const photographerId: string = route?.params?.photographerId;

  // Redux state (use safe defaults)
  const photographersState = useSelector((state: RootState) => state.photographers);
  const bookingsState = useSelector((state: RootState) => state.bookings);
  
  const photographer = photographersState?.detail?.photographer;
  const services = photographersState?.services?.items || [];
  const timeSlots = photographersState?.availability?.timeSlots || [];
  const userBookings = bookingsState?.items || [];
  
  const isLoadingDetail = !!photographersState?.detail?.loading;
  const isLoadingServices = !!photographersState?.services?.loading;
  const isLoadingAvailability = !!photographersState?.availability?.loading;
  const isLoadingBookings = !!bookingsState?.loading;
  const reviewSubmitting = !!photographersState?.review?.submitting;

  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews' | 'policies'>('overview');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStudioBooking, setSelectedStudioBooking] = useState<any>(null);
  const [selectedDurationHours, setSelectedDurationHours] = useState(2);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Load data on mount
  useEffect(() => {
    if (!photographerId) return;
    dispatch(getphotographerDetail(photographerId)); // <- fixed call
    dispatch(getPhotographerServices(photographerId));
    dispatch(getPhotographerAvailability({ id: photographerId, date: new Date().toISOString().split('T')[0] }));
    dispatch(getBookings({}));
  }, [dispatch, photographerId]);

  // Generate calendar dates for current month
  const calendarDates = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const dates: { date: string; day: number; isToday: boolean }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      if (date >= today) {
        dates.push({
          date: date.toISOString().split('T')[0],
          day: i,
          isToday: date.toDateString() === today.toDateString(),
        });
      }
    }
    return dates;
  }, []);

  // Generate mock time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    
    const slots: { time: string; available: boolean }[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time: timeString,
        available: Math.random() > 0.3, // Mock availability
      });
    }
    return slots;
  }, [selectedDate]);

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={[styles.starGlyph, { color: i <= rounded ? COLORS.secondary : '#C9CDD2' }]}>★</Text>
        ))}
      </View>
    );
  };

  const handleBookNow = () => {
    if (services.length > 0 && !selectedService) {
      Alert.alert('Error', 'Please select a service');
      return;
    }

    // Open the booking modal for date/time selection
    setShowBookingModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      await dispatch(createReview({
        photographer_id: photographerId,
        booking_id: '',
        rating: reviewRating,
        comment: reviewComment,
      })).unwrap();
      
      setReviewComment('');
      Alert.alert('Success', 'Review submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const renderCalendarModal = () => (
    <Modal
      visible={showCalendarModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCalendarModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Date & Time</Text>
          <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Calendar */}
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.calendarGrid}>
            {calendarDates.map((dateObj) => (
              <TouchableOpacity
                key={dateObj.date}
                style={[
                  styles.calendarDate,
                  selectedDate === dateObj.date && styles.selectedDate,
                  dateObj.isToday && styles.todayDate,
                ]}
                onPress={() => setSelectedDate(dateObj.date)}
              >
                <Text style={[
                  styles.calendarDateText,
                  selectedDate === dateObj.date && styles.selectedDateText,
                  dateObj.isToday && styles.todayDateText,
                ]}>
                  {dateObj.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time Slots */}
          {selectedDate && (
            <>
              <Text style={styles.sectionTitle}>Available Time Slots</Text>
              <View style={styles.timeSlotsGrid}>
                {availableTimeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.time}
                    style={[
                      styles.timeSlot,
                      !slot.available && styles.unavailableTimeSlot,
                      selectedTimeSlot === slot.time && styles.selectedTimeSlot,
                    ]}
                    onPress={() => slot.available && setSelectedTimeSlot(slot.time)}
                    disabled={!slot.available}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      !slot.available && styles.unavailableTimeSlotText,
                      selectedTimeSlot === slot.time && styles.selectedTimeSlotText,
                    ]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {selectedDate && selectedTimeSlot && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowCalendarModal(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
  console.log('photographerphotographerphotographer', photographer);
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            <Text style={styles.sectionTitle}>About This Photographer</Text>
            <Text style={styles.description}>
              {photographer?.bio || 'Professional photographer with years of experience in capturing beautiful moments.'}
            </Text>

            <Text style={styles.sectionTitle}>Photographer Details</Text>
            <View style={styles.ownerInfo}>
              <Image
                source={{ uri: photographer?.profile_image_url || 'https://via.placeholder.com/50' }}
                style={styles.ownerImage}
              />
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{photographer?.full_name || 'Photographer'}</Text>
                {photographer?.email && (
                  <Text style={styles.ownerContact}>{photographer.email}</Text>
                )}
                {photographer?.phone && (
                  <Text style={styles.ownerContact}>{photographer.phone}</Text>
                )}
              </View>
            </View>
          </View>
        );

      case 'services':
        return (
          <View>
            <Text style={styles.sectionTitle}>Available Services</Text>
            {isLoadingServices ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : services.length > 0 ? (
              services.map((service: any) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedService?.id === service.id && styles.selectedServiceCard,
                  ]}
                  onPress={() => setSelectedService(service)}
                >
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.servicePrice}>₹{service.base_price || service.hourly_rate}</Text>
                    <Text style={styles.serviceDuration}>{service.duration_hours}h</Text>
                  </View>
                  {service.equipment_included && service.equipment_included.length > 0 && (
                    <Text style={styles.serviceEquipment}>
                      Equipment: {service.equipment_included.join(', ')}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>No services available</Text>
            )}
            
            {/* Selected Service Summary */}
            {selectedService && (
              <View style={styles.selectionSummary}>
                <Text style={styles.selectionText}>
                  Selected Service: {selectedService.title} (₹{selectedService.base_price || selectedService.hourly_rate})
                </Text>
              </View>
            )}

            {/* Book Photographer Button */}
            <TouchableOpacity
              style={[
                styles.bookButton,
                !selectedService && styles.disabledButton
              ]}
              onPress={handleBookNow}
              disabled={!selectedService}
            >
              <Text style={[
                styles.bookButtonText,
                !selectedService && styles.disabledButtonText
              ]}>Book Photographer</Text>
            </TouchableOpacity>
          </View>
        );

      case 'reviews':
        return (
          <View>
            <Text style={styles.sectionTitle}>Reviews ({photographer?.total_reviews || 0})</Text>
            
            {/* Add Review Form */}
            <View style={styles.reviewForm}>
              <Text style={styles.formLabel}>Add Your Review</Text>
              
              <View style={styles.ratingContainer}>
                <Text style={styles.formLabel}>Rating</Text>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setReviewRating(star)}
                    >
                      <Text style={[
                        styles.ratingStarButton,
                        { color: star <= reviewRating ? COLORS.secondary : '#C9CDD2' }
                      ]}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience"
                placeholderTextColor="#999"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.submitReviewButton}
                onPress={handleSubmitReview}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.submitReviewButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'policies':
        return (
          <View>
            <Text style={styles.sectionTitle}>Booking Policies</Text>
            
            <View style={styles.policySection}>
              <Text style={styles.policyTitle}>Cancellation Policy</Text>
              <Text style={styles.policyText}>Refer to photographer policy.</Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.policyTitle}>Payment Policy</Text>
              <Text style={styles.policyText}>Advance payment may be required.</Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.policyTitle}>Overtime Charges</Text>
              <Text style={styles.policyText}>Additional charges may apply for extended sessions.</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoadingDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading photographer details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Icon name="share" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Image */}
        <Image 
          source={{ uri: photographer?.profile_image_url || 'https://via.placeholder.com/400x220' }} 
          style={styles.heroImage} 
        />

        {/* Photographer Info */}
        <View style={styles.photographerInfo}>
          <Text style={styles.photographerName}>{photographer?.full_name || 'Photographer'}</Text>
          <View style={styles.ratingRow}>
            {renderStars(photographer?.average_rating ?? 4.5)}
            <Text style={styles.ratingText}>{(photographer?.average_rating ?? 4.5).toFixed(1)}</Text>
            <Text style={styles.reviewText}>({photographer?.total_reviews || 0} Reviews)</Text>
          </View>
          <Text style={styles.priceText}>
            Starting at ₹{services && services.length > 0 
              ? Math.min(...services.map(s => s.base_price)).toString()
              : '0'}
          </Text>
        </View>

        {/* Studio Booking Selection */}
        {/* <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Select Studio Booking</Text>
          {isLoadingBookings ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : userBookings.length > 0 ? (
            <FlatList
              data={userBookings}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.studioBookingCard,
                    (selectedStudioBooking as any)?.id === (item as any)?.id && styles.selectedStudioBookingCard,
                  ]}
                  onPress={() => setSelectedStudioBooking(item)}
                >
                  <Text style={styles.studioBookingName}>{(item as any)?.studios?.name || 'Studio'}</Text>
                  <Text style={styles.studioBookingDate}>{(item as any)?.booking_date}</Text>
                  <Text style={styles.studioBookingTime}>{(item as any)?.start_time} - {(item as any)?.end_time}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => ((item as any)?.id ? String((item as any).id) : String(index))}
            />
          ) : (
            <Text style={styles.noDataText}>No studio bookings found. Book a studio first.</Text>
          )}
        </View> */}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['overview', 'services', 'reviews', 'policies'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {renderCalendarModal()}
      
      {photographer && (
        <PhotographerBookingModal
          visible={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          photographer={photographer}
          services={services}
          photographerId={photographerId}
          selectedService={selectedService}
        />
      )}
    </SafeAreaView>
  );
};

// ... styles (same as your original styles) ...
// For brevity I didn't repeat the full styles block here — keep your styles exactly as before.


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 220,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  photographerInfo: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  photographerName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starGlyph: {
    fontSize: 14,
    lineHeight: 16,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 6,
  },
  reviewText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookingSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  studioBookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedStudioBookingCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  studioBookingName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  studioBookingDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  studioBookingTime: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  ownerContact: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  serviceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedServiceCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  serviceDuration: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  serviceEquipment: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  reviewForm: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStarButton: {
    fontSize: 24,
    marginRight: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitReviewButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitReviewButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  policySection: {
    marginBottom: 16,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  policyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  calendarButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  calendarButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectionSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectionText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  bookButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C9CDD2',
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButtonText: {
    color: '#999',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  calendarDate: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.surface,
  },
  selectedDate: {
    backgroundColor: COLORS.primary,
  },
  todayDate: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  calendarDateText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  selectedDateText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  todayDateText: {
    fontWeight: '600',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unavailableTimeSlot: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  selectedTimeSlotText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  unavailableTimeSlotText: {
    color: '#999',
  },
  confirmButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PhotographerDetailsScreen;
