import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants';

const { width } = Dimensions.get('window');

const SelectEquipSkeleton = ({ count = 6 }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
            ])
        );
        loop.start();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
    });

    return (
        <View style={styles.container}>
            {[...Array(count)].map((_, i) => (
                <Animated.View key={i} style={[styles.card, { opacity }]}>
                    {/* Equipment Name */}
                    <View style={[styles.line, { width: '60%', height: 16 }]} />

                    {/* Equipment Type */}
                    <View style={[styles.line, { width: '40%', height: 12, marginTop: 8 }]} />

                    {/* Description */}
                    <View style={[styles.line, { width: '90%', height: 10, marginTop: 10 }]} />
                    <View style={[styles.line, { width: '75%', height: 10, marginTop: 6 }]} />

                    {/* Price */}
                    <View style={[styles.line, { width: '40%', height: 14, marginTop: 14 }]} />

                    {/* Available */}
                    <View style={[styles.line, { width: '50%', height: 12, marginTop: 8 }]} />

                    {/* Buttons Row */}
                    <View style={styles.actionRow}>
                        <View style={[styles.box, { width: 100, height: 36 }]} />
                        <View style={[styles.box, { width: 80, height: 36 }]} />
                    </View>
                </Animated.View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.black,
    },
    line: {
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
    },
    box: {
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
});

export default SelectEquipSkeleton;
