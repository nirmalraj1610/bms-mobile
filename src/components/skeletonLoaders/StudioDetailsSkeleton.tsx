import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
const { width } = Dimensions.get('window');

const StudioDetailsSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <ScrollView contentContainerStyle={styles.container} >
      {/* Hero Image */}
      <Animated.View style={[styles.heroImage, { opacity }]} />

      {/* Title & Rating */}
      <View style={styles.titleBlock}>
        <Animated.View style={[styles.titleLine, { width: '60%', opacity }]} />
        <Animated.View style={[styles.ratingLine, { width: '40%', opacity }]} />
      </View>

      {/* Price */}
      <Animated.View style={[styles.priceLine, { opacity }]} />

      {/* Description */}
      <View style={styles.descBlock}>
        {[1, 2, 3, 4].map((_, idx) => (
          <Animated.View
            key={idx}
            style={[styles.descLine, { width: `${80 - idx * 10}%`, opacity }]}
          />
        ))}
      </View>

      {/* Policy section */}
      <View style={styles.policyBlock}>
        {[1, 2, 3].map((_, idx) => (
          <Animated.View
            key={idx}
            style={[styles.policyLine, { width: `${90 - idx * 15}%`, opacity }]}
          />
        ))}
      </View>

      {/* Link rows (Equipments, Amenities, Gallery) */}
      {[1, 2, 3].map((_, idx) => (
        <Animated.View key={idx} style={[styles.linkRow, { opacity }]} />
      ))}

      {/* Book Now Button */}
      <Animated.View style={[styles.bookBtn, { opacity }]} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  heroImage: {
    width: '100%',
    height: 360,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  titleBlock: {
    marginBottom: 10,
  },
  titleLine: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 10,
  },
  ratingLine: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
  },
  priceLine: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    width: '40%',
    marginTop: 12,
  },
  descBlock: {
    marginTop: 16,
  },
  descLine: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
  },
  policyBlock: {
    marginTop: 24,
  },
  policyLine: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 10,
  },
  linkRow: {
    marginTop: 16,
    height: 46,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  bookBtn: {
    marginTop: 24,
    height: 52,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
  },
});

export default StudioDetailsSkeleton;
