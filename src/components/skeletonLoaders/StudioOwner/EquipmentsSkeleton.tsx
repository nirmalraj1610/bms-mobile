import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const EquipmentsSkeleton = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
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
        );
        loop.start();
        return () => loop.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
    });

    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                {/* Image Placeholder */}
                <Animated.View style={[styles.imagePlaceholder, { opacity }]} />

                {/* Status Badge Placeholder */}
                <Animated.View
                    style={[styles.statusBadge, { opacity }]}
                />

                {/* Text Info Placeholder */}
                <View style={styles.infoContainer}>
                    <Animated.View style={[styles.line, { width: "80%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "50%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "60%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "40%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "55%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "45%", opacity }]} />
                </View>

                {/* Button Placeholder */}
                <Animated.View style={[styles.buttonPlaceholder, { opacity }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: "48%",
        marginBottom: 15,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#00000026",
        position: "relative",
    },
    imagePlaceholder: {
        width: "100%",
        height: 120,
        backgroundColor: "#E0E0E0",
    },
    statusBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 60,
        height: 20,
        backgroundColor: "#E0E0E0",
        borderRadius: 6,
    },
    infoContainer: {
        padding: 10,
    },
    line: {
        height: 10,
        backgroundColor: "#E0E0E0",
        borderRadius: 5,
        marginVertical: 5,
    },
    buttonPlaceholder: {
        height: 30,
        marginHorizontal: 10,
        marginBottom: 10,
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
    },
});

export default EquipmentsSkeleton;
