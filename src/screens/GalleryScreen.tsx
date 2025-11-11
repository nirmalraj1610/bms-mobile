import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2; // 2 columns with padding

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  isFavorite: boolean;
}

const mockGalleryData: GalleryItem[] = [
  {
    id: '1',
    title: 'Studio Portrait Session',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Professional Headshots',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Fashion Photography',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
    isFavorite: false,
  },
  {
    id: '4',
    title: 'Product Photography',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Wedding Photography',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
    isFavorite: false,
  },
  {
    id: '6',
    title: 'Event Photography',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
    isFavorite: false,
  },
  {
    id: '7',
    title: 'Corporate Photography',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    isFavorite: false,
  },
  {
    id: '8',
    title: 'Lifestyle Photography',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    isFavorite: false,
  },
];

const GalleryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderGalleryItem = (item: GalleryItem) => (
    <TouchableOpacity key={item.id} style={styles.galleryItem}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.galleryImage} />
        {/* <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Icon 
            name={favorites.includes(item.id) ? 'favorite' : 'favorite-border'} 
            size={20} 
            color={favorites.includes(item.id) ? COLORS.favColor : '#fff'} 
          />
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );

  // Build data: prefer images from route params, fallback to mock
  const routeImages: string[] | undefined = route?.params?.images;
  const galleryData: GalleryItem[] = (routeImages && routeImages.length > 0)
    ? routeImages.map((url, idx) => ({ id: String(idx), title: '', image: url, isFavorite: false }))
    : mockGalleryData;

  // Create rows of 2 items each
  const createRows = () => {
    const rows = [];
    for (let i = 0; i < galleryData.length; i += 2) {
      const rowItems = galleryData.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.galleryRow}>
          {rowItems.map(item => renderGalleryItem(item))}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HeaderBar title={route?.params?.title || 'Our Gallery'} onBack={() => navigation.goBack()} />
      </View>

      {/* Gallery Grid */}
      <ScrollView 
        style={styles.galleryContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.galleryGrid}
      >
        {createRows()}
      </ScrollView>
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
  galleryContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  galleryGrid: {
    paddingBottom: 20,
  },
  galleryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  galleryItem: {
    width: itemWidth,
    backgroundColor: COLORS.bg2,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  imageContainer: {
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GalleryScreen;