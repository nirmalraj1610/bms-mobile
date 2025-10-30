import { useState } from "react";
import { FlatList, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardFilterPopup from "./DashboardFilter";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export const BookingsComponent = () => {
    const filterOptions = ["Pending", "Confirmed", "Completed", "Cancelled"];
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [startdate, setStartdate] = useState(new Date());
    const [enddate, setEnddate] = useState(new Date());
    const onFilterPress = () => {
        setShowFilter(!showFilter)
    }
    const bookingData = [
        {
            id: '1',
            bookingId: 'BMS001',
            date: '25-09-2024',
            bookedOn: '25-08-2024, 1:04 PM',
            name: 'Priya Sharma',
            role: 'wedding (photographer)',
            time: '2:00 PM - 6:00 PM',
            price: '10,000',
            paid: '5000',
            due: '5000',
            phone: '+91 9876543210',
            status: 'Pending',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
        {
            id: '2',
            bookingId: 'BMS002',
            date: '25-09-2024',
            bookedOn: '20-08-2024, 8:04 PM',
            name: 'Priya Sharma',
            role: 'Birthday (photographer)',
            time: '2:00 PM - 6:00 PM',
            price: '8,000',
            paid: '6000',
            due: '2000',
            phone: '+91 9876543210',
            status: 'Confirmed',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
        {
            id: '3',
            bookingId: 'BMS003',
            date: '25-09-2024',
            bookedOn: '10-09-2024, 4:04 PM',
            name: 'Priya Sharma',
            role: 'Anniversary (photographer)',
            time: '2:00 PM - 6:00 PM',
            price: '8,000',
            paid: '8000',
            due: '0',
            phone: '+91 9876543210',
            status: 'Completed',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
    ];

    const studioList = [
        "Nature studio",
        "Mani studio",
        "Jothi studio",
        "AK studio",
    ]

    // ✅ Handle time selection
    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartdate(selectedDate);
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setEnddate(selectedDate);
        }
    };

    const renderItem = ({ item }: any) => {
        let statusColor = '#FE9A55'; // default Pending orange
        if (item.status === 'Confirmed') statusColor = '#FFC107'; // yellow
        if (item.status === 'Completed') statusColor = '#0D6EFD'; // blue
        if (item.status === 'Cancelled') statusColor = '#DC3545'; // red

        let statusTextColor = '#FFFFFF'; // default Pending orange
        if (item.status === 'Confirmed') statusTextColor = '#2F2F2F'; // yellow
        if (item.status === 'Completed') statusTextColor = '#FFFFFF'; // white
        if (item.status === 'Cancelled') statusTextColor = '#FFFFFF'; // white

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
                            Booking ID:<Text style={{fontWeight: '600'}}> {item.bookingId}</Text> 
                        </Text>
                        <Text style={styles.time}>Booked on :<Text style={{fontWeight: '600'}}> {item.bookedOn}</Text></Text>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.studio}>{item.role}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                        <Text style={styles.time}>{item.phone}</Text>
                        <Text style={styles.price}><Text style={{ ...styles.price, color: '#2F2F2F', fontSize: 14 }}>Total price : </Text>₹{item.price}</Text>
                        <View style={styles.paymentOutline}>
                            <Text style={styles.paid}><Text style={{ ...styles.paid, color: '#2F2F2F', fontSize: 12 }}>Paid : </Text>₹{item.paid}</Text>
                            <Text style={styles.due}><Text style={{ ...styles.due, color: '#2F2F2F', fontSize: 12 }}>Due : </Text>₹{item.due}</Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actions}>
                            {item.status === 'Pending' && (
                                <>
                            <TouchableOpacity style={styles.acceptBtn}>
                                <Text style={styles.acceptText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.declineBtn}>
                                <Text style={styles.declineText}>Reject</Text>
                            </TouchableOpacity>
                            </>
                            )}
                            {item.status === 'Confirmed' && (
                                <>
                            <TouchableOpacity style={styles.declineBtn}>
                                <Text style={styles.declineText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactBtn}>
                                <Text style={styles.contactBtnText}>Details</Text>
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
                        <Text style={styles.bgCountText}>5</Text>
                        <Text style={styles.bgText}>Total Bookings</Text>
                    </View>
                </View>

                <View style={styles.bgImageCard}>
                    <Icon name="camera-alt" size={32} color="#2F2F2F" />
                    <View>
                        <Text style={styles.bgCountText}>2</Text>
                        <Text style={styles.bgText}>Pending Approval</Text>
                    </View>
                </View>
            </View>
            {/* Dashboard views two */}
            <View style={styles.statusViewsOutline}>
                <View style={styles.bgImageCard}>
                    <Icon name="currency-rupee" size={32} color="#2F2F2F" />
                    <View>
                        <Text style={styles.bgCountText}>₹30,000</Text>
                        <Text style={styles.bgText}>Total Earnings</Text>
                    </View>
                </View>

                <View style={styles.bgImageCard}>
                    <Icon name="pending-actions" size={32} color="#2F2F2F" />
                    <View>
                        <Text style={styles.bgCountText}>3</Text>
                        <Text style={styles.bgText}>Pending Payments</Text>
                    </View>
                </View>
            </View>
            {/* Menu renders here*/}

            <View style={styles.header}>
                <Text style={styles.title}>Booking Requests & History</Text>
                <TouchableOpacity onPress={onFilterPress} style={styles.addButton}>
                    <Icon name="filter-list" size={24} color="#1B4332" />
                    <Text style={styles.addButtonText}>Filter</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.labelText} >Select date range</Text>

            <View style={styles.timeRow}>
                <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowStartPicker(true)}
                >
                    <Text style={styles.timeLabel}>Start Date</Text>
                    <Text style={styles.timeValue}>
                        {startdate
                            ? startdate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })
                            : "Select"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowEndPicker(true)}
                >
                    <Text style={styles.timeLabel}>End Date</Text>
                    <Text style={styles.timeValue}>
                        {enddate
                            ? enddate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })
                            : "Select"}
                    </Text>
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
            {/* ✅ Show native time picker */}
            {showStartPicker && (
                <DateTimePicker
                    mode="date"
                    value={new Date()}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onStartDateChange}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    mode="date"
                    value={new Date()}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onEndDateChange}
                />
            )}
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
    labelText: {
        color: '#6C757D',
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 6,
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
        width: 120,
        height: 200,
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
        fontSize: 16,
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
    paymentOutline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: {
        fontSize: 16,
        color: '#FF6B35',
        fontWeight: '600',
        marginTop: 2,
    },
    paid: {
        fontSize: 16,
        color: '#034833',
        fontWeight: '600',
        marginTop: 2,
    },
    due: {
        fontSize: 16,
        color: '#DC3545',
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
        paddingVertical: 5,
        borderRadius: 6,
    },
    contactBtnText: {
        color: '#007BFF',
        fontSize: 12,
        fontWeight: '600',
    },
    declineBtn: {
        borderWidth: 1,
        borderColor: '#DC3545',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 6,
        marginRight: 8,
    },
    declineText: {
        color: '#DC3545',
        fontSize: 12,
        fontWeight: '600',
    },
    acceptBtn: {
        backgroundColor: '#034833',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 6,
        marginRight: 8
    },
    acceptText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    timeButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 10,
        marginHorizontal: 5,
        alignItems: "center",
    },
    timeLabel: {
        fontSize: 13,
        color: "#555",
    },
    timeValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1B4332",
    },
})