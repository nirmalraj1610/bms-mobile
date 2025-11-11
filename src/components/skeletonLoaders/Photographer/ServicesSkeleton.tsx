import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const ServicesSkeleton = () => {
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
    outputRange: [0.4, 1],
  });

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Left Image Placeholder */}
        <Animated.View style={[styles.cardImage, { opacity }]} />

        {/* Right Content */}
        <View style={styles.cardTextContainer}>
          <Animated.View style={[styles.textLine, { width: '60%', opacity }]} />
          <Animated.View style={[styles.textLine, { width: '80%', opacity }]} />
          <Animated.View style={[styles.textLine, { width: '50%', opacity }]} />
          <Animated.View style={[styles.textLine, { width: '70%', opacity }]} />
          <Animated.View style={[styles.textLine, { width: '60%', opacity }]} />
          <Animated.View style={[styles.textLine, { width: '40%', opacity }]} />
          <Animated.View style={[styles.priceLine, { opacity }]} />

          {/* Simulated Edit Button */}
          <Animated.View style={[styles.button, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00000026',
    padding: 10,
  },
  cardImage: {
    width: 130,
    height: 180,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00000026',
    backgroundColor: '#E0E0E0',
  },
  cardTextContainer: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  textLine: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginVertical: 6,
  },
  priceLine: {
    height: 14,
    width: '50%',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginTop: 10,
  },
  button: {
    width: 100,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
});

export default ServicesSkeleton;
