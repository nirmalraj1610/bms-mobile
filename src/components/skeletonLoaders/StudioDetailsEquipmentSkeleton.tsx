import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const StudioDetailsEquipmentSkeleton = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.equipCard}>
      <Animated.View style={[styles.equipThumb, { opacity }]} />
      <View style={styles.equipContent}>
        <Animated.View style={[styles.skelLine, { width: '60%', opacity }]} />
        <Animated.View style={[styles.skelLine, { width: '40%', opacity, marginTop: 8 }]} />
        <Animated.View style={[styles.skelLine, { width: '80%', opacity, marginTop: 8 }]} />
        <Animated.View style={[styles.skelSmallBox, { opacity, marginTop: 12 }]} />
      </View>
    </View>
  );
};

export default StudioDetailsEquipmentSkeleton;

const styles = StyleSheet.create({
  equipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFF1F4',
    padding: 10,
    marginBottom: 10,
  },
  equipThumb: {
    width: 100,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#E9ECEF',
    marginRight: 12,
  },
  equipContent: {
    flex: 1,
    justifyContent: 'center',
  },
  skelLine: {
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
  },
  skelSmallBox: {
    width: 100,
    height: 20,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
});
