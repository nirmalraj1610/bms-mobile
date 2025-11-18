import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, CITIES, FEATURES } from '../constants';
import { typography } from '../constants/typography';
import { mockStudios } from '../utils/mockData';
import { Studio, Feature } from '../types';
import { PhotographerSummary } from '../types/api';
import { ImageSourcePropType } from 'react-native';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { RootState, AppDispatch } from '../store/store';
import { studiosSearchThunk, toggleFavoriteThunk, loadFavoritesThunk } from '../features/studios/studiosSlice';
import { getphotographersSearch } from '../features/photographers/photographersSlice';
import { getUserData } from '../lib/http';
import imagePaths from '../constants/imagePaths';
import RecommendCardSkeleton from '../components/skeletonLoaders/RecommendCardSkeleton';
import RatedCardSkeleton from '../components/skeletonLoaders/RatedCardSkeleton';
import { showInfo, showSuccess } from '../utils/helperFunctions';

const { width } = Dimensions.get('window');
const STUDIO_CARD_WIDTH = width * 0.4;
const WHY_CHOOSE_CARD_WIDTH = width * 0.9;
const RECOMMEND_CARD_WIDTH = width * 0.5;

const HomeScreen: React.FC = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [photoErrorIds, setPhotoErrorIds] = useState<{ [key: string]: boolean }>({});
  // View-all now navigates to a dedicated AllStudios screen

  // Location modal state
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<any[]>([]);
  const [selectedLocationName, setSelectedLocationName] = useState<string>('Chennai');
  const [tempSelectedLocationName, setTempSelectedLocationName] = useState<string>('Chennai');
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Redux selectors
  const studiosState = useSelector((state: RootState) => state.studios);
  const photographersState = useSelector((state: RootState) => state.photographers);
  console.log(studiosState, 'studiooooooo');

  // Get studios and photographers data
  const studiosError = studiosState.searchError;
  const photographersError = photographersState.searchError;

  // Helper function to check if user is authenticated
  const checkAuthAndLoadFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('=== Auth Check Debug ===');
      console.log('Token exists:', !!token);

      if (token) {
        console.log('User is authenticated, loading favorites...');
        dispatch(loadFavoritesThunk());
      } else {
        console.log('User not authenticated, skipping favorites loading');
      }
    } catch (error) {
      console.log('Error checking authentication:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    console.log('=== HomeScreen useEffect Debug ===');
    console.log('Component mounted, dispatching initial data fetches...');

    // Fetch studios with basic search parameters
    dispatch(studiosSearchThunk({
      q: '',
      city: '',
      types: [],
      page: 1,
      limit: 10
    }));

    // Fetch photographers with basic search parameters
    dispatch(getphotographersSearch({
      query: '',
      location: '',
      specialization: '',
      priceRange: "0-10000",
      page: 1,
      limit: 10
    }));

    // Check authentication before loading favorites
    checkAuthAndLoadFavorites();
  }, [dispatch]);

  // Reload favorites when screen comes into focus (e.g., after login)
  useFocusEffect(
    React.useCallback(() => {
      console.log('=== HomeScreen Focus Effect ===');
      console.log('Screen focused, checking auth and reloading favorites...');
      checkAuthAndLoadFavorites();
    }, [])
  );

  // Live search studios when typing in Home search bar
  useEffect(() => {
    const q = query.trim();
    const handle = setTimeout(() => {
      dispatch(
        studiosSearchThunk({
          q,
          city: (selectedLocationName || '').trim(),
          page: 1,
          limit: 10,
        })
      );
    }, 250);
    return () => clearTimeout(handle);
  }, [query, selectedLocationName, dispatch]);

  // Toggle overlay visibility based on focus and query
  useEffect(() => {
    const hasQuery = query.trim().length > 0;
    setShowOverlay(isSearchFocused && hasQuery);
  }, [isSearchFocused, query]);

  useEffect(() => {
    const checkAuth = async () => {
      let token: string | null = null;
      try { token = await AsyncStorage.getItem('auth_token'); } catch { }
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        const userData = await getUserData();
        const exp = userData?.session?.expires_at; // seconds epoch
        if (typeof exp === 'number') {
          const isExpired = exp * 1000 <= Date.now();
          if (isExpired) {
            setCurrentUser(null);
            return;
          }
          else {
            const user = userData?.customer;
            console.log('userData:', user);
            setCurrentUser(user);
          }
        }
      } catch { }
    };

    if (isFocused) {
      checkAuth();
    }
  }, [isFocused]);



  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const width = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  // Open/close location modal
  const openLocationModal = () => {
    setLocationModalVisible(true);
    setLocationQuery('');
    setLocationSearchResults([]);
    setTempSelectedLocationName(selectedLocationName);
  };
  const closeLocationModal = () => {
    setLocationModalVisible(false);
  };

  // Search locations using OpenStreetMap Nominatim
  const searchLocations = async (q: string) => {
    setLocationQuery(q);
    if (q.trim().length < 2) {
      setLocationSearchResults([]);
      return;
    }
    try {
      setIsSearchingLocations(true);
      console.log('[Location] Searching locations:', q);
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8`);
      const data = await resp.json();
      console.log('[Location] Search results count:', (data || []).length);
      setLocationSearchResults(data || []);
    } catch (e) {
      console.log('[Location] Search error:', e);
      setLocationSearchResults([]);
    } finally {
      setIsSearchingLocations(false);
    }
  };

  // Helper to reverse geocode lat/lon to a readable city/state
  const normalizeCityName = (name: string | undefined | null): string => {
    const n = (name || '').trim();
    if (!n) return '';
    // Simple synonym mapping for commonly expected local names
    const map: Record<string, string> = {
      Puducherry: 'Pondicherry',
      'Tiruchirappalli': 'Trichy',
    };
    return map[n] || n;
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      console.log('[Location] Reverse geocoding coords:', lat, lon);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`;
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'BookMyShoot/1.0 (contact: support@bookmyshoot.app)',
          'Accept-Language': 'en',
        },
      });
      if (!resp.ok) throw new Error(`Nominatim status ${resp.status}`);
      const data = await resp.json();
      const addr = data?.address || {};
      const cityRaw =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.hamlet ||
        addr.municipality ||
        addr.county ||
        addr.state_district;
      const state = addr.state || addr.region;
      const country = addr.country;
      let resolved = normalizeCityName(cityRaw) || normalizeCityName(data?.name) || normalizeCityName(data?.display_name?.split(',')[0]) || normalizeCityName(state) || normalizeCityName(country);
      if (!resolved) throw new Error('No city/state from Nominatim');
      console.log('[Location] Reverse geocode resolved name:', resolved);
      return resolved;
    } catch {
      console.log('[Location] Reverse geocode error; trying BigDataCloud fallback');
      try {
        const url2 = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
        const resp2 = await fetch(url2);
        if (!resp2.ok) throw new Error(`BDC status ${resp2.status}`);
        const d2 = await resp2.json();
        const resolved2 = normalizeCityName(d2.city || d2.locality || d2.principalSubdivision || d2.countryName);
        if (resolved2) {
          console.log('[Location] BigDataCloud resolved name:', resolved2);
          return resolved2;
        }
      } catch (e) {
        console.log('[Location] BigDataCloud fallback failed:', e);
      }
      console.log('[Location] All reverse geocoders failed; falling back to coords string');
      return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    }
  };

  // Fetch current GPS location and set temp selection
  const fetchCurrentLocation = async () => {
    try {
      console.log('[Location] Fetch current location: begin');
      setLocationError(null);
      setPermissionBlocked(false);
      setIsFetchingCurrentLocation(true);
      let canUseGeo = true;
      if (Platform.OS === 'android') {
        console.log('[Location] Requesting Android fine/coarse location permissions');
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        const fine = results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
        const coarse = results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];
        const granted = fine === PermissionsAndroid.RESULTS.GRANTED || coarse === PermissionsAndroid.RESULTS.GRANTED;
        const blocked = fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN || coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;
        console.log('[Location] Permission results => fine:', fine, 'coarse:', coarse);
        if (!granted) {
          canUseGeo = false;
          setPermissionBlocked(blocked);
          const msg = blocked ? 'Location permission denied (blocked). Open Settings.' : 'Location permission denied';
          setLocationError(msg);
          console.log('[Location] Permission not granted. blocked?', blocked);
        }
      }

      // Try device geolocation first (using react-native-geolocation-service)
      const getPosition = () =>
        new Promise<any>((resolve, reject) => {
          console.log('[Location] Using Geolocation.getCurrentPosition');
          Geolocation.getCurrentPosition(
            (pos: any) => resolve(pos),
            (err: any) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
          );
        });

      let lat: number | null = null;
      let lon: number | null = null;
      if (canUseGeo) {
        try {
          console.log('[Location] Attempting device geolocation');
          const position = await getPosition();
          lat = (position as any)?.coords?.latitude ?? null;
          lon = (position as any)?.coords?.longitude ?? null;
          console.log('[Location] Device coords:', lat, lon);
        } catch (e) {
          console.log('[Location] Device geolocation failed:', e);
        }
      }

      // Fallback to IP-based location if device coords unavailable
      if (lat == null || lon == null) {
        try {
          console.log('[Location] Falling back to IP-based location');
          const resp = await fetch('https://ipapi.co/json/');
          const data = await resp.json();
          lat = data?.latitude ?? null;
          lon = data?.longitude ?? null;
          console.log('[Location] IP-based coords:', lat, lon);
        } catch (e) {
          console.log('[Location] IP-based location request failed:', e);
        }
      }

      // Secondary IP provider fallback
      if (lat == null || lon == null) {
        try {
          console.log('[Location] Trying secondary IP provider');
          const resp2 = await fetch('https://freeipapi.com/api/json');
          const data2 = await resp2.json();
          lat = data2?.latitude ?? null;
          lon = data2?.longitude ?? null;
          console.log('[Location] Secondary IP coords:', lat, lon);
        } catch (e) {
          console.log('[Location] Secondary IP provider failed:', e);
        }
      }

      if (lat != null && lon != null) {
        const name = await reverseGeocode(lat, lon);
        setTempSelectedLocationName(name);
        console.log('[Location] Temp selected name set:', name);
      } else {
        console.log('[Location] Unable to obtain coordinates');
        setLocationError('Unable to obtain current location');
      }
    } catch (e) {
      // ignore, keep temp name unchanged
      console.log('[Location] Fetch current location error:', e);
    } finally {
      console.log('[Location] Fetch current location: end');
      setIsFetchingCurrentLocation(false);
    }
  };

  const openAppSettings = async () => {
    try {
      console.log('[Location] Opening app settings');
      await Linking.openSettings();
    } catch (e) {
      console.log('[Location] Failed to open settings:', e);
    }
  };

  // Confirm location selection
  const confirmLocationSelection = () => {
    setSelectedLocationName(tempSelectedLocationName);
    closeLocationModal();
  };

  const navigateToStudioDetails = (studioId: string) => {
    navigation.navigate('StudioDetails', { studioId });
  };

  const navigateToPhotographerDetails = (photographerId: string) => {
    navigation.navigate('PhotographerDetails', { photographerId });
  };

  const navigateToSearch = () => {
    navigation.navigate('Search');
  };

  const navigateToBrowse = () => {
    navigation.navigate('Browse');
  };

  const handleToggleFavorite = async (studioId: string) => {
    // 1) Quick auth presence check
    let token: string | null = null;
    try {
      token = await AsyncStorage.getItem('auth_token');
    } catch { }

    // 2) If no token, prompt login immediately
    if (!token) {
      setShowLoginModal(true);
      showInfo('Please log in to add this studio to your favorites!...');
      return;
    }

    // 3) Check token expiry via saved user session, if available
    try {
      const userData = await getUserData();
      const exp = userData?.session?.expires_at; // seconds epoch
      if (typeof exp === 'number') {
        const isExpired = exp * 1000 <= Date.now();
        if (isExpired) {
          setShowLoginModal(true);
          showInfo('Please log in to add this studio to your favorites!...');
          return;
        }
      }
    } catch { }

    // 4) Proceed to toggle favorite and catch auth errors to prompt login
    const isFavorited = isStudioFavorited(studioId);
    const action = isFavorited ? 'remove' : 'add';
    try {
      await dispatch(toggleFavoriteThunk({ studio_id: studioId, action })).unwrap();
      showSuccess(`Studio ${isFavorited ? 'removed from' : 'added to'} your favorite!...`);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || '';
      const isAuthError = msg?.toLowerCase().includes('invalid jwt') || msg?.toLowerCase().includes('unauthorized') || msg?.toLowerCase().includes('authentication');
      if (isAuthError || err?.status === 401) {
        setShowLoginModal(true);
        showInfo('Please log in to add this studio to your favorites!...');
        return;
      }
      // Swallow other errors silently or log
      try { console.log('toggleFavorite error:', err); } catch { }
    }
  };

  const closeLoginModal = () => setShowLoginModal(false);
  const goToLogin = () => {
    setShowLoginModal(false);
    // Navigate to Auth stack Login screen
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const isStudioFavorited = (studioId: string) => {
    return studiosState.favorites.items.some(studio => studio.studio_id === studioId);
  };

  const tabImages = {
    camera: require('../assets/images/potrait.png'),
    fashion: require('../assets/images/fashion.png'),
    product: require('../assets/images/product.png'),
    wedding: require('../assets/images/wedding.png'),
    // add more if needed
  };

  const whyChooseImages = {
    camera: require('../assets/images/camera.png'),
    // add more if needed
  };

  type Category = {
    id: string;
    label: string;
    image: ImageSourcePropType;
  };

  type whyChoose = {
    id: string;
    image: ImageSourcePropType;
    title: string;
    desc: string;
  };

  const categories: Category[] = [
    { id: 'portrait', label: 'Portrait', image: tabImages.camera },
    { id: 'fashion', label: 'Fashion', image: tabImages.fashion },
    { id: 'product', label: 'Product', image: tabImages.product },
    { id: 'wedding', label: 'Wedding', image: tabImages.wedding },
  ];

  const whyChooseData: whyChoose[] = [
    { id: '1', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
    { id: '2', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
    { id: '3', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
    { id: '4', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
  ];

  const renderCategoryChip = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryChip} onPress={navigateToBrowse}>
      <Image resizeMode='contain' source={item.image} style={{ tintColor: COLORS.text.primary, height: 22, width: 22 }} />
      <Text style={styles.categoryText}>{item.label}</Text>
    </TouchableOpacity>
  );

  // const renderStudioCard = ({ item }: { item: Studio }) => (
  //   <TouchableOpacity
  //     style={styles.studioCard}
  //     onPress={() => navigateToStudioDetails(item.id)}
  //   >
  //     <Image source={{ uri: item.images[0] }} style={styles.studioImage} />
  //     <View style={styles.studioInfo}>
  //       <View style={styles.studioHeader}>
  //         <Text style={styles.studioName}>{item.name}</Text>
  //         {item.verified && (
  //           <Icon name="verified" size={18} color={COLORS.accent} />
  //         )}
  //       </View>
  //       <Text style={styles.studioLocation}>
  //         {item.location.city}, {item.location.state}
  //       </Text>
  //       <Text style={styles.studioType}>{item.type.name}</Text>
  //       <View style={styles.ratingContainer}>
  //         <Icon name="star" size={16} color={COLORS.secondary} />
  //         <Text style={styles.rating}>{item.rating}</Text>
  //         <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
  //       </View>
  //       <Text style={styles.price}>₹{item.pricing.hourlyRate}/hour</Text>
  //     </View>
  //   </TouchableOpacity>
  // );

  // const renderFeatureCard = ({ item }: { item: Feature }) => (
  //   <View style={styles.featureCard}>
  //     <Text style={styles.featureIcon}>{item.icon}</Text>
  //     <Text style={styles.featureTitle}>{item.title}</Text>
  //     <Text style={styles.featureDescription}>{item.description}</Text>
  //   </View>
  // );

  // const renderCityCard = ({ item }: { item: any }) => (
  //   <TouchableOpacity style={styles.cityCard} onPress={navigateToBrowse}>
  //     <Text style={styles.cityName}>{item.name}</Text>
  //     <Text style={styles.stateName}>{item.state}</Text>
  //   </TouchableOpacity>
  // );

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          // <Icon
          //   key={i}
          //   name="star"
          //   size={12}
          //   color={i <= rounded ? COLORS.secondary : '#C9CDD2'}
          // />
          <Image
            source={
              i <= rounded
                ? require('../assets/images/rating_selected.png')
                : require('../assets/images/rating_notSelected.png')
            }
            tintColor={i <= rounded ? '#FF6D38' : '#FFD0BF'}
            style={styles.ratingStar}
          />
        ))}
      </View>
    );
  };

  // Prefer API field `studio_images[0].image_url` and fall back to `images[0]`
  // Do NOT return remote placeholder here; allow UI to use local asset
  const getStudioPrimaryImage = (item: any): string | undefined => {
    return item?.studio_images?.[0]?.image_url || item?.images?.[0] || '';
  };

  const renderRecommendCard = ({ item }: { item: Studio }) => (
    <TouchableOpacity style={styles.recommendCard} onPress={() => navigateToStudioDetails(item.id)}>
      <View style={styles.recommendImageContainer}>
        <Image
          source={getStudioPrimaryImage(item) ? { uri: getStudioPrimaryImage(item) } : require('../assets/images/studio_placeholder.png')}
          style={styles.recommendImage}
        />

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Image source={imagePaths.Favorites} resizeMode='contain' tintColor={'#FF7441'} style={styles.locationIcon} />
          <Text style={styles.ratingBadgeText}>{item.rating}</Text>
        </View>

        {/* Heart Icon */}
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <Image resizeMode='contain' source={isStudioFavorited(item.id) ? imagePaths.HeartSelected : imagePaths.Heart} tintColor={'#FF7441'} style={styles.favorites} />
        </TouchableOpacity>
      </View>

      <View style={styles.recommendInfo}>
        <View style={styles.recommendBottomRow}>
          <View style={styles.recommendLeftInfo}>
            <Text style={styles.recommendName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.recommendMeta}>
              <Image source={imagePaths.Location} resizeMode='contain' style={styles.locationIcon} />
              <Text style={styles.recommendLocation} numberOfLines={1}>{item.location.city}</Text>
            </View>
            <View style={styles.recommendMeta}>
              <Image source={imagePaths.SquareFt} resizeMode='contain' style={styles.locationIcon} />
              <Text style={styles.recommendSqft}>800 sq ft</Text>
            </View>
          </View>

          <View style={styles.recommendPriceRow}>
            <Text style={styles.recommendFromText}>From</Text>
            <Text style={styles.recommendPrice}>₹{(item.pricing?.hourly_rate || item.pricing?.hourly || 0).toLocaleString()}</Text>
            <Text style={styles.recommendPerHour}>Per hour</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  // Replace the renderRated function with this:
  const renderRated = ({ item }: { item: any }) => {
    // Handle photographer data structure from actual API
    const isPhotographer = item.services && Array.isArray(item.services);

    if (isPhotographer) {
      // Photographer data structure
      const minPrice = item.services.length > 0
        ? Math.min(...item.services.map((s: any) => s.base_price))
        : 0;
      const imageUrl = (item.portfolio && item.portfolio.length > 0
        ? item.portfolio[0].image_url
        : item.profile_image_url) || '';

      return (
        <TouchableOpacity
          style={styles.ratedCard}
          onPress={() => navigateToPhotographerDetails(item.id)}
        >
          <View style={styles.ratedImageContainer}>
            <Image
              source={photoErrorIds[item.id] || !imageUrl ? require('../assets/images/photographer_placeholder.jpg') : { uri: imageUrl }}
              style={styles.ratedImage}
              onError={() => setPhotoErrorIds(prev => ({ ...prev, [item.id]: true }))}
            />
            <TouchableOpacity
              style={styles.ratedHeartIcon}
              onPress={() => handleToggleFavorite(item.id)}
            >
              <Image resizeMode='contain' source={isStudioFavorited(item.id) ? imagePaths.HeartSelected : imagePaths.Heart} tintColor={'#FF7441'} style={styles.favorites} />
            </TouchableOpacity>
          </View>

          <View style={styles.ratedInfo}>
            <View style={styles.ratedTopRow}>
              {renderStars(item.rating || 0)}
            </View>

            <Text style={styles.ratedName} numberOfLines={1}>Photographer </Text>

            <View style={styles.ratedLocationRow}>
              <Image resizeMode='contain' source={imagePaths.Location} style={styles.locationIcon} />
              <Text style={styles.ratedLocation} numberOfLines={1}>Available</Text>
            </View>

            <View style={styles.ratedBottomRow}>
              <Text style={styles.ratedFromText}>From <Text style={styles.ratedPrice}>₹{minPrice?.toLocaleString() || 'N/A'}</Text> <Text style={styles.ratedPerHour}>Per session</Text></Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      // Studio data structure (existing logic)
      return (
        <TouchableOpacity
          style={styles.ratedCard}
          onPress={() => navigateToStudioDetails(item.id)}
        >
          <View style={styles.ratedImageContainer}>
            <Image
              source={{ uri: getStudioPrimaryImage(item) }}
              style={styles.ratedImage}
            />
            <TouchableOpacity
              style={styles.ratedHeartIcon}
              onPress={() => handleToggleFavorite(item.id)}
            >
              <Icon
                name={isStudioFavorited(item.id) ? "favorite" : "favorite-border"}
                size={16}
                color="#FF6D38"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.ratedInfo}>
            <View style={styles.ratedTopRow}>
              {renderStars(item.average_rating || 0)}
            </View>

            <Text style={styles.ratedName} numberOfLines={1}>{item.name}</Text>

            <View style={styles.ratedLocationRow}>
              <Icon name="place" size={14} color={COLORS.text.secondary} />
              <Text style={styles.ratedLocation} numberOfLines={1}>{item.location?.city || 'Location not specified'}</Text>
            </View>

            <View style={styles.ratedBottomRow}>
              <Text style={styles.ratedFromText}>From <Text style={styles.ratedPrice}>₹{item.pricing?.hourly_rate?.toLocaleString() || 'N/A'}</Text> <Text style={styles.ratedPerHour}>Per hour</Text></Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };


  const renderWhuChooseCard = ({ item, index }: { item: whyChoose, index: number }) => (
    <LinearGradient
      key={item.id}
      colors={['#2CBA9E', '#CEF9ED']}
      start={{ x: 0, y: 0 }}   // gradient starts from the left
      end={{ x: 1, y: 0 }}     // gradient ends at the right
      style={[
        styles.whyCard,
        {
          marginLeft: index === 0 ? 10 : 5,
          marginRight: index === whyChooseData.length - 1 ? 5 : 10,
        },
      ]}
    >
      <View>
        <Image
          source={item.image}
          style={styles.whyIconImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.whyTextContent}>
        <Text style={styles.whyTitle}>{item.title}</Text>
        <Text style={styles.whySubtitle}>
          {item.desc}
        </Text>
      </View>
    </LinearGradient>
  )

  // const renderGridCard = ({ item }: { item: Studio }) => (
  //   <TouchableOpacity style={styles.gridCard} onPress={() => navigateToStudioDetails(item.id)}>
  //     <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
  //     <View style={styles.gridInfo}>
  //       <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
  //       <Text style={styles.gridLocation} numberOfLines={1}>{item.location.city}</Text>
  //       <Text style={styles.gridPrice} numberOfLines={1}>From ₹{item.pricing.hourlyRate}/hour</Text>
  //     </View>
  //   </TouchableOpacity>
  // );

  const onRefresh = async () => {
  setRefreshing(true);

   await dispatch(studiosSearchThunk({
      q: '',
      city: '',
      types: [],
      page: 1,
      limit: 10
    }));

    // Fetch photographers with basic search parameters
    await dispatch(getphotographersSearch({
      query: '',
      location: '',
      specialization: '',
      priceRange: "0-10000",
      page: 1,
      limit: 10
    }));
    
      setRefreshing(false);
    
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor={COLORS.surface} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        scrollEnabled={!showOverlay}
          refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#034833"]}      // Android
    />
  }
      >
        {/* Header */}
        <View style={styles.headerOutline}>
          {/* Top Row: Logo, Greeting, Location, Notification */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../assets/images/logoo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.welcomeText}>
                Hello<Text style={styles.userName}> {currentUser?.full_name?.split(' ')[0] || 'User'} !</Text>
              </Text>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.rightColumn}>
                <TouchableOpacity style={styles.notificationIconOutline}>
                  <Image source={imagePaths.NotificationNew} resizeMode='contain' style={styles.notificationIcon} />
                </TouchableOpacity>
                <View style={styles.locationContainer}>
                  <Text style={styles.locationLabel}>Current Location</Text>
                  <TouchableOpacity style={styles.locationRow} onPress={openLocationModal}>
                    <Image source={imagePaths.LocationNew} resizeMode='contain' style={{ height: 14, width: 14 }} />
                    <Text style={styles.locationText}>{selectedLocationName}</Text>
                  </TouchableOpacity>
                </View>


              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              {/* <Icon name="search" size={18} color={COLORS.text.secondary} /> */}
              <TextInput
                style={styles.searchPlaceholder}
                placeholder="Search Studios..."
                placeholderTextColor={'#B7B7B7'}
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  // show overlay immediately when typing
                  setShowOverlay(!!text.trim());
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setShowOverlay(!!query.trim());
                }}
                onBlur={() => {
                  setIsSearchFocused(false);
                  // small delay so item taps can register
                  setTimeout(() => setShowOverlay(false), 100);
                }}
              />
              <View style={styles.searchIconButton} >
                <Image source={imagePaths.Search} style={styles.searchIcon} />
              </View>
              {locationError ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.locationErrorText}>{locationError}</Text>
                  {permissionBlocked ? (
                    <TouchableOpacity style={[styles.useCurrentButton, { marginTop: 8 }]} onPress={openAppSettings}>
                      <Icon name="settings" size={18} color={COLORS.background} />
                      <Text style={styles.useCurrentText}>Open Settings</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </View>
            {showOverlay && (
              <View style={styles.searchOverlay}>
                <FlatList
                  data={((studiosState.search?.results ?? []) as any[])
                    .filter((item: any) => {
                      const q = query.trim().toLowerCase();
                      if (!q) return false;
                      const name: string = (item?.name || item?.studioName || '').toLowerCase();
                      const city: string = (item?.location?.city || item?.city || '').toLowerCase();
                      return name.includes(q) || city.includes(q);
                    })
                    .slice(0, 8)}
                  keyExtractor={(item: any) => String(item?.id)}
                  keyboardShouldPersistTaps={'always'}
                  nestedScrollEnabled
                  renderItem={({ item }: { item: any }) => {
                    const name = item?.name || item?.studioName || 'Studio';
                    const city = item?.location?.city || item?.city || '—';
                    const price = item?.pricing?.hourly_rate || item?.pricing?.hourlyRate || item?.pricing?.price || item?.price || null;
                    // Prefer API field studio_images[0].image_url and fall back to images[0]
                    const imageUri = getStudioPrimaryImage(item) || null;
                    const studioId = String(item?.id ?? name);
                    return (
                      <TouchableOpacity
                        style={styles.searchOverlayItem}
                        onPress={() => {
                          setShowOverlay(false);
                          navigateToStudioDetails(studioId);
                        }}
                      >
                        {imageUri ? (
                          <Image source={{ uri: imageUri }} style={styles.searchOverlayThumb} />
                        ) : (
                          <Image source={imagePaths.StudioPlaceHolderImage} style={styles.searchOverlayThumb} />
                        )}
                        <View style={styles.searchOverlayTexts}>
                          <Text style={styles.searchOverlayTitle} numberOfLines={1}>{name}</Text>
                          <Text style={styles.searchOverlaySubtitle} numberOfLines={1}>{city}</Text>
                        </View>
                        {price ? (
                          <Text style={styles.searchOverlayPrice}>
                            ₹{price}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={() => (
                    <View style={styles.searchOverlayEmpty}>
                      <Text style={styles.searchOverlayEmptyText}>No studios found</Text>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <FlatList
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Recommended Studios for you */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Studios for you</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllStudios')} accessibilityRole="button" accessibilityLabel={'Show all studios'}>
              <View style={styles.viewAllRow}>
                <Text style={styles.viewAllButton}>View all</Text>
                <Image source={imagePaths.rightArrow} style={styles.viewAllIcon} />
              </View>
            </TouchableOpacity>
          </View>

          {studiosState.search.loading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3, 4].map((_, index) => (
                <RecommendCardSkeleton key={index} />
              ))}
            </ScrollView>
          ) : studiosError ? (
            <Text style={{ color: 'red', textAlign: 'center', marginVertical: 20 }}>
              Error loading studios: {studiosError}
            </Text>
          ) : (
            <FlatList
              data={studiosState.search.results as unknown as Studio[]}
              renderItem={renderRecommendCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.studioList}
            />
          )}

        </View>

        {/* Browse Photographers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Photographers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllPhotographers' as never)} accessibilityRole="button" accessibilityLabel={'Show all photographers'}>
              <View style={styles.viewAllRow}>
                <Text style={styles.viewAllButton}>View all</Text>
                <Image source={imagePaths.rightArrow} style={styles.viewAllIcon} />
              </View>
            </TouchableOpacity>
          </View>

          {photographersState.search.loading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((_, i) => (
                <RatedCardSkeleton key={i} />
              ))}
            </ScrollView>
          ) : photographersError ? (
            <Text style={{ color: 'red', textAlign: 'center', marginVertical: 20 }}>
              Error loading photographers: {photographersError}
            </Text>
          ) : (
            <FlatList
              data={photographersState.search.items}
              renderItem={renderRated}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.studioList}
            />
          )}
        </View>

        {/* Why Choose Book My Shoot? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Book My Shoot?</Text>
          <FlatList
            data={whyChooseData}
            ref={flatListRef}
            renderItem={renderWhuChooseCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.studioList}
            onMomentumScrollEnd={handleScroll}
          />
          <View style={styles.dotsRow}>
            {whyChooseData.map((item, index) => (
              <View key={index} style={currentIndex == index ? styles.dotActive : styles.dot} />
            ))}
          </View>
        </View>

        {/* CTA Section */}
        {/* <View style={styles.ctaSection}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.ctaCard}
          >
            <Text style={styles.ctaTitle}>Ready to Book?</Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of photographers who trust us
            </Text>
            <TouchableOpacity style={styles.ctaButton} onPress={navigateToBrowse}>
              <Text style={styles.ctaButtonText}>Browse Studios</Text>
              <Icon name="arrow-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View> */}
      </ScrollView>
      {/* Login Required Modal */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Login Required</Text>
            </View>
            <Text style={styles.modalLabel}>Please log in to favorite studios.</Text>
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

      {/* Location Selection Modal */}
      <Modal visible={locationModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
            </View>
            <View style={styles.locationModalBody}>
              <TextInput
                style={styles.locationSearchInput}
                placeholder="Search location..."
                placeholderTextColor={COLORS.text.secondary}
                value={locationQuery}
                onChangeText={searchLocations}
              />
              <TouchableOpacity style={styles.useCurrentButton} onPress={fetchCurrentLocation}>
                <Icon name="my-location" size={18} color={COLORS.background} />
                <Text style={styles.useCurrentText}>
                  {isFetchingCurrentLocation ? 'Fetching current location...' : 'Use current location'}
                </Text>
              </TouchableOpacity>
              {locationError ? (
                <Text style={styles.locationErrorText}>{locationError}</Text>
              ) : null}

              {isSearchingLocations && (
                <ActivityIndicator size="small" color={COLORS.bg} style={{ marginTop: 8 }} />
              )}

              <FlatList
                data={locationSearchResults}
                keyExtractor={(item) => item.place_id?.toString?.() || Math.random().toString()}
                style={{ maxHeight: 200, marginTop: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.locationResultItem}
                    onPress={() => setTempSelectedLocationName(item.display_name)}
                  >
                    <Icon name="place" size={16} color={COLORS.text.secondary} />
                    <Text style={styles.locationResultText} numberOfLines={1}>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  locationQuery.trim().length >= 2 && !isSearchingLocations
                    ? () => (<Text style={styles.locationEmpty}>No matches</Text>)
                    : undefined
                }
              />

              <View style={styles.selectedPreviewRow}>
                <Text style={styles.modalLabel}>Selected:</Text>
                <Text style={styles.selectedPreviewText} numberOfLines={1}>{tempSelectedLocationName}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButtonModal} onPress={closeLocationModal}>
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmLocationSelection}>
                <Text style={styles.confirmButtonText}>OK</Text>
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
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: 24,
    ...typography.bold,
    color: COLORS.background,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 10,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    ...typography.bold,
    color: COLORS.text.primary,
    marginBottom: 15,
    alignSelf: 'center',
  },
  viewAllButton: {
    fontSize: 12,
    color: COLORS.bg,
    ...typography.semibold,
  },
  viewAllRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAllIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.bg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.text.primary,
    ...typography.medium,
  },
  cityList: {
    paddingRight: 20,
  },
  cityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  cityName: {
    fontSize: 14,
    ...typography.semibold,
    color: COLORS.text.primary,
  },
  stateName: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  studioList: {
    padding: 5,
  },
  recommendCard: {
    width: RECOMMEND_CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',

  },
  locationIcon: {
    height: 12,
    width: 12
  },
  favorites: {
    height: 16,
    width: 16
  },
  recommendImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  recommendImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFFFFF99',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadgeText: {
    color: 'black',
    fontSize: 12,
    ...typography.semibold,
    marginLeft: 2,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF99',
    borderRadius: 15,
    padding: 5,
  },
  recommendInfo: {
    padding: 12,
  },
  recommendName: {
    fontSize: 14,
    ...typography.semibold,
    color: COLORS.text.primary,
  },
  recommendBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recommendLeftInfo: {
    flex: 1,
  },
  recommendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  recommendLocation: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  recommendSqft: {
    fontSize: 12,
    marginLeft: 4,
    color: COLORS.text.secondary,
  },
  recommendPriceRow: {
    alignItems: 'flex-end',
  },
  recommendFromText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  recommendPerHour: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendRatingText: {
    fontSize: 13,
    ...typography.semibold,
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  recommendPrice: {
    fontSize: 14,
    ...typography.bold,
    color: '#FF6B35',
    textAlign: 'right',
  },
  gridCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 12,
    elevation: 1,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridInfo: {
    padding: 10,
  },
  gridName: {
    fontSize: 14,
    ...typography.bold,
    color: COLORS.text.primary,
  },
  gridLocation: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  gridPrice: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  studioCard: {
    width: STUDIO_CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  studioImage: {
    width: '100%',
    height: 180,
  },
  studioInfo: {
    padding: 15,
  },
  studioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studioName: {
    fontSize: 16,
    ...typography.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  studioLocation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  studioType: {
    fontSize: 14,
    color: COLORS.primary,
    ...typography.semibold,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    fontSize: 14,
    ...typography.semibold,
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    ...typography.bold,
    color: COLORS.primary,
    marginTop: 8,
  },
  featuresGrid: {
    marginHorizontal: -10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 15,
    margin: 5,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    ...typography.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  whyCard: {
    width: WHY_CHOOSE_CARD_WIDTH,
    borderRadius: 14,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  whyIconImage: {
    width: 90,
    height: 90,
  },
  whyTextContent: {
    flex: 1,
    marginLeft: 20,
  },
  whyTitle: {
    fontSize: 16,
    ...typography.bold,
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  whySubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
    ...typography.semibold,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: '#D9D9D9',
  },
  dotActive: {
    width: 16,
    height: 4,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: '#034833',
  },
  ctaSection: {
    margin: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  ctaCard: {
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    ...typography.bold,
    color: COLORS.background,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    fontSize: 16,
    ...typography.bold,
    color: COLORS.primary,
    marginRight: 8,
  },
  headerOutline: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: 10,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  rightColumn: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  headerLogo: {
    height: 50,
    width: 64,
    marginRight: 12,
  },
  welcomeText: {
    ...typography.semibold,
    fontSize: 18,
    color: COLORS.text.primary,
  },
  userName: {
    color: '#FF6B35'
  },
  locationContainer: {
    alignItems: 'flex-end',
    marginVertical: 10,
  },
  locationLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginBottom: 2,
    ...typography.medium,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#FF6B35',
    ...typography.semibold,
    marginLeft: 4,
  },
  notificationIcon: {
    height: 22,
    width: 22,
  },
  notificationIconOutline: {
    padding: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#034833',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginTop: 20,
    marginHorizontal: 4,
    position: 'relative',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
  },
  searchPlaceholder: {
    flex: 1,
    paddingLeft: 16,
    fontSize: 14,
    height: 48,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    color: '#101010',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#034833',
  },
  searchIconButton: {
    width: 80,
    height: 48,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: '#034833',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    height: 24,
    width: 24,
  },
  searchOverlay: {
    position: 'absolute',
    top: 56,
    left: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#034833',
    maxHeight: 280,
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  searchOverlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E4E4E4',
    backgroundColor: '#FFFFFF',
  },
  searchOverlayThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
  },
  searchOverlayTexts: {
    flex: 1,
    marginLeft: 10,
  },
  searchOverlayTitle: {
    fontSize: 14,
    ...typography.semibold,
    color: COLORS.text.primary,
  },
  searchOverlaySubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  searchOverlayPrice: {
    fontSize: 12,
    ...typography.semibold,
    color: '#FF6B35',
    marginLeft: 8,
  },
  searchOverlayEmpty: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchOverlayEmptyText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  // ratingStar: {
  //   height: 9,
  //   width: 9
  // }
  // Update these existing styles:
  ratingStar: {
    height: 12,
    width: 12,
    marginHorizontal: 1,
  },

  // Add these new styles for the Top Rated section:
  ratedCard: {
    width: width * 0.8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
  },
  ratedImageContainer: {
    position: 'relative',
    width: 150,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  ratedImage: {
    width: '100%',
    height: '100%',
  },
  ratedHeartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF99',
    borderRadius: 15,
    padding: 5,
  },
  ratedInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  ratedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratedName: {
    fontSize: 16,
    ...typography.semibold,
    color: COLORS.text.primary,
    // marginTop: 4,

  },
  ratedLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 4,
    marginBottom: 15,
  },
  ratedLocation: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  ratedBottomRow: {
    marginTop: 8,
  },
  ratedFromText: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  ratedPrice: {
    fontSize: 16,
    ...typography.bold,
    color: '#FF6B35',
  },
  ratedPerHour: {
    fontSize: 13,
    color: COLORS.text.secondary,
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
    ...typography.bold,
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
    ...typography.semibold,
  },
  cancelButtonModal: {
    backgroundColor: '#838383ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  // Location modal styles
  locationModalBody: {
    marginTop: 4,
  },
  locationSearchInput: {
    borderWidth: 1,
    borderColor: COLORS.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text.primary,
  },
  useCurrentButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    gap: 8,
  },
  useCurrentText: {
    color: '#fff',
    ...typography.semibold,
  },
  locationResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  locationResultText: {
    flex: 1,
    color: COLORS.text.primary,
  },
  locationEmpty: {
    marginTop: 10,
    color: COLORS.text.secondary,
  },
  selectedPreviewRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedPreviewText: {
    flex: 1,
    color: '#FF6B35',
    ...typography.semibold,
  },
  locationErrorText: {
    marginTop: 8,
    color: 'red',
  },

});

export default HomeScreen;