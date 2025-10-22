import React, { useRef, useState } from 'react';
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
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, CITIES, FEATURES } from '../constants';
import { mockStudios } from '../utils/mockData';
import { Studio, Feature } from '../types';
import { ImageSourcePropType } from 'react-native';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

const { width } = Dimensions.get('window');
const STUDIO_CARD_WIDTH = width * 0.4;
const WHY_CHOOSE_CARD_WIDTH = width * 0.9;
const RECOMMEND_CARD_WIDTH = width * 0.5;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const width = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const navigateToStudioDetails = (studioId: string) => {
    navigation.navigate('StudioDetails', { studioId });
  };

  const navigateToSearch = () => {
    navigation.navigate('Search');
  };

  const navigateToBrowse = () => {
    navigation.navigate('Browse');
  };

  const tabImages = {
    camera: require('../assets/images/potrait.png'),
    fashion: require('../assets/images/fashion.png'),
    product: require('../assets/images/product.png'),
    wedding: require('../assets/images/wedding.png'),
    // add more if needed
  };

    const whyChooseImages = {
    camera: require('../assets/images/camera.png'),
    // add more if needed
  };

  type Category = {
    id: string;
    label: string;
    image: ImageSourcePropType;
  };

    type whyChoose = {
    id: string;
    image: ImageSourcePropType;
    title: string;
    desc: string;
  };

  const categories: Category[] = [
    { id: 'portrait', label: 'Portrait', image: tabImages.camera },
    { id: 'fashion', label: 'Fashion', image: tabImages.fashion },
    { id: 'product', label: 'Product', image: tabImages.product },
    { id: 'wedding', label: 'Wedding', image: tabImages.wedding },
  ];

    const whyChooseData: whyChoose[] = [
    { id: '1', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
    { id: '2', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
    { id: '3', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
    { id: '4', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
  ];

  const renderCategoryChip = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryChip} onPress={navigateToBrowse}>
      <Image resizeMode='contain' source={item.image} style={{ tintColor: COLORS.text.primary, height: 20, width: 20 }} />
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
        {[1, 2, 3, 4, 5].map((i) => (
          // <Icon
          //   key={i}
          //   name="star"
          //   size={12}
          //   color={i <= rounded ? COLORS.secondary : '#C9CDD2'}
          // />
          <Image
            source={
              i <= rounded
                ? require('../assets/images/rating_selected.png')
                : require('../assets/images/rating_notSelected.png')
            }
            style={styles.ratingStar}
          />
        ))}
      </View>
    );
  };

  const renderRecommendCard = ({ item }: { item: Studio }) => (
    <TouchableOpacity style={styles.recommendCard} onPress={() => navigateToStudioDetails(item.id)}>
      <View style={styles.recommendImageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.recommendImage} />
        
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Icon name="star" size={16} color="#FF7441" />
          <Text style={styles.ratingBadgeText}>{item.rating}</Text>
        </View>
        
        {/* Heart Icon */}
        <TouchableOpacity style={styles.heartIcon}>
          <Icon name="favorite-border" size={14} color="#FF6D38" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.recommendInfo}>
        <View style={styles.recommendBottomRow}>
          <View style={styles.recommendLeftInfo}>
               <Text style={styles.recommendName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.recommendMeta}>
              
              <Icon name="place" size={12} color={COLORS.text.secondary} />
              <Text style={styles.recommendLocation} numberOfLines={1}>{item.location.city}</Text>
            </View>
            <Text style={styles.recommendSqft}>800 sq ft</Text>
          </View>
          
          <View style={styles.recommendPriceRow}>
            <Text style={styles.recommendFromText}>From</Text>
            <Text style={styles.recommendPrice}>₹{item.pricing.hourlyRate.toLocaleString()}</Text>
            <Text style={styles.recommendPerHour}>Per hour</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
// Replace the renderRated function with this:
const renderRated = ({ item }: { item: Studio }) => (
  <TouchableOpacity 
    style={styles.ratedCard} 
    onPress={() => navigateToStudioDetails(item.id)}
  >
    <View style={styles.ratedImageContainer}>
      <Image source={{ uri: item.images[0] }} style={styles.ratedImage} />
      <TouchableOpacity style={styles.ratedHeartIcon}>
        <Icon name="favorite-border" size={16} color="#FF6D38" />
      </TouchableOpacity>
    </View>
    
    <View style={styles.ratedInfo}>
      <View style={styles.ratedTopRow}>
        {renderStars(item.rating)}
      </View>
      
      <Text style={styles.ratedName} numberOfLines={1}>{item.name}</Text>
      
      <View style={styles.ratedLocationRow}>
        <Icon name="place" size={14} color={COLORS.text.secondary} />
        <Text style={styles.ratedLocation} numberOfLines={1}>{item.location.city}</Text>
      </View>
      
      <View style={styles.ratedBottomRow}>
        <Text style={styles.ratedFromText}>From <Text style={styles.ratedPrice}>₹{item.pricing.hourlyRate.toLocaleString()}</Text> <Text style={styles.ratedPerHour}>Per hour</Text></Text>
      </View>
    </View>
  </TouchableOpacity>
);


  const renderWhuChooseCard =({item, index}: {item: whyChoose, index: number }) => (
    <View style={{marginLeft: index == 0 ? 10 : 5, marginRight: whyChooseData.length - 1 ? 10 : 5}}>
    <View key={item.id} style={styles.whyCard}>
            <View style={styles.whyIconCircle}>
              <Image 
                source={item.image} 
                style={styles.whyIconImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.whyTextContent}>
              <Text style={styles.whyTitle}>{item.title}</Text>
              <Text style={styles.whySubtitle}>
                {item.desc}
              </Text>
            </View>
          </View>
          </View>
  )

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
        <View style={styles.headerOutline}>
          {/* Top Row: Logo, Greeting, Location, Notification */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../assets/images/logoo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.welcomeText}>
                Hello<Text style={styles.userName}> Jana !</Text>
              </Text>
            </View>
            
            <View style={styles.headerRight}>
              <View style={styles.rightColumn}>
                 <TouchableOpacity style={styles.notificationIconOutline}>
                  <Image
                    source={require('../assets/images/notification.png')}
                    style={styles.notificationIcon}
                    resizeMode='cover'
                  />
                </TouchableOpacity>
                <View style={styles.locationContainer}>
                  <Text style={styles.locationLabel}>Current Location</Text>
                  <View style={styles.locationRow}>
                    <Icon name="location-on" size={16} color="#FF6B35" />
                    <Text style={styles.locationText}>Chennai</Text>
                  </View>
                </View>
                
               
              </View>
            </View>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              {/* <Icon name="search" size={18} color={COLORS.text.secondary} /> */}
              <TextInput
                style={styles.searchPlaceholder}
                placeholder="Search Studios..."
                placeholderTextColor={COLORS.text.secondary}
                value={query}
                onChangeText={setQuery}
              />
              <TouchableOpacity style={styles.searchIconButton} onPress={navigateToSearch}>
                <Icon name="search" size={20} color={COLORS.background} />
              </TouchableOpacity>
            </View>
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
            <Text style={styles.sectionTitle}>Top Rated Photographers</Text>
            {/* <TouchableOpacity onPress={navigateToBrowse}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity> */}
          </View>
          <FlatList
            data={mockStudios}
            renderItem={renderRated}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.studioList}
          />
        </View>

        {/* Why Choose Book My Shoot? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Book My Shoot?</Text>
          <FlatList
            data={whyChooseData}
            ref={flatListRef}
            renderItem={renderWhuChooseCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.studioList}
            onMomentumScrollEnd={handleScrollEnd}
          />
          <View style={styles.dotsRow}>
            {whyChooseData.map((item, index)  => (
              <View style={currentIndex == index ? styles.dotActive : styles.dot} />              
            ))}
          </View>
        </View>

        {/* CTA Section */}
        {/* <View style={styles.ctaSection}>
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
        </View> */}
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
  section: {
    marginTop: 25,
    paddingHorizontal: 10,
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
    alignSelf:'center',
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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
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
    paddingBottom: 5,
  },
  recommendCard: {
    width: RECOMMEND_CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
    
  },
  recommendImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  recommendImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFFFFF99',
    borderRadius: 12,
    paddingHorizontal:4,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadgeText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF99',
    borderRadius: 15,
    padding: 5,
  },
  recommendInfo: {
    padding: 12,
  },
  recommendName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  recommendBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recommendLeftInfo: {
    flex: 1,
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
  recommendSqft: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  recommendPriceRow: {
    alignItems: 'flex-end',
  },
  recommendFromText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  recommendPerHour: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
    textAlign: 'right',
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
    width: WHY_CHOOSE_CARD_WIDTH,
    backgroundColor: '#E8F5F0',
    borderRadius: 16,
    padding: 30,
    flexDirection: 'row',
    // alignItems: '',
    justifyContent: 'space-between',
    elevation: 1,
  },
  whyIconCircle: {
    // width: 60,
    // height: 60,
    borderRadius: 28,
    // backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  whyIconImage: {
    width: 80,
    height: 80,
    // tintColor: COLORS.background,
  },
  whyTextContent: {
    flex: 1,
    marginLeft: 45,
    width: '40%',
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
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: '#D9D9D9',
  },
  dotActive: {
    width: 16,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: '#525050',
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
  headerOutline: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: 10,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  rightColumn: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  headerLogo: {
    height: 50,
    width: 64,
    marginRight: 12,
  },
  welcomeText: {
    fontWeight: '600',
    fontSize: 18,
    color: COLORS.text.primary,
  },
  userName: {
    color: '#FF6B35'
  },
  locationContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 4,
  },
  notificationIcon: {
    height: 20,
    width: 20,
    tintColor: '#363636',
  },
  notificationIconOutline: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#034833',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    // backgroundColor: COLORS.background,
  },
  searchContainer: {
    marginTop: 20,
    marginHorizontal: 4,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
  },
  searchPlaceholder: {
    flex: 1,
    // marginLeft: 8,
    paddingLeft: 16,
    fontSize: 14,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    color: COLORS.text.secondary,
    backgroundColor:'white',
    borderWidth: 1,
    borderColor: COLORS.bg,
  },
  searchIconButton: {
    width: 60,
    height: 43,
    // borderRadius: 20,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 8,
    

  },
  // ratingStar: {
  //   height: 9,
  //   width: 9
  // }
  // Update these existing styles:
