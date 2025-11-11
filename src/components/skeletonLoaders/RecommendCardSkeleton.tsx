import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants';

const { width } = Dimensions.get('window');
const RECOMMEND_CARD_WIDTH = width * 0.5;

const RecommendCardSkeleton = () => {
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
    <View style={[styles.card]}>
      <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
      <View style={styles.infoSection}>
        <Animated.View style={[styles.textLine, { width: '70%', opacity }]} />
        <Animated.View style={[styles.textLine, { width: '50%', opacity }]} />
        <Animated.View style={[styles.textLine, { width: '30%', opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
    margin: 5
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#E0E0E0',
  },
  infoSection: {
    padding: 12,
  },
  textLine: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginTop: 8,
  },
});

export default RecommendCardSkeleton;
