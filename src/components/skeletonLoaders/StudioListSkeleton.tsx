import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { COLORS } from '../../constants';

const { width } = Dimensions.get('window');

const StudioListSkeleton = () => {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
    });

    const dummyArray = Array.from({ length: 4 }); // show 6 placeholder cards

    const renderSkeletonCard = () => (
        <View style={styles.card}>
            <Animated.View style={[styles.thumb, { opacity }]} />

            <View style={styles.cardBody}>
                {/* Title Row */}
                <Animated.View style={[styles.line, { width: '70%', opacity }]} />

                {/* Rating row */}
                <Animated.View style={[styles.smallLine, { width: '40%', opacity }]} />

                {/* Location */}
                <Animated.View style={[styles.smallLine, { width: '50%', opacity }]} />

                {/* Square ft */}
                <Animated.View style={[styles.smallLine, { width: '45%', opacity }]} />
            </View>
        </View>
    );

    return (
        <FlatList
            data={dummyArray}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderSkeletonCard}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 200 }}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.bg2,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#F0F2F5',
    },
    thumb: {
        width: 104,
        height: 104,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: '#E0E0E0',
    },
    cardBody: {
        flex: 1,
        justifyContent: 'center',
    },
    line: {
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E0E0E0',
        marginBottom: 12,
    },
    smallLine: {
        height: 10,
        borderRadius: 6,
        backgroundColor: '#E0E0E0',
        marginBottom: 8,
    },
});

export default StudioListSkeleton;