ratingStar: {
  height: 12,
  width: 12,
  marginHorizontal: 1,
},

// Add these new styles for the Top Rated section:
ratedCard: {
  width: width * 0.8,
  backgroundColor: COLORS.background,
  borderRadius: 12,
  marginRight: 15,
  elevation: 2,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  overflow: 'hidden',
  flexDirection: 'row',
  padding: 12,
},
ratedImageContainer: {
  position: 'relative',
  width: 150,
  height: 120,
  borderRadius: 8,
  overflow: 'hidden',
},
ratedImage: {
  width: '100%',
  height: '100%',
},
ratedHeartIcon: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: '#FFFFFF99',
  borderRadius: 15,
  padding: 5,
},
ratedInfo: {
  flex: 1,
  marginLeft: 12,
  justifyContent: 'space-between',
},
ratedTopRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
},
ratedName: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.text.primary,
  // marginTop: 4,
  
},
ratedLocationRow: {
  flexDirection: 'row',
  alignItems: 'center',
  // marginTop: 4,
  marginBottom: 15,
},
ratedLocation: {
  fontSize: 13,
  color: COLORS.text.secondary,
  marginLeft: 4,
},
ratedBottomRow: {
  marginTop: 8,
},
ratedFromText: {
  fontSize: 13,
  color: COLORS.text.secondary,
},
ratedPrice: {
  fontSize: 16,
  fontWeight: '700',
  color: '#FF6B35',
},
ratedPerHour: {
  fontSize: 13,
  color: COLORS.text.secondary,
},

});

export default HomeScreen;