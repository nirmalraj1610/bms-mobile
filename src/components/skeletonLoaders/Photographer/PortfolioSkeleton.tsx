import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const PortfolioSkeleton = () => {
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
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Left Image Placeholder */}
        <Animated.View style={[styles.imagePlaceholder, { opacity }]} />

        {/* Right Side Content */}
        <View style={styles.cardTextContainer}>
          <Animated.View style={[styles.smallLine, { width: '70%', opacity }]} />
          <Animated.View style={[styles.titleLine, { width: '60%', opacity }]} />
          <Animated.View style={[styles.textLine, { width: '80%', opacity }]} />
          <Animated.View style={[styles.textLine, { width: '50%', opacity }]} />
          <Animated.View style={[styles.textLine, { width: '60%', opacity }]} />

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Animated.View style={[styles.buttonPlaceholder, { opacity }]} />
            <Animated.View
              style={[
                styles.buttonPlaceholder,
                { opacity, backgroundColor: '#E6B8B8' },
              ]}
            />
          </View>
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
  imagePlaceholder: {
    width: 120,
    height: 140,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  smallLine: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },
  titleLine: {
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  textLine: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  buttonPlaceholder: {
    width: 80,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
});

export default PortfolioSkeleton;
