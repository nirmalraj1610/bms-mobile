import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBar from '../components/HeaderBar';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';
import imagePaths from '../constants/imagePaths';
import { RootState, AppDispatch } from '../store/store';
import { studiosSearchThunk, toggleFavoriteThunk } from '../features/studios/studiosSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../lib/http';
import StudioListSkeleton from '../components/skeletonLoaders/StudioListSkeleton';

const AllStudiosScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const studiosState = useSelector((state: RootState) => state.studios);
  const [searchText, setSearchText] = useState('');

  // pull to refresh
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(studiosSearchThunk({ q: searchText }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchText, dispatch]);

  const isStudioFavorited = (studioId: string) => {
    return studiosState.favorites.items.some((favorite: any) => {
      return favorite.studio_id === studioId || favorite.id === studioId || (favorite.studios && favorite.studios.id === studioId);
    });
  };

  const toggleFavorite = async (studioId: string) => {
    let token: string | null = null;
    try { token = await AsyncStorage.getItem('auth_token'); } catch { }
    if (!token) {
      navigation.navigate('Auth' as never, { screen: 'Login' } as never);
      return;
    }
    try {
      const userData = await getUserData();
      const exp = userData?.session?.expires_at;
      if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
        navigation.navigate('Auth' as never, { screen: 'Login' } as never);
        return;
      }
    } catch { }

    const action = isStudioFavorited(studioId) ? 'remove' : 'add';
    try {
      await dispatch(toggleFavoriteThunk({ studio_id: studioId, action })).unwrap();
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || '';
      const isAuthError = msg?.toLowerCase().includes('invalid jwt') || msg?.toLowerCase().includes('unauthorized') || msg?.toLowerCase().includes('authentication');
      if (isAuthError || err?.status === 401) {
        navigation.navigate('Auth' as never, { screen: 'Login' } as never);
        return;
      }
      try { console.log('toggleFavorite error:', err); } catch { }
    }
  };

  const results = useMemo(() => studiosState.search.results || [], [studiosState.search.results]);
  const filteredResults = useMemo(() => {
    const t = (searchText || '').trim().toLowerCase();
    if (!t) return results;
    return results.filter((item: any) => (item?.name || '').toLowerCase().includes(t));
  }, [results, searchText]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(studiosSearchThunk({ q: searchText }));
    setRefreshing(false);
  }

  const renderItem = ({ item }: any) => {
    const name = item?.name || 'Unknown Studio';
    const id = item?.id ?? item?._id ?? item?.studio_id ?? item?.studioId ?? name;
    const city = item?.location?.city || 'Unknown';
    const rating = item?.average_rating || 0;
    const reviews = item?.total_reviews || item?.reviews?.length || 0;
    const imageUrl = item?.studio_images?.[0]?.image_url || item?.images?.[0] || null;
    const hourly = item?.pricing?.hourly_rate ?? item?.pricing?.hourly ?? item?.hourly_rate ?? undefined;

    const favorited = isStudioFavorited(id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Main' as never, {
            screen: 'Home',
            params: {
              screen: 'StudioDetails',
              params: { studioId: String(id) },
            },
          } as never)
        }
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumb} />
        ) : (
          <Image source={imagePaths.StudioPlaceHolderImage} style={styles.thumb} />
        )}
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text numberOfLines={1} style={styles.cardTitle}>{name}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(id)}>
              <View style={styles.starsRow}>
                <Icon name={favorited ? 'favorite' : 'favorite-border'} size={20} color={favorited ? '#FF7441' : '#9AA0A6'} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              <Icon name="star" size={14} color="#FFA000" />
              <Icon name="star" size={14} color="#FFA000" />
              <Icon name="star" size={14} color="#FFA000" />
              <Icon name="star" size={14} color="#FFA000" />
              <Icon name="star" size={14} color="#E0E0E0" />
            </View>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewText}>({reviews} reviews)</Text>
          </View>
          <View style={styles.metaRow}>
            <Image source={imagePaths.Location} resizeMode='contain' style={styles.metaIcon} />
            <Text style={styles.cityText}>{city}</Text>
          </View>
          <View style={styles.metaRow}>
            <Image source={imagePaths.SquareFt} resizeMode='contain' style={styles.metaIcon} />
            <Text style={styles.sqftText}>800 sq ft</Text>
          </View>

          {/* {hourly !== undefined ? (
            <View style={styles.priceRow}>
              <Text style={styles.fromText}>From</Text>
              <Text style={styles.priceText}>₹{Number(hourly).toLocaleString()}</Text>
              <Text style={styles.perHourText}>Per hour</Text>
            </View>
          ) : null} */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HeaderBar onBack={() => navigation.goBack()} />

        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>All Studios</Text>
          <Text style={styles.screenSubtitle}>Browse and search studios near you</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <TextInput
              style={styles.searchPlaceholder}
              placeholder="Search studios..."
              placeholderTextColor={'#B7B7B7'}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            <View style={styles.searchIconButton} >
              <Image source={imagePaths.Search} style={styles.searchIcon} />
            </View>
          </View>
        </View>

        {studiosState.search.loading ? (
          <StudioListSkeleton />
        ) : (
          <FlatList
            data={filteredResults}
            keyExtractor={(item: any, index: number) => String(item?.id ?? item?._id ?? item?.studio_id ?? item?.studioId ?? index)}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#034833"]}      // Android
              />}
            contentContainerStyle={filteredResults.length === 0 ? styles.emptyScreen : styles.listContainer}
            ListEmptyComponent={() => (
              searchText.trim().length > 0 ? (
                <Text style={styles.emptyTitle}>No results found</Text>
              ) : null
            )}
          />
        )}
      </View>
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
    paddingBottom: 200,
  },
  emptyScreen: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyImage: {
    width: 140,
    height: 140,
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 18,
    ...typography.bold,
    color: COLORS.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
    marginLeft: 4,
    // marginTop: 6,
  },
  sqftText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 3,
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaIcon: {
    width: 12,
    height: 12,
  },
  priceRow: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  fromText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  priceText: {
    fontSize: 14,
    ...typography.bold,
    color: '#FF6B35',
    textAlign: 'right',
  },
  perHourText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
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
});

export default AllStudiosScreen;