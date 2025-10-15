import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { mockFavoriteStudios } from '../utils/mockData';

const StudioDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const studioId: string | undefined = route?.params?.studioId;

  const studio = useMemo(() => {
    return mockFavoriteStudios.find((s) => s.id === studioId) || mockFavoriteStudios[0];
  }, [studioId]);

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={[styles.starGlyph, { color: i <= rounded ? COLORS.secondary : '#C9CDD2' }]}>★</Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Image */}
        <Image source={{ uri: studio.images[0] }} style={styles.heroImage} />

        {/* Chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}><Text style={styles.chipText}>Mon, 11th</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>2.00 PM</Text></View>
          <View style={styles.locationChip}>
            <Text style={styles.locationChipText}>{studio.owner.name}, {studio.location.city}</Text>
          </View>
        </View>

        {/* Title & Rating */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{studio.name}</Text>
          <View style={styles.ratingRow}>
            {renderStars(studio.rating)}
            <Text style={styles.ratingText}>{studio.rating.toFixed(1)}</Text>
            <Text style={styles.reviewText}>({studio.reviewCount} Reviews)</Text>
          </View>
        </View>

        {/* Pricing */}
        <Text style={styles.priceText}>Starting at ₹{studio.pricing.hourlyRate}/hour</Text>

        {/* Description */}
        <Text style={styles.description}>{studio.description}</Text>

        {/* Equipment Included */}
        <Text style={styles.sectionTitle}>Equipment Included</Text>
        <View style={styles.bullets}>
          {studio.equipment.slice(0, 3).map((e) => (
            <View key={e.id} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{e.name}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Gallery</Text>
          <Icon name="chevron-right" size={22} color={COLORS.text.secondary} />
        </View>
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Our works</Text>
          <Icon name="chevron-right" size={22} color={COLORS.text.secondary} />
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('Booking', { studioId: studio.id })}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EFF1F4',
  },
  chipText: {
    fontSize: 12,
    color: COLORS.text.primary,
  },
  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EFF1F4',
  },
  locationChipText: {
    fontSize: 12,
    color: COLORS.text.primary,
  },
  titleBlock: {
    marginTop: 12,
  },
  title: {
    fontSize: 22,
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
  priceText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  bullets: {
    marginTop: 8,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.secondary,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 13,
    color: COLORS.text.primary,
  },
  linkRow: {
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  bookBtn: {
    marginTop: 16,
    backgroundColor: COLORS.success,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  bookBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default StudioDetailsScreen;