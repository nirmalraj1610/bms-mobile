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

    // You can render multiple skeleton cards
    return (
        <ScrollView contentContainerStyle={styles.listContainer}>
            {[1, 2, 3].map((_, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.cardMainContent}>
                        {/* Left Section - Image and Price */}
                        <View style={styles.leftSection}>
                            <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
                            <Animated.View style={[styles.pricePlaceholder, { opacity }]} />
                        </View>

                        {/* Middle Section */}
                        <View style={styles.middleSection}>
                            <Animated.View style={[styles.line, { width: "70%", opacity }]} />
                            <Animated.View style={[styles.line, { width: "50%", opacity }]} />
                            <Animated.View style={[styles.line, { width: "60%", opacity }]} />
                            <Animated.View style={[styles.line, { width: "40%", opacity }]} />
                        </View>

                        {/* Right Section */}
                        <View style={styles.rightSection}>
                            <Animated.View style={[styles.statusBadge, { opacity }]} />
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#F0F2F5",
        marginBottom: 20,
        padding: 16,
        elevation: 2,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    cardMainContent: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    leftSection: {
        alignItems: "center",
        marginRight: 16,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: "#E0E0E0",
        marginBottom: 8,
    },
    pricePlaceholder: {
        width: 60,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#E0E0E0",
    },
    middleSection: {
        flex: 1,
        paddingRight: 12,
        justifyContent: "space-around",
    },
    line: {
        height: 10,
        backgroundColor: "#E0E0E0",
        borderRadius: 6,
        marginBottom: 10,
    },
    rightSection: {
        alignItems: "flex-end",
        justifyContent: "space-between",
        minHeight: 100,
    },
    statusBadge: {
        width: 70,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#E0E0E0",
        marginBottom: 10,
    },
    btnSmall: {
        width: 90,
        height: 26,
        borderRadius: 6,
        backgroundColor: "#E0E0E0",
        marginTop: 6,
    },
});

export default BookingsListSkeleton;
