import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const TimeSlotSkeleton = ({ count = 5, height = 60, borderRadius = 12 }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loopAnimation = () => {
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start(loopAnimation);
        };
        loopAnimation();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
    });

    return (
        <View style={{ gap: 12 }}>
            {[...Array(count)].map((_, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.skeletonBox,
                        {
                            height,
                            borderRadius,
                            opacity,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    skeletonBox: {
        backgroundColor: '#E5E7EB',
        width: width - 32,
        alignSelf: 'center',
    },
});

export default TimeSlotSkeleton;
