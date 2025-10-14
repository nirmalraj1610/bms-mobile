import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, CITIES, FEATURES } from '../constants';
import { mockStudios } from '../utils/mockData';
import { Studio, Feature } from '../types';

const { width } = Dimensions.get('window');
const STUDIO_CARD_WIDTH = width * 0.4;
const RECOMMEND_CARD_WIDTH = width * 0.4;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const navigateToStudioDetails = (studioId: string) => {
    navigation.navigate('StudioDetails', { studioId });
  };

  const navigateToSearch = () => {
    navigation.navigate('Search');
  };

  const navigateToBrowse = () => {
    navigation.navigate('Browse');
  };

  const categories = [
    { id: 'portrait', label: 'Portrait', icon: 'face' },
    { id: 'fashion', label: 'Fashion', icon: 'style' },
    { id: 'product', label: 'Product', icon: 'inventory' },
    { id: 'wedding', label: 'Wedding', icon: 'favorite' },
  ];

  const renderCategoryChip = ({ item }: { item: { id: string; label: string; icon: string } }) => (
    <TouchableOpacity style={styles.categoryChip} onPress={navigateToBrowse}>
      <Icon name={item.icon} size={18} color={COLORS.text.primary} />
      <Text style={styles.categoryText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderStudioCard = ({ item }: { item: Studio }) => (
    <TouchableOpacity
      style={styles.studioCard}
      onPress={() => navigateToStudioDetails(item.id)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.studioImage} />
      <View style={styles.studioInfo}>
        <View style={styles.studioHeader}>
          <Text style={styles.studioName}>{item.name}</Text>
          {item.verified && (
            <Icon name="verified" size={18} color={COLORS.accent} />
          )}
        </View>
        <Text style={styles.studioLocation}>
          {item.location.city}, {item.location.state}
        </Text>
        <Text style={styles.studioType}>{item.type.name}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color={COLORS.secondary} />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
        </View>
        <Text style={styles.price}>₹{item.pricing.hourlyRate}/hour</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFeatureCard = ({ item }: { item: Feature }) => (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{item.icon}</Text>
      <Text style={styles.featureTitle}>{item.title}</Text>
      <Text style={styles.featureDescription}>{item.description}</Text>
    </View>
  );

  const renderCityCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.cityCard} onPress={navigateToBrowse}>
      <Text style={styles.cityName}>{item.name}</Text>
      <Text style={styles.stateName}>{item.state}</Text>
    </TouchableOpacity>
  );

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return (
      <View style={styles.starsRow}>
        {[1,2,3,4,5].map((i) => (
          <Icon
            key={i}
            name="star"
            size={12}
            color={i <= rounded ? COLORS.secondary : '#C9CDD2'}
          />
        ))}
      </View>
    );
  };

  const renderRecommendCard = ({ item }: { item: Studio }) => (
    <TouchableOpacity style={styles.recommendCard} onPress={() => navigateToStudioDetails(item.id)}>
      <Image source={{ uri: item.images[0] }} style={styles.recommendImage} />
      <View style={styles.recommendInfo}>
        <Text style={styles.recommendName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.recommendStarsRow}>{renderStars(item.rating)}</View>
        <View style={styles.recommendMetaRow}>
        <View style={styles.recommendMeta}>
          <Icon name="place" size={14} color={COLORS.text.secondary} />
          <Text style={styles.recommendLocation} numberOfLines={1}>{item.location.city}</Text>
        </View>
        <Text style={styles.recommendPrice} numberOfLines={1} ellipsizeMode="tail">From ₹{item.pricing.hourlyRate}/hour</Text>
      </View>
      </View>
    </TouchableOpacity>
  );

  const renderGridCard = ({ item }: { item: Studio }) => (
    <TouchableOpacity style={styles.gridCard} onPress={() => navigateToStudioDetails(item.id)}>
      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.gridLocation} numberOfLines={1}>{item.location.city}</Text>
        <Text style={styles.gridPrice} numberOfLines={1}>From ₹{item.pricing.hourlyRate}/hour</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerLight}>
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              <Image
                source={require('../assets/images/logoo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.helloText}>
                Hello <Text style={styles.helloName}>Jana</Text> !
              </Text>
            </View>
            <TouchableOpacity style={styles.bellButton}>
              <Icon name="notifications-none" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <TouchableOpacity style={styles.searchInput} onPress={navigateToSearch}>
              <Icon name="search" size={20} color={COLORS.text.secondary} />
              <Text style={styles.searchPlaceholder}>Search...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchAction} onPress={navigateToSearch}>
              <Icon name="search" size={20} color={COLORS.background} />
            </TouchableOpacity>
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

        {/* Recommended for you */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
          </View>
          <FlatList
            data={mockStudios}
            renderItem={renderRecommendCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.studioList}
          />
        </View>

        {/* Browse Studios */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Studios</Text>
            {/* <TouchableOpacity onPress={navigateToBrowse}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity> */}
          </View>
          <FlatList
            data={mockStudios}
            renderItem={renderRecommendCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.studioList}
          />
        </View>

        {/* Why Choose Book My Shoot? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Book My Shoot?</Text>
          <View style={styles.whyCard}>
            <View style={styles.whyIconCircle}>
              <Icon name="photo-camera" size={26} color={COLORS.background} />
            </View>
            <Text style={styles.whyTitle}>Professional Studios</Text>
            <Text style={styles.whySubtitle}>
              Access to premium photography studios with professional equipment
            </Text>
          </View>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
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
  headerLight: {
    backgroundColor: '#E9F3DA',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 8,
  },
  helloText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  helloName: {
    color: COLORS.accent,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchAction: {
    width: 48,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#2F3037',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
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
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 15,
  },
  viewAllButton: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.text.primary,
    fontWeight: '600',
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
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  stateName: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  studioList: {
    paddingRight: 20,
  },
  recommendCard: {
    width: RECOMMEND_CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  recommendImage: {
    width: '100%',
    height: 120,
  },
  recommendInfo: {
    padding: 12,
  },
  recommendName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  recommendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recommendLocation: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
  recommendMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recommendBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recommendStarsRow: {
    marginTop: 6,
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
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  recommendPrice: {
    fontSize: 11,
    color: COLORS.text.secondary,
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
    fontWeight: '700',
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
    fontWeight: 'bold',
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
    fontWeight: '600',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 1,
  },
  whyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  whyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  whySubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: COLORS.text.primary,
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 8,
  },
});

export default HomeScreen;