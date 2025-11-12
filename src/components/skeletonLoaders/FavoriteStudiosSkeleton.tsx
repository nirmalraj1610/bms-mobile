import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ScrollView } from "react-native";

const FavoriteStudiosSkeleton = () => {
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

    // Render a few placeholders
    return (
        <ScrollView contentContainerStyle={styles.listContainer}>
            {[1, 2, 3, 4].map((_, index) => (
                <View key={index} style={styles.card}>
                    {/* Thumbnail */}
                    <Animated.View style={[styles.thumbPlaceholder, { opacity }]} />

                    {/* Card Body */}
                    <View style={styles.cardBody}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            <Animated.View style={[styles.titleLine, { opacity }]} />
                            <Animated.View style={[styles.favIcon, { opacity }]} />
                        </View>

                        {/* Ratings */}
                        <View style={styles.ratingRow}>
                            {[1, 2, 3].map((i) => (
                                <Animated.View key={i} style={[styles.star, { opacity }]} />
                            ))}
                            <Animated.View style={[styles.smallLine, { opacity, width: 40 }]} />
                        </View>

                        {/* Location */}
                        <View style={styles.locationRow}>
                            <Animated.View style={[styles.icon, { opacity }]} />
                            <Animated.View style={[styles.smallLine, { opacity, width: 80 }]} />
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingTop: 15,
        paddingBottom: 200
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F0F2F5",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    thumbPlaceholder: {
        width: 104,
        height: 104,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: "#E0E0E0",
    },
    cardBody: {
        flex: 1,
        justifyContent: "space-between",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleLine: {
        height: 14,
        width: "70%",
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
    },
    favIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#E0E0E0",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        gap: 4,
    },
    star: {
        width: 14,
        height: 14,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
    },
    smallLine: {
        height: 10,
        borderRadius: 6,
        backgroundColor: "#E0E0E0",
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    icon: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#E0E0E0",
        marginRight: 6,
    },
});

export default FavoriteStudiosSkeleton;
