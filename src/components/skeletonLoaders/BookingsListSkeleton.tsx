import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Dimensions, ScrollView } from "react-native";

const { width } = Dimensions.get("window");

const BookingsListSkeleton = () => {
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
    <ScrollView contentContainerStyle={styles.listContainer}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardMainContent}>
            {/* LEFT SECTION */}
            <View style={styles.leftSection}>
              <View style={styles.leftSectionInnerView}>
                <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
                <View style={styles.leftSectionTextOutline}>
                  <Animated.View style={[styles.pricePlaceholder, { opacity }]} />
                  <Animated.View style={[styles.studioNamePlaceholder, { opacity }]} />
                  <Animated.View style={[styles.studioNamePlaceholderShort, { opacity }]} />
                </View>
              </View>

              {/* LOCATION / DATE / TIME */}
              <Animated.View style={[styles.smallLine, { width: "60%", opacity }]} />
              <Animated.View style={[styles.smallLine, { width: "50%", opacity }]} />
              <Animated.View style={[styles.smallLine, { width: "45%", opacity }]} />
            </View>

            {/* RIGHT SECTION */}
            <View style={styles.rightSection}>
              <Animated.View style={[styles.statusBadgePlaceholder, { opacity }]} />
              <Animated.View style={[styles.btnSmall, { opacity }]} />
              <Animated.View style={[styles.btnSmall, { opacity }]} />
              <Animated.View style={[styles.btnSmall, { opacity }]} />
              <Animated.View style={[styles.btnSmall, { opacity }]} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F2F5",
    marginBottom: 16,
    padding: 14,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardMainContent: {
    flexDirection: "row",
    width: "100%",
  },
  leftSection: {
    width: "60%",
  },
  leftSectionInnerView: {
    flexDirection: "row",
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  leftSectionTextOutline: {
    justifyContent: "space-between",
  },
  pricePlaceholder: {
    width: 60,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  studioNamePlaceholder: {
    width: 90,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginBottom: 4,
  },
  studioNamePlaceholderShort: {
    width: 70,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  smallLine: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    marginTop: 6,
  },
  rightSection: {
    alignItems: "flex-end",
    width: "40%",
  },
  statusBadgePlaceholder: {
    width: "85%",
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 10,
  },
  btnSmall: {
    width: "85%",
    height: 26,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 10,
  },
});

export default BookingsListSkeleton;
