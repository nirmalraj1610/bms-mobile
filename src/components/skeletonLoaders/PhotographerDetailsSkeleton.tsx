import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
const { width } = Dimensions.get('window');

const PhotographerDetailsSkeleton = () => {
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
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Image */}
            <Animated.View style={[styles.heroImage, { opacity }]} />

            {/* Photographer Info */}
            <View style={styles.infoBlock}>
                <Animated.View style={[styles.nameLine, { width: '60%', opacity }]} />
                <Animated.View style={[styles.ratingLine, { width: '40%', opacity }]} />
                <Animated.View style={[styles.priceLine, { width: '30%', opacity }]} />
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                {[1, 2, 3, 4].map((_, i) => (
                    <Animated.View key={i} style={[styles.tabLine, { opacity }]} />
                ))}
            </View>

            {/* Overview Section */}
            <View style={styles.overviewBlock}>
                {[1, 2, 3, 4].map((_, i) => (
                    <Animated.View
                        key={i}
                        style={[styles.textLine, { width: `${90 - i * 10}%`, opacity }]}
                    />
                ))}
            </View>

            {/* Services Section */}
            <View style={styles.serviceSection}>
                {[1, 2].map((_, i) => (
                    <View key={i} style={styles.serviceCard}>
                        <Animated.View style={[styles.serviceTitle, { opacity }]} />
                        <Animated.View style={[styles.serviceSubtitle, { opacity }]} />
                        <Animated.View style={[styles.servicePrice, { opacity }]} />
                    </View>
                ))}
            </View>

            {/* Reviews Section */}
            <View style={styles.reviewsSection}>
                {[1, 2, 3].map((_, i) => (
                    <View key={i} style={styles.reviewCard}>
                        <Animated.View style={[styles.reviewUser, { opacity }]} />
                        <Animated.View style={[styles.reviewLine, { width: '80%', opacity }]} />
                        <Animated.View style={[styles.reviewLine, { width: '70%', opacity }]} />
                    </View>
                ))}
            </View>

            {/* Book Now Button */}
            <Animated.View style={[styles.bookBtn, { opacity }]} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    heroImage: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        marginBottom: 16,
    },
    infoBlock: {
        marginBottom: 20,
    },
    nameLine: {
        height: 20,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginBottom: 8,
    },
    ratingLine: {
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginBottom: 8,
    },
    priceLine: {
        height: 14,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
    },
    tabRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    tabLine: {
        height: 32,
        width: width / 5.5,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
    },
    overviewBlock: {
        marginBottom: 20,
    },
    textLine: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginBottom: 8,
    },
    serviceSection: {
        marginBottom: 20,
    },
    serviceCard: {
        backgroundColor: '#F2F2F2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    serviceTitle: {
        height: 16,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginBottom: 8,
    },
    serviceSubtitle: {
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginBottom: 8,
    },
    servicePrice: {
        height: 14,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        width: '40%',
    },
    reviewsSection: {
        marginBottom: 20,
    },
    reviewCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    reviewUser: {
        height: 16,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginBottom: 6,
        width: '50%',
    },
    reviewLine: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginBottom: 6,
    },
    bookBtn: {
        height: 52,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        marginTop: 12,
    },
});

export default PhotographerDetailsSkeleton;
