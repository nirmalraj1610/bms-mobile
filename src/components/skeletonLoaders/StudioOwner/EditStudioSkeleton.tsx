import React, { useRef, useEffect } from "react";
import { Animated, View, StyleSheet, Dimensions, ScrollView } from "react-native";
const { width } = Dimensions.get("window");

const EditStudioSkeleton = () => {
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
            {/* Tabs Placeholder */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabRow}
            >
                <Animated.View style={[styles.tab, { opacity }]} />
                <Animated.View style={[styles.tab, { opacity }]} />
                <Animated.View style={[styles.tab, { opacity }]} />
                <Animated.View style={[styles.tab, { opacity }]} />
                <Animated.View style={[styles.tab, { opacity }]} />
            </ScrollView>

            {/* Info Fields */}
            <View style={styles.infoContainer}>
                {[...Array(10)].map((_, index) => (
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
        paddingBottom: 180
    },
    line: {
        height: 14,
        backgroundColor: "#E0E0E0",
        borderRadius: 6,
        marginLeft: 5
    },
    tabRow: {
        flexDirection: "row",
        paddingHorizontal: 10,
        marginTop: 20,
    },
    tab: {
        width: 120,
        height: 35,
        marginRight: 10,
        borderRadius: 12,
        backgroundColor: "#E0E0E0",
    },
    infoContainer: {
        marginTop: 30,
        width: '100%'
    },
    infoField: {
        height: 40,
        borderRadius: 10,
        backgroundColor: "#E0E0E0",
        marginTop: 8,
    },
});

export default EditStudioSkeleton;
