import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBar from '../components/HeaderBar';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../constants';
import imagePaths from '../constants/imagePaths';
import { typography } from '../constants/typography';
import { RootState, AppDispatch } from '../store/store';
import { getphotographersSearch } from '../features/photographers/photographersSlice';
import PhotographerListSkeleton from '../components/skeletonLoaders/PhotographerListSkeleton';

const AllPhotographersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const photographersState = useSelector((state: RootState) => state.photographers);
  const [searchText, setSearchText] = useState('');
  const [failedImageIds, setFailedImageIds] = useState<Set<string | number>>(new Set());

  // pull to refresh
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getphotographersSearch(undefined));
  }, [dispatch]);

  const filteredResults = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const items = photographersState?.search?.items || [];
    if (!q) return items;
    return items.filter((p: any) => {
      const displayName = ((p?.full_name || p?.name || 'Unknown Photographer') as string).toLowerCase();
      const city = (p?.location?.city || '').toLowerCase();
      return displayName.includes(q) || city.includes(q);
    });
  }, [searchText, photographersState?.search?.items]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getphotographersSearch(undefined));
    setRefreshing(false);
  }

  const renderItem = ({ item }: { item: any }) => {
    const name = item?.full_name || 'Unknown Photographer';
    const imageUrl = item?.profile_image_url || (item?.portfolio?.[0]?.image_url || '');
    const rating = item?.average_rating || 0;
    const reviews = item?.total_reviews || 0;
    const city = item?.location?.city || 'Unknown';
    const services = Array.isArray(item?.services) ? item.services : [];
    const minPrice = services.length > 0 ? Math.min(...services.map((s: any) => Number(s?.base_price ?? 0))) : undefined;
    const id = item?.id ?? item?._id ?? name;
    const showPlaceholder = !imageUrl || failedImageIds.has(id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Main' as never, {
            screen: 'Home',
            params: {
              screen: 'PhotographerDetails',
              params: { photographerId: item?.id },
            },
          } as never)
        }
      >
        <Image
          source={showPlaceholder ? require('../assets/images/photographer_placeholder.jpg') : { uri: imageUrl }}
          style={styles.thumb}
          onError={() =>
            setFailedImageIds((prev) => {
              const next = new Set(prev);
              next.add(id);
              return next;
            })
          }
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Icon key={i} name="star" size={12} color={i <= Math.round(Number(rating)) ? '#FFA500' : '#FFD0BF'} />
            ))}
            <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
            <Text style={styles.reviewText}>({reviews} reviews)</Text>
          </View>
          <View style={styles.metaRow}>
            <Image source={imagePaths.Location} resizeMode='contain' style={styles.metaIcon} />
            <Text style={styles.locationText}>Available</Text>
          </View>
          {/* {minPrice !== undefined ? (
            <View style={styles.priceRow}>
              <Text style={styles.fromText}>From</Text>
              <Text style={styles.priceText}>₹{Number(minPrice).toLocaleString()}</Text>
              <Text style={styles.perSessionText}>Per session</Text>
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
          <Text style={styles.title}>All Photographers</Text>
          <Text style={styles.subtitle}>Browse and search photographers near you</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <TextInput
              style={styles.searchPlaceholder}
              placeholder="Search photographers..."
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

        {photographersState?.search?.loading ? (
          <PhotographerListSkeleton />
        ) : (
          <FlatList
            data={filteredResults}
            keyExtractor={(item: any, index: number) => String(item?.id ?? item?._id ?? index)}
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
  title: {
    fontSize: 22,
    ...typography.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
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
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
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
  },
  emptyTitle: {
    fontSize: 18,
    ...typography.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#EEE',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: {
    fontSize: 16,
    ...typography.bold,
    color: COLORS.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: { marginLeft: 4, fontSize: 13, color: COLORS.text.primary },
  reviewText: { marginLeft: 6, fontSize: 12, color: COLORS.text.secondary },
  locationText: { marginLeft: 6, fontSize: 12, color: COLORS.text.secondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaIcon: { width: 12, height: 12 },
  priceRow: { marginTop: 6 },
  fromText: { fontSize: 12, color: COLORS.text.secondary },
  priceText: { fontSize: 16, ...typography.bold, color: '#FF6B35' },
  perSessionText: { fontSize: 12, color: COLORS.text.secondary },
});

export default AllPhotographersScreen;