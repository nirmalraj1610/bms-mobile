import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { mockFavoriteStudios, mockStudios } from '../utils/mockData';
import BookingModal from '../components/BookingModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { studioDetailsThunk } from '../features/studios/studiosSlice';
import { Studio } from '../types';
import { StudioDetail } from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../lib/http';

const StudioDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const studioId: string | undefined = route?.params?.studioId;
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Get studio data from Redux
  const { data: studioData, loading, error } = useAppSelector(state => state.studios.detail);
  const searchResults = useAppSelector(state => state.studios.search.results);

  // Fetch studio details when component mounts or studioId changes
  useEffect(() => {
    if (studioId) {
      dispatch(studioDetailsThunk(studioId));
    }
  }, [dispatch, studioId]);

  // Use actual studio data or fallback to search results or mock data
  const studio: Studio | StudioDetail = useMemo(() => {
    console.log('=== StudioDetailsScreen Debug ===');
    console.log('studioId from route:', studioId);
    console.log('studioData from API:', studioData);
    console.log('searchResults:', searchResults);
    console.log('loading:', loading);
    console.log('error:', error);
    console.log('Redux state - studios.detail:', { data: studioData, loading, error });
    
    // First priority: Use API detail data if available
    if (studioData) {
      console.log('✅ Using API detail data');
      console.log('API studio object:', JSON.stringify(studioData, null, 2));
      console.log('API studio ID:', studioData.id);
      console.log('API studio ID type:', typeof studioData.id);
      return studioData;
    }
    
    // Second priority: Use studio from search results if available
    if (searchResults && searchResults.length > 0 && studioId) {
      const studioFromSearch = searchResults.find((s: any) => s.id === studioId);
      if (studioFromSearch) {
        console.log('✅ Using studio from search results');
        console.log('Search studio object:', JSON.stringify(studioFromSearch, null, 2));
        console.log('Search studio ID:', studioFromSearch.id);
        return studioFromSearch;
      }
    }
    
    // Fallback to mock data if no real data is available
    // First try to find in main mockStudios array (used by HomeScreen)
    let mockStudio = mockStudios.find((s) => s.id === studioId);
    
    // If not found, try mockFavoriteStudios array (used by FavoritesScreen)
    if (!mockStudio) {
      mockStudio = mockFavoriteStudios.find((s) => s.id === studioId);
    }
    
    // If still not found, use the first studio from favorites as fallback
    if (!mockStudio) {
      mockStudio = mockFavoriteStudios[0];
      console.log('Using fallback studio, original ID:', mockStudio?.id, 'route studioId:', studioId);
      
      // Only override ID if we're using fallback and have a valid studioId
      if (mockStudio && studioId) {
        const studioWithCorrectId = { ...mockStudio, id: studioId };
        console.log('Using fallback mock data with corrected ID:', studioWithCorrectId.id);
        return studioWithCorrectId;
      }
    }
    
    console.log('Using found mock studio, ID:', mockStudio?.id);
    return mockStudio;
  }, [studioData, studioId, searchResults]);

  // Helper functions to safely access studio data
  const getStudioImages = () => {
    if (studio?.images && Array.isArray(studio.images)) {
      return studio.images;
    }
    return ['https://via.placeholder.com/400x200'];
  };

  const getOwnerName = () => {
    // Type guard to check if it's StudioDetail (API data)
    if ('customers' in studio && studio.customers?.full_name) {
      return studio.customers.full_name;
    }
    // Type guard to check if it's Studio (mock data)
    if ('owner' in studio && studio.owner?.name) {
      return studio.owner.name;
    }
    return 'Studio Owner';
  };

  const getLocationCity = () => {
    return studio?.location?.city || 'Unknown Location';
  };

  const getRating = () => {
    // Type guard for StudioDetail (API data)
    if ('average_rating' in studio && studio.average_rating !== undefined) {
      return studio.average_rating;
    }
    // Type guard for Studio (mock data)
    if ('rating' in studio && studio.rating !== undefined) {
      return studio.rating;
    }
    return 0;
  };

  const getReviewCount = () => {
    // Type guard for StudioDetail (API data)
    if ('total_reviews' in studio && studio.total_reviews !== undefined) {
      return studio.total_reviews;
    }
    // Type guard for Studio (mock data)
    if ('reviewCount' in studio && studio.reviewCount !== undefined) {
      return studio.reviewCount;
    }
    return 0;
  };

  const getHourlyRate = () => {
    if (studio?.pricing) {
      // For API data - check for hourly_rate first
      if ('hourly_rate' in studio.pricing && studio.pricing.hourly_rate !== undefined) {
        return studio.pricing.hourly_rate;
      }
      // For API data - check for hourly (alternative API format)
      if ('hourly' in studio.pricing && (studio.pricing as any).hourly !== undefined) {
        return (studio.pricing as any).hourly;
      }
      // For mock data
      if ('hourlyRate' in studio.pricing && studio.pricing.hourlyRate !== undefined) {
        return studio.pricing.hourlyRate;
      }
    }
    return 0;
  };

  const getEquipment = (): Array<{ id: number | string; name: string }> => {
    // For API data (amenities)
    if (studio?.amenities && Array.isArray(studio.amenities)) {
      return studio.amenities.map((amenity: string, index: number) => ({ id: index, name: amenity }));
    }
    // For mock data (equipment)
    if ('equipment' in studio && studio.equipment && Array.isArray(studio.equipment)) {
      return studio.equipment;
    }
    return [
      { id: 1, name: 'Professional Lighting' },
      { id: 2, name: 'Camera Equipment' },
      { id: 3, name: 'Backdrop Options' }
    ];
  };

  const closeLoginModal = () => setShowLoginModal(false);
  const goToLogin = () => {
    setShowLoginModal(false);
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handlePressBookNow = async () => {
    // 1) Token presence check
    let token: string | null = null;
    try { token = await AsyncStorage.getItem('auth_token'); } catch {}
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    // 2) Expiry check from saved session
    try {
      const userData = await getUserData();
      const exp = userData?.session?.expires_at; // seconds epoch
      if (typeof exp === 'number') {
        const isExpired = exp * 1000 <= Date.now();
        if (isExpired) {
          setShowLoginModal(true);
          return;
        }
      }
    } catch {}
    // 3) Auth OK -> open booking modal
    setShowBookingModal(true);
  };

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

  // Show loading state while fetching studio data
  if (loading && !studioData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading studio details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Image */}
        <Image source={{ uri: getStudioImages()[0] }} style={styles.heroImage} />

        {/* Chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}><Text style={styles.chipText}>Mon, 11th</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>2.00 PM</Text></View>
          <View style={styles.locationChip}>
            <Text style={styles.locationChipText}>{getOwnerName()}, {getLocationCity()}</Text>
          </View>
        </View>

        {/* Title & Rating */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{studio?.name || 'Studio Name'}</Text>
          <View style={styles.ratingRow}>
            {renderStars(getRating())}
            <Text style={styles.ratingText}>{getRating().toFixed(1)}</Text>
            <Text style={styles.reviewText}>({getReviewCount()} Reviews)</Text>
          </View>
        </View>

        {/* Pricing */}
        <Text style={styles.priceText}>Starting at ₹{getHourlyRate().toLocaleString()}/hour</Text>

        {/* Description */}
        <Text style={styles.description}>{studio?.description || 'No description available.'}</Text>

        {/* Equipment Included */}
        <Text style={styles.sectionTitle}>Equipment Included</Text>
        <View style={styles.bullets}>
          {getEquipment().slice(0, 3).map((e: { id: number | string; name: string }) => (
            <View key={e.id} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{e.name}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Gallery</Text>
          <Icon name="chevron-right" size={22} color={COLORS.text.secondary} />
        </View>
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Our works</Text>
          <Icon name="chevron-right" size={22} color={COLORS.text.secondary} />
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.bookBtn} onPress={handlePressBookNow}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        studio={studio}
      />

      {/* Login Required Modal */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Login Required</Text>
            </View>
            <Text style={styles.modalLabel}>Please log in to book a studio.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButtonModal} onPress={closeLoginModal}>
                <Text style={styles.confirmButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={goToLogin}>
                <Text style={styles.confirmButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: 12,
  },
  // Modal styles for login prompt
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
  modalLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButtonModal: {
    backgroundColor: '#827d7dff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EFF1F4',
  },
  chipText: {
    fontSize: 12,
    color: COLORS.text.primary,
  },
  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EFF1F4',
  },
  locationChipText: {
    fontSize: 12,
    color: COLORS.text.primary,
  },
  titleBlock: {
    marginTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
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
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  bullets: {
    marginTop: 8,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.secondary,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 13,
    color: COLORS.text.primary,
  },
  linkRow: {
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  bookBtn: {
    marginTop: 16,
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  bookBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
});

export default StudioDetailsScreen;