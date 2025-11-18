import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";

const TimeSlotSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
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
    <View>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <View key={i} style={styles.dayRow}>
          {/* Checkbox Placeholder */}
          <View style={[styles.timeRow, { marginTop: 10 }]}>
            <Animated.View style={[styles.checkbox, { opacity }]} />

            {/* Day Name Placeholder */}
            <Animated.View style={[styles.dayText, { opacity }]} />
          </View>

          {/* Time Buttons Row */}
          <View style={styles.timeRow}>
            <Animated.View style={[styles.timeBox, { opacity }]} />
            <Animated.View style={[styles.timeBox, { opacity }]} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dayRow: {
    marginTop: 15,
    paddingVertical: 5,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },

  dayText: {
    width: 120,
    height: 15,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginLeft: 8,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: 'center',
    marginTop: 12,
  },

  timeBox: {
    flex: 1,
    height: 45,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    marginRight: 10,
  },
});

export default TimeSlotSkeleton;
