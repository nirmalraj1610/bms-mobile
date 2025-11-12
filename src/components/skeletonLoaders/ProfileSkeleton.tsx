import React, { useRef, useEffect } from "react";
import { Animated, View, StyleSheet, Dimensions, ScrollView } from "react-native";
const { width } = Dimensions.get("window");

const ProfileSkeleton = () => {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const opacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
    });

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Profile Image Circle */}
            <Animated.View style={[styles.avatar, { opacity }]} />

            {/* Name + Role */}
            <Animated.View style={[styles.line, { width: "40%", marginTop: 12, opacity }]} />
            <Animated.View style={[styles.line, { width: "25%", marginTop: 6, opacity }]} />

            {/* Logout Button */}
            <Animated.View style={[styles.button, { opacity, marginTop: 14 }]} />

            {/* Tabs Placeholder */}
            <View style={styles.tabRow}>
                <Animated.View style={[styles.tab, { opacity }]} />
                <Animated.View style={[styles.tab, { opacity }]} />
            </View>

            {/* Info Fields */}
            <View style={styles.infoContainer}>
                {[...Array(5)].map((_, index) => (
                    <View key={index} style={{ marginBottom: 16 }}>
                        <Animated.View style={[styles.line, { width: "30%", height: 10, opacity }]} />
                        <Animated.View style={[styles.infoField, { opacity }]} />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "#fff",
        paddingTop: 40,
        paddingBottom: 20
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#E0E0E0",
    },
    line: {
        height: 14,
        backgroundColor: "#E0E0E0",
        borderRadius: 6,
    },
    button: {
        width: 100,
        height: 35,
        borderRadius: 8,
        backgroundColor: "#E0E0E0",
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "80%",
        marginTop: 20,
    },
    tab: {
        width: "40%",
        height: 35,
        borderRadius: 20,
        backgroundColor: "#E0E0E0",
    },
    infoContainer: {
        marginTop: 30,
        width: width * 0.9,
    },
    infoField: {
        height: 40,
        borderRadius: 10,
        backgroundColor: "#E0E0E0",
        marginTop: 8,
    },
});

export default ProfileSkeleton;
