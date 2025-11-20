import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export const AnimatedDot = ({ isActive = false }) => {
  const animated = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: isActive ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const width = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 18],
  });

  const scale = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.15],
  });

  const opacity = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const bg = animated.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D9D9D9", "#034833"],
  });

  return (
    <Animated.View
      style={{
        height: 5,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: bg,
        width,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};
