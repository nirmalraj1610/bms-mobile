import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';
import Ionicons from 'react-native-vector-icons/Ionicons';
import imagePaths from '../constants/imagePaths';

const { width, height } = Dimensions.get('window');
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const routeImages: string[] | undefined = route?.params?.images;
  const galleryData: GalleryItem[] = (routeImages && routeImages.length > 0)
    ? routeImages.map((url, idx) => ({ id: String(idx), title: '', image: url, isFavorite: false }))
    : mockGalleryData;

  const openImage = (index: number) => setSelectedIndex(index);
  const closeImage = () => setSelectedIndex(null);

  const showPrevImage = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const showNextImage = () => {
    if (selectedIndex !== null && selectedIndex < galleryData.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const renderGalleryItem = (item: GalleryItem, index: number) => (
    <TouchableOpacity key={item.id} style={styles.galleryItem} onPress={() => openImage(index)}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.galleryImage} />
      </View>
    </TouchableOpacity>
  );

  const createRows = () => {
    const rows = [];
    for (let i = 0; i < galleryData.length; i += 2) {
      const rowItems = galleryData.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.galleryRow}>
          {rowItems.map((item, idx) => renderGalleryItem(item, i + idx))}
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

      <ScrollView
        style={styles.galleryContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.galleryGrid}
      >
        {createRows()}
      </ScrollView>

      {/* Modal Image Viewer */}
      <Modal visible={selectedIndex !== null} transparent={true} animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={closeImage} // tap outside closes
        >
          <View style={styles.modalContent} pointerEvents="box-none">
            <TouchableWithoutFeedback>
              <Image
                source={{ uri: selectedIndex !== null ? galleryData[selectedIndex].image : undefined }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={closeImage}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Prev Button */}
            {selectedIndex !== null && selectedIndex > 0 && (
              <TouchableOpacity style={styles.leftArrow} onPress={showPrevImage}>
                <Ionicons name="chevron-back" size={32} color="#fff" />
              </TouchableOpacity>
            )}

            {/* Next Button */}
            {selectedIndex !== null && selectedIndex < galleryData.length - 1 && (
              <TouchableOpacity style={styles.rightArrow} onPress={showNextImage}>
                <Ionicons name="chevron-forward" size={32} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.7,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  leftArrow: {
    position: 'absolute',
    left: 20,
    top: '50%',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
  },
  rightArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 30,
  },
});

export default GalleryScreen;
