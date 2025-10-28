import { FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardFilterPopup from "./DashboardFilter";
import { useState } from "react";

export const DashboardComponent = () => {
    const filterOptions = ["Pending", "Confirmed", "Completed", "Cancelled"];
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const onFilterPress = () => {
        setShowFilter(!showFilter)
    }
    const bookingData = [
        {
            id: '1',
            bookingId: 'BMS001',
            date: '25-09-2024',
            name: 'Priya Sharma',
            studio: 'Studio Elite Mumbai',
            time: '2:00 PM - 6:00 PM',
            price: '10,000',
            status: 'Pending',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
        {
            id: '2',
            bookingId: 'BMS002',
            date: '25-09-2024',
            name: 'Priya Sharma',
            studio: 'Studio Elite Mumbai',
            time: '2:00 PM - 6:00 PM',
            price: '8,000',
            status: 'Confirmed',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
        {
            id: '3',
            bookingId: 'BMS003',
            date: '25-09-2024',
            name: 'Priya Sharma',
            studio: 'Studio Elite Mumbai',
            time: '2:00 PM - 6:00 PM',
            price: '8,000',
            status: 'Completed',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
    ];

    const renderItem = ({ item }: any) => {
        let statusColor = '#FE9A55'; // default Pending orange
        if (item.status === 'Confirmed') statusColor = '#FFC107'; // yellow
        if (item.status === 'Completed') statusColor = '#0D6EFD'; // blue

        let statusTextColor = '#FFFFFF'; // default Pending orange
        if (item.status === 'Confirmed') statusTextColor = '#2F2F2F'; // yellow
        if (item.status === 'Completed') statusTextColor = '#FFFFFF'; // blue

        return (
            <View style={styles.card}>
                {/* Status badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusTextColor }]}>{item.status}</Text>
                </View>

                <View style={styles.cardContent}>
                    <Image source={{ uri: item.image }} resizeMode="cover" style={styles.image} />

                    <View style={styles.info}>
                        <Text style={styles.bookingId}>
                            Booking ID: {item.bookingId}
                        </Text>
                        <Text style={styles.date}>{item.date}</Text>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.studio}>{item.studio}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                        <Text style={styles.price}>₹{item.price}</Text>

                        {/* Action Buttons */}
                        <View style={styles.actions}>
                            {item.status === 'Pending' && (
                                <TouchableOpacity style={styles.contactBtn}>
                                    <Text style={styles.contactBtnText}>Contact</Text>
                                </TouchableOpacity>
                            )}
                            {item.status === 'Confirmed' && (
                                <>
                                    <TouchableOpacity style={styles.declineBtn}>
                                        <Text style={styles.declineText}>Decline</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.acceptBtn}>
                                        <Text style={styles.acceptText}>Accept</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );

    }
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Dashboard views one */}
            <View style={styles.statusViewsOutline}>
                <View style={styles.bgImageCard}>
                    <Icon name="storefront" size={32} color="#2F2F2F" />
                    <View>
                        <Text style={styles.bgCountText}>3</Text>
                        <Text style={styles.bgText}>Active Studios</Text>
                    </View>
                </View>

                <View style={styles.bgImageCard}>
                    <Icon name="camera-alt" size={32} color="#2F2F2F" />
                    <View>
                        <Text style={styles.bgCountText}>156</Text>
                        <Text style={styles.bgText}>Total Bookings</Text>
                    </View>
                </View>
            </View>
            {/* Dashboard views two */}
            <View style={styles.statusViewsOutline}>
                <View style={styles.bgImageCard}>
                    <Icon name="account-balance-wallet" size={32} color="#2F2F2F" />
                    <View>
                        <Text style={styles.bgCountText}>₹425,000</Text>
                        <Text style={styles.bgText}>Total Earnings</Text>
                    </View>
                </View>

                <View style={styles.bgImageCard}>
                    <Icon name="pending-actions" size={32} color="#2F2F2F" />
                    <View>
                        <Text style={styles.bgCountText}>8</Text>
                        <Text style={styles.bgText}>Pending Requests</Text>
                    </View>
                </View>
            </View>
            {/* Menu renders here*/}

            <View style={styles.header}>
                <Text style={styles.title}>Recent Booking Requests</Text>
                <TouchableOpacity onPress={onFilterPress} style={styles.addButton}>
                    <Icon name="filter-list" size={24} color="#1B4332" />
                    <Text style={styles.addButtonText}>Filter</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={bookingData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ marginTop: 25, marginBottom: 150 }}
            />
            <DashboardFilterPopup
                visible={showFilter}
                options={filterOptions}
                selectedValue={selectedFilter}
                onSelect={(val) => setSelectedFilter(val)}
                onApply={(val) => setSelectedFilter(val)}
                onClear={() => setSelectedFilter(null)}
                onClose={() => setShowFilter(false)}
            />

        </ScrollView>
    )
};

const styles = StyleSheet.create({
    statusViewsOutline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    title: {
        color: '#101010',
        fontWeight: '700',
        fontSize: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#1B4332',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 4,
        marginRight: 10
    },

    bgImageCard: {
        flex: 0.48, // Each card takes roughly half the row
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        overflow: 'hidden',
        height: 80,
        backgroundColor: '#F2F5EC'
    },
    bgText: {
        fontSize: 10,
        color: '#2F2F2F',
        fontWeight: '500',
    },
    bgCountText: {
        fontSize: 16,
        color: '#FF6B35',
        fontWeight: '700',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000040',
        marginBottom: 35,
        padding: 12,
        position: 'relative',
    },
    statusBadge: {
        position: 'absolute',
        top: -24,
        right: 20,
        zIndex: -10,
        borderTopRightRadius: 4,
        borderTopLeftRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        flexDirection: 'row',
    },
    image: {
        width: 100,
        height: 140,
        borderRadius: 8,
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'space-between',
    },
    bookingId: {
        fontSize: 12,
        color: '#2F2F2F',
    },
    date: {
        fontSize: 12,
        color: '#2F2F2F',
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        color: '#034833',
        marginTop: 2,
    },
    studio: {
        fontSize: 12,
        color: '#2F2F2F',
    },
    time: {
        fontSize: 12,
        color: '#2F2F2F',
        marginTop: 2,
    },
    price: {
        fontSize: 16,
        color: '#FF6B35',
        fontWeight: '600',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    contactBtn: {
        borderWidth: 1,
        borderColor: '#007BFF',
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 6,
    },
    contactBtnText: {
        color: '#007BFF',
        fontSize: 12,
        fontWeight: '600',
    },
    declineBtn: {
        borderWidth: 1,
        borderColor: '#034833',
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 8,
    },
    declineText: {
        color: '#034833',
        fontSize: 12,
        fontWeight: '600',
    },
    acceptBtn: {
        backgroundColor: '#034833',
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 6,
    },
    acceptText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
})