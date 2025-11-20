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
        <View style={styles.cardContainer}>
            {/* Status Badge */}
            <Animated.View style={[styles.statusBadge, { opacity }]} />

            <View style={styles.card}>
                {/* Studio Image */}
                <Animated.View style={[styles.imagePlaceholder, { opacity }]} />

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
                        <View style={{ width: "50%" }}>
                        </View>
                        <View style={[styles.actionsContainer]}>
                            <Animated.View style={[styles.actionBtn, { opacity }]} />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        marginVertical: 10,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#00000020",
        paddingBottom: 10,
        padding: 10
    },
    imagePlaceholder: {
        width: "100%",
        height: 140,
        backgroundColor: "#E0E0E0",
        borderRadius: 12
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
        paddingTop: 12,
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
        marginTop: 5,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        width: "50%",
    },
    actionBtn: {
        width: '100%',
        height: 30,
        backgroundColor: "#E0E0E0",
        borderRadius: 6,
    },
});

export default MyStudiosSkeleton;
