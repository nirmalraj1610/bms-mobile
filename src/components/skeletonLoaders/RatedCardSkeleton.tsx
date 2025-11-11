import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

const RatedCardSkeleton = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
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
        ).start();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
    });

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
            <View style={styles.infoContainer}>
                <Animated.View style={[styles.starPlaceholder, { opacity }]} />
                <Animated.View style={[styles.textLine, { width: '60%', opacity }]} />
                <Animated.View style={[styles.textLine, { width: '40%', opacity }]} />
                <Animated.View style={[styles.priceLine, { width: '50%', opacity }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        marginRight: 15,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        overflow: 'hidden',
        flexDirection: 'row',
        padding: 12,
        margin: 5,
    },
    imagePlaceholder: {
        width: 150,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    starPlaceholder: {
        height: 12,
        width: 80,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
    },
    textLine: {
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginTop: 10,
    },
    priceLine: {
        height: 14,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        marginTop: 14,
    },
});

export default RatedCardSkeleton;
