import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const BookingsSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.card}>
      {/* Top Badge */}
      <Animated.View style={[styles.badge, { opacity }]} />

      {/* Main Row */}
      <View style={styles.row}>
        {/* Left image placeholder */}
        <Animated.View style={[styles.image, { opacity }]} />

        {/* Right info section */}
        <View style={styles.info}>
          <Animated.View style={[styles.line, { width: '40%', opacity }]} />
          <Animated.View style={[styles.line, { width: '70%', opacity }]} />
          <Animated.View style={[styles.line, { width: '60%', opacity }]} />
          <Animated.View style={[styles.line, { width: '50%', opacity }]} />
          <Animated.View style={[styles.line, { width: '30%', opacity }]} />
          <Animated.View style={[styles.priceLine, { opacity }]} />
        </View>
      </View>

      {/* Bottom action buttons */}
      <View style={styles.actions}>
        <Animated.View style={[styles.btn, { opacity }]} />
        <Animated.View style={[styles.btn, { opacity }]} />
        <Animated.View style={[styles.btn, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000020',
    marginBottom: 35,
    padding: 12,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 20,
    width: 70,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
  },
  image: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  line: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 10,
  },
  priceLine: {
    height: 14,
    width: '50%',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
  },
  btn: {
    width: 80,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 6,
  },
});

export default BookingsSkeleton;
