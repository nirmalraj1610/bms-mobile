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
const STUDIO_CARD_WIDTH = width * 0.75;

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hello! 👋</Text>
              <Text style={styles.headerTitle}>Find Your Perfect Studio</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Icon name="person" size={24} color={COLORS.background} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.searchBar} onPress={navigateToSearch}>
            <Icon name="search" size={20} color={COLORS.text.secondary} />
            <Text style={styles.searchPlaceholder}>Search studios, cities...</Text>
            <Icon name="tune" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Location</Text>
          <FlatList
            data={CITIES.slice(0, 4)}
            renderItem={renderCityCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityList}
          />
        </View>

        {/* Featured Studios */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Studios</Text>
            <TouchableOpacity onPress={navigateToBrowse}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockStudios}
            renderItem={renderStudioCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.studioList}
          />
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Book My Shoot?</Text>
          <FlatList
            data={FEATURES}
            renderItem={renderFeatureCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.featuresGrid}
          />
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