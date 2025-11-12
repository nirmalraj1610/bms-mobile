import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '../../constants';

const PhotographerListSkeleton = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const dummyArray = Array.from({ length: 6 }); // Show 6 skeleton cards

  const renderSkeletonCard = () => (
    <View style={styles.card}>
      <Animated.View style={[styles.thumb, { opacity }]} />

      <View style={styles.info}>
        {/* Name */}
        <Animated.View style={[styles.line, { width: '60%', opacity }]} />
        {/* Rating row */}
        <Animated.View style={[styles.smallLine, { width: '40%', opacity }]} />
        {/* Location */}
        <Animated.View style={[styles.smallLine, { width: '50%', opacity }]} />
        {/* Price or availability */}
        <Animated.View style={[styles.smallLine, { width: '35%', opacity }]} />
      </View>
    </View>
  );

  return (
    <FlatList
      data={dummyArray}
      keyExtractor={(_, i) => String(i)}
      renderItem={renderSkeletonCard}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 200 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  smallLine: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
});

export default PhotographerListSkeleton;
