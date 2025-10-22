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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2; // 2 columns with padding

interface WorkItem {
  id: string;
  title: string;
  location: string;
  image: string;
  category: string;
  isFavorite: boolean;
}

const mockWorkData: WorkItem[] = [
  {
    id: '1',
    title: 'Mani & sharmila wedding',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    category: 'Wedding',
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Mani & sharmila wedding',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
    category: 'Wedding',
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Mani & sharmila wedding',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
    category: 'Wedding',
    isFavorite: false,
  },
  {
    id: '4',
    title: 'Mani & sharmila wedding',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
    category: 'Wedding',
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Mani & sharmila wedding',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
    category: 'Wedding',
    isFavorite: false,
  },
  {
    id: '6',
    title: 'Mani & sharmila wedding',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
    category: 'Wedding',
    isFavorite: false,
  },
  {
    id: '7',
    title: 'Corporate Event',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    category: 'Events',
    isFavorite: false,
  },
  {
    id: '8',
    title: 'Product Shoot',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    category: 'Products',
    isFavorite: false,
  },
];

const categories = ['All', 'Wedding', 'Events', 'Products'];

const OurWorksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredWorks = selectedCategory === 'All' 
    ? mockWorkData 
    : mockWorkData.filter(item => item.category === selectedCategory);

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderWorkItem = (item: WorkItem) => (
    <TouchableOpacity key={item.id} style={styles.workItem}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.workImage} />
       
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Icon 
            name={favorites.includes(item.id) ? 'favorite' : 'favorite-border'} 
            size={20} 
            color={favorites.includes(item.id) ? COLORS.favColor : '#FF6D38'} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.workInfo}>
        <Text style={styles.workTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.locationContainer}>
          <Icon name="place" size={12} color={COLORS.text.secondary} />
          <Text style={styles.workLocation}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>Our Works</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.activeCategoryTab
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.activeCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Works Grid */}
      <ScrollView style={styles.worksContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.worksGrid}>
          {filteredWorks.map((item, index) => {
            if (index % 2 === 0) {
              return (
                <View key={`row-${index}`} style={styles.workRow}>
                  {renderWorkItem(item)}
                  {filteredWorks[index + 1] && renderWorkItem(filteredWorks[index + 1])}
                </View>
              );
            }
            return null;
          })}
        </View>
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
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  categoryContainer: {
    paddingVertical: 15,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#F2F5EC',
  },
  activeCategoryTab: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.bg,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.bg,
  },
  activeCategoryText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  worksContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  worksGrid: {
    paddingBottom: 20,
  },
  workRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  workItem: {
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
  workImage: {
    width: '100%',
    height: 140,
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
  workInfo: {
    padding: 12,
  },
  workTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workLocation: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
});

export default OurWorksScreen;