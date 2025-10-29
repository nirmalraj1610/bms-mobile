import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants';
import { RootState, AppDispatch } from '../store/store';
import { loadFavoritesThunk } from '../features/studios/studiosSlice';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState('');
  
  // Get favorites data from Redux store
  const { favorites: favoritesState } = useSelector((state: RootState) => state.studios);
  const favorites = favoritesState.items;
  const loading = favoritesState.loading;
  const error = favoritesState.error;

  // Load favorites when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(loadFavoritesThunk());
    }, [dispatch])
  );

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
        
        return {
          id: studio?.id || favorite?.studio_id || favorite?.id || 'unknown',
          name: studio?.name || 'Unknown Studio',
          thumbnail: studio?.images?.[0] || null,
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
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('StudioDetails', { studioId: item.id })}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Icon name="photo" size={26} color={COLORS.text.secondary} />
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <View>
            <Icon name="favorite" size={22} color={COLORS.favColor} />
          </View>
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
          <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>
      <View style={styles.headerBlock}>
        <Text style={styles.screenTitle}>My Favorite Studios</Text>
        <Text style={styles.screenSubtitle}>Studios you've saved for future bookings</Text>
      </View>
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
        </View>
        <TouchableOpacity style={styles.searchIconButton}>
          <Icon name="search" size={20} color={COLORS.background} />
        </TouchableOpacity>
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
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.content}>
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
              style={styles.backBtn}
            >
              <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.screenTitle}>My Favorite Studios</Text>
            <Text style={styles.screenSubtitle}>Studios you've saved for future bookings</Text>
          </View>
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.success} />
              <Text style={styles.loadingText}>Loading your favorites...</Text>
            </View>
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
    fontWeight: '700',
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
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    fontWeight: '700',
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
    backgroundColor: COLORS.success,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  browseBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
});

export default FavoritesScreen;