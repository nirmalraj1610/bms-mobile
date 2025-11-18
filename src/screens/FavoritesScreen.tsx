import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import imagePaths from '../constants/imagePaths';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';
import { RootState, AppDispatch } from '../store/store';
import { loadFavoritesThunk, toggleFavoriteThunk } from '../features/studios/studiosSlice';
import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../lib/http';
import FavoriteStudiosSkeleton from '../components/skeletonLoaders/FavoriteStudiosSkeleton';
import { showInfo, showSuccess } from '../utils/helperFunctions';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState('');
  const [thumbErrorIds, setThumbErrorIds] = useState<Record<string, boolean>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);

  // pull to refresh
  const [refreshing, setRefreshing] = useState(false);

  // Get favorites data from Redux store
  const { favorites: favoritesState } = useSelector((state: RootState) => state.studios);
  const favorites = favoritesState.items;
  const loading = favoritesState.loading;
  const error = favoritesState.error;

  // Load favorites when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Auth presence/expiry check similar to BookingScreen
      const checkAuth = async () => {
        let token: string | null = null;
        try { token = await AsyncStorage.getItem('auth_token'); } catch { }
        if (!token) {
          setShowLoginModal(true);
          showInfo('Please log in to view your favorites!...');
          return;
        }
        try {
          const userData = await getUserData();
          const exp = userData?.session?.expires_at; // seconds epoch
          if (typeof exp === 'number') {
            const isExpired = exp * 1000 <= Date.now();
            if (isExpired) {
              setShowLoginModal(true);
              showInfo('Please log in to view your favorites!...');
              return;
            }
          }
        } catch { }
      };

      if (isFocused) {
        checkAuth();
      }

      dispatch(loadFavoritesThunk());
    }, [dispatch, isFocused])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(loadFavoritesThunk());
    setRefreshing(false);
  }

  // Show login modal when API returns auth errors
  useEffect(() => {
    const msg = String(error || '').toLowerCase();
    if (msg.includes('invalid jwt') || msg.includes('unauthorized') || msg.includes('authentication')) {
      setShowLoginModal(true);
      showInfo('Please log in to view your favorites!...');
    }
  }, [error]);

  // Favorite toggle functionality
  const handleToggleFavorite = async (studioId: string) => {
    // Quick auth presence check
    let token: string | null = null;
    try { token = await AsyncStorage.getItem('auth_token'); } catch { }
    if (!token) {
      setShowLoginModal(true);
      showInfo('Please log in to view your favorites!...');
      return;
    }
    // Check token expiry via saved user session
    try {
      const userData = await getUserData();
      const exp = userData?.session?.expires_at; // seconds epoch
      if (typeof exp === 'number') {
        const isExpired = exp * 1000 <= Date.now();
        if (isExpired) {
          setShowLoginModal(true);
          showInfo('Please log in to view your favorites!...');
          return;
        }
      }
    } catch { }

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
        showInfo('Please log in to view your favorites!...');
        return;
      }
      try { console.log('toggleFavorite error:', err); } catch { }
    }
  };

  // Login modal handlers
  const closeLoginModal = () => setShowLoginModal(false);
  const goToLogin = () => {
    setShowLoginModal(false);
    showInfo('Please log in to view your favorites!...');
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const isStudioFavorited = (studioId: string) => {
    return favorites.some((favorite: any) => {
      // Handle different data structures for studio_id
      return favorite.studio_id === studioId ||
        favorite.id === studioId ||
        (favorite.studios && favorite.studios.id === studioId);
    });
  };

  // Map favorites from Redux state into list-friendly shape for this screen
  const items = useMemo(
    () =>
      favorites.map((favorite: any) => {
        // Handle different possible data structures
        let studio: any;

        if (typeof favorite.studios === 'object' && favorite.studios !== null) {
          // Case 1: studios is an object containing studio data
          studio = favorite.studios;
        } else if (typeof favorite.studios === 'string') {
          // Case 2: studios is a string ID, use favorite data directly
          studio = favorite;
        } else {
          // Case 3: fallback to favorite data directly
          studio = favorite;
        }

        // Prefer API field studio_images[0].image_url and fall back to images[0]
        const imageUrl = studio?.studio_images?.[0]?.image_url || studio?.images?.[0] || null;

        return {
          id: studio?.id || favorite?.studio_id || favorite?.id || 'unknown',
          name: studio?.name || 'Unknown Studio',
          thumbnail: imageUrl,
          location: { city: studio?.location?.city || 'Unknown Location' },
          average_rating: studio?.average_rating || 0,
          total_reviews: studio?.reviews?.length || studio?.total_reviews || 0,
        };
      }),
    [favorites]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i: any) =>
      [i.name || '', i.location?.city || ''].some((t) => t.toLowerCase().includes(q))
    );
  }, [items, query]);

  const renderStars = (rating?: number) => {
    const rounded = Math.round(rating || 0);
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={[styles.starGlyph, { color: i <= rounded ? COLORS.secondary : '#C9CDD2' }]}>★</Text>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Main' as never, {
          screen: 'Home',
          params: { screen: 'StudioDetails', params: { studioId: item.id } },
        } as never)
      }
    >
      <Image
        source={thumbErrorIds[item.id] || !item.thumbnail
          ? require('../assets/images/studio_placeholder.png')
          : { uri: item.thumbnail }}
        style={styles.thumb}
        onError={() => setThumbErrorIds(prev => ({ ...prev, [item.id]: true }))}
      />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
            <Icon
              name={isStudioFavorited(item.id) ? "favorite" : "favorite-border"}
              size={22}
              color={COLORS.favColor}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.ratingRow}>
          {renderStars(item.average_rating)}
          {!!item.average_rating && (
            <Text style={styles.ratingText}>{Number(item.average_rating).toFixed(1)}</Text>
          )}
          {!!item.total_reviews && (
            <Text style={styles.reviewText}>({item.total_reviews} Reviews)</Text>
          )}
        </View>
        <View style={styles.recommendMeta}>

          <Icon name="place" size={12} color={COLORS.text.secondary} />
          <Text style={styles.recommendLocation} numberOfLines={1}>{item.location.city}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyHeadRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={imagePaths.backArrow} style={{ width: 22, height: 22, tintColor: COLORS.text.primary }} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>
      <View style={styles.headerBlock}>
        <Text style={styles.screenTitle}>My Favorite Studios</Text>
        <Text style={styles.screenSubtitle}>Studios you've saved for future bookings</Text>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <TextInput
            style={styles.searchPlaceholder}
            placeholder="Search..."
            placeholderTextColor={'#B7B7B7'}
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.searchIconButton} >
            <Image source={imagePaths.Search} style={styles.searchIcon} />
          </View>
        </View>
      </View>

      <View style={styles.emptyContent}>
        <Icon name="favorite" size={64} color={COLORS.text.primary} />
        <Text style={styles.emptyTitle}>No Favourite Studios Yet</Text>
        <Text style={styles.emptySubtitle}>Start exploring and save studios you love for quick acess later</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Browse')}>
          <Text style={styles.browseBtnText}>Browse Studios</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Login Required Modal */}
      {showLoginModal && <View style={{ flex: 1, height: '100%', width: '100%', position: 'absolute', margin: 0, zIndex: 99 }} >
        <View style={styles.loginBackdrop}>
          {/* True blur backdrop with light, white-tinted feel */}
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={20}
            reducedTransparencyFallbackColor="white"
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Login Required</Text>
            </View>
            <Text style={styles.modalLabel}>Please log in to view your favorites.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.confirmButton} onPress={goToLogin}>
                <Text style={styles.confirmButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>}

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.content}>
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
              style={styles.backBtn}
            >
              <Image source={imagePaths.backArrow} style={{ width: 22, height: 22, tintColor: COLORS.text.primary }} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.screenTitle}>My Favorite Studios</Text>
            <Text style={styles.screenSubtitle}>Studios you've saved for future bookings</Text>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <TextInput
                style={styles.searchPlaceholder}
                placeholder="Search..."
                placeholderTextColor={'#B7B7B7'}
                value={query}
                onChangeText={setQuery}
              />
              <View style={styles.searchIconButton} >
                <Image source={imagePaths.Search} style={styles.searchIcon} />
              </View>
            </View>
          </View>
          {loading ? (
            <FavoriteStudiosSkeleton />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={48} color={COLORS.text.secondary} />
              <Text style={styles.errorTitle}>Unable to load favorites</Text>
              <Text style={styles.errorSubtitle}>Please check your connection and try again</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => dispatch(loadFavoritesThunk())}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={styles.listContainer}
              data={filtered}
              keyExtractor={(i) => i.id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#034833"]}      // Android
                />}
              renderItem={renderItem}
              ListHeaderComponent={<View style={{ height: 8 }} />}
              ListFooterComponent={<View style={{ height: 24 }} />}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Stronger backdrop for login (blur-like feel)
  loginBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
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
    ...typography.bold,
    color: COLORS.text.primary,
  },
  screenSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 6,
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
  listContainer: {
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  thumb: {
    width: 104,
    height: 104,
    borderRadius: 12,
    marginRight: 12,
  },
  thumbPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    ...typography.bold,
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
    ...typography.semibold,
    color: COLORS.text.primary,
    marginLeft: 6,
  },
  reviewText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 6,
  },
  cityText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 6,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    ...typography.bold,
    color: COLORS.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  browseBtn: {
    marginTop: 20,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  browseBtnText: {
    color: COLORS.background,
    fontSize: 15,
    ...typography.semibold,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    ...typography.bold,
    color: COLORS.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: COLORS.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryBtnText: {
    color: COLORS.background,
    fontSize: 15,
    ...typography.semibold,
  },
  modalContainer: {
    width: '88%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    ...typography.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default FavoritesScreen;