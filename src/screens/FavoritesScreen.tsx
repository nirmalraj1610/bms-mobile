import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { mockFavoriteStudios } from '../utils/mockData';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  // Map favorites mock into list-friendly shape for this screen
  const items = useMemo(
    () =>
      mockFavoriteStudios.map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.images?.[0],
        location: { city: s.location.city },
        average_rating: s.rating,
        total_reviews: s.reviewCount,
      })),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
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
            <Icon name="favorite" size={22} color={COLORS.text.primary} />
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
        {/* <Text style={styles.cityText} numberOfLines={1}>{item.location?.city || 'Unknown City'}</Text> */}
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
        <TouchableOpacity style={styles.searchAction}>
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
            </View>
            <TouchableOpacity style={styles.searchAction}>
              <Icon name="search" size={20} color={COLORS.background} />
            </TouchableOpacity>
          </View>
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={filtered}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            ListHeaderComponent={<View style={{ height: 8 }} />}
            ListFooterComponent={<View style={{ height: 24 }} />}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 0,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  searchAction: {
    width: 48,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#2F3037',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
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
});

export default FavoritesScreen;