import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.46; // same as your 48% style
const CARD_HEIGHT = 250;

const MyStudiosSkeleton = () => {
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

                <View style={styles.infoContainer}>
                    <Animated.View style={[styles.line, { width: "70%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "60%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "50%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "40%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "60%", opacity }]} />
                    <Animated.View style={[styles.line, { width: "50%", opacity }]} />
                </View>

                <View style={styles.actionsContainer}>
                    <Animated.View style={[styles.buttonPlaceholder, { opacity }]} />
                    <Animated.View style={[styles.buttonPlaceholder, { opacity }]} />
                </View>
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
        borderWidth: 1,
        borderColor: "#00000026",
        overflow: "hidden",
        paddingBottom: 10,
    },
    imagePlaceholder: {
        width: "100%",
        height: 120,
        backgroundColor: "#E0E0E0",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    infoContainer: {
        padding: 10,
    },
    line: {
        height: 10,
        backgroundColor: "#E0E0E0",
        borderRadius: 5,
        marginVertical: 6,
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginTop: 5,
    },
    buttonPlaceholder: {
        width: "48%",
        height: 30,
        borderRadius: 6,
        backgroundColor: "#E0E0E0",
    },
});

export default MyStudiosSkeleton;
