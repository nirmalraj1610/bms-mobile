import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, ScrollView, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const MyStudiosSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.cardContainer}>
          {/* Status Badge */}
          <Animated.View style={[styles.statusBadge, { opacity }]} />

          <View style={styles.card}>
            {/* Studio Image */}
            <Animated.View style={[styles.imagePlaceholder, { opacity }]} />

            {/* Rating Badge */}
            <Animated.View style={[styles.ratingBadge, { opacity }]} />

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Animated.View style={[styles.titleLine, { opacity }]} />
              <Animated.View style={[styles.smallLine, { width: "80%", opacity }]} />

              {/* Location & Pricing Section */}
              <View style={styles.row}>
                <View style={{ width: "48%" }}>
                  <Animated.View style={[styles.smallLine, { width: "70%", opacity }]} />
                  <Animated.View style={[styles.smallLine, { width: "60%", opacity }]} />
                </View>
                <View style={{ width: "48%" }}>
                  <Animated.View style={[styles.smallLine, { width: "80%", opacity }]} />
                  <Animated.View style={[styles.smallLine, { width: "70%", opacity }]} />
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.row}>
                <View style={{ width: "48%" }}>
                  <Animated.View style={[styles.smallLine, { width: "75%", opacity }]} />
                  <Animated.View style={[styles.smallLine, { width: "65%", opacity }]} />
                </View>
                <View style={[styles.actionsContainer]}>
                  <Animated.View style={[styles.actionBtn, { opacity }]} />
                  <Animated.View style={[styles.actionBtn, { opacity }]} />
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#00000020",
    paddingBottom: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: "#E0E0E0",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  ratingBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 60,
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
  },
  statusBadge: {
    width: 80,
    height: 24,
    right: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    alignSelf: "flex-end",
    marginBottom: -5,
    zIndex: 5,
  },
  infoContainer: {
    padding: 12,
  },
  titleLine: {
    width: "60%",
    height: 14,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  smallLine: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "48%",
    gap: 8,
  },
  actionBtn: {
    width: 60,
    height: 30,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
  },
});

export default MyStudiosSkeleton;
