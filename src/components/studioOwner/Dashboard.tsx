import { ActivityIndicator, FlatList, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardFilterPopup from "./DashboardFilter";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadMyStudioThunk, loadStudioBookingsThunk } from "../../features/studios/studiosSlice";
import { getUserData } from "../../lib/http";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export const DashboardComponent = () => {
    const dispatch = useDispatch();
    const filterOptions = [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
    ];
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [studioList, setStudioList] = useState([{ label: '', value: '' }]);
    const [studioBookingList, setStudioBookingList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [selectedStudio, setSelectedStudio] = useState('');
    const [startdate, setStartdate] = useState<string>('');
    const [enddate, setEnddate] = useState<string>('');

    const staticImage = 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg';


    const onFilterPress = () => {
        setShowFilter(!showFilter)
    }

    useEffect(() => {
        fetchStudios();
    }, [])

    useEffect(() => {
        fetchStudiosBookings();
    }, [selectedStudio, selectedFilter])

    const fetchStudios = async () => {
        setIsLoading(true);
        // { status: "inactive" }
        // let params = { include_stats: true }
        // if (selectedFilter) {
        //     params = { ...params, status: selectedFilter, }
        // }
        try {
            const studios = await dispatch(loadMyStudioThunk()).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 Studios from API:', studios);

            // response looks like { studios: [ ... ], total: 16 }
            const studiosList = studios.map(studio => ({
                label: studio.name,
                value: studio.id,
            }));
            setStudioList(studiosList || []);
        } catch (error) {
            console.log('❌ Failed to load studios:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const cleardatefilter = () => {
        setStartdate('');
        setEnddate('');
        fetchStudiosBookings();
    }

    const fetchStudiosBookings = async () => {
        setIsLoading(true);
        //             {
        //   studio_id: string;
        //   status?: string;
        //   from_date?: string;
        //   to_date?: string;
        //   limit?: number;
        //   offset?: number;
        // }
        const userData = await getUserData();
        let params = { studio_id: selectedStudio }
        if (selectedFilter) {
            params = { ...params, status: selectedFilter, }
        }
        if (startdate && enddate) {
            params = { ...params, from_date: startdate, to_date: enddate }
        }
        try {
            const studiosBookings = await dispatch(loadStudioBookingsThunk(params)).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 StudiosBookings from API:', studiosBookings);

            // response looks like { studiosBookings: [ ... ], total: 16 }
            setStudioBookingList(studiosBookings || []);
        } catch (error) {
            console.log('❌ Failed to load studios bookings:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    // ✅ Handle start date selection
    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
            setStartdate(formattedDate);
        }
    };

    // ✅ Handle end date selection
    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setEnddate(formattedDate);
        }
    };

    const renderItem = ({ item }: any) => {
        let statusColor = '#FE9A55'; // default Pending orange
        if (item.status === 'pending') statusColor = '#FFC107'; // yellow
        if (item.status === 'confirmed') statusColor = '#0D6EFD'; // yellow
        if (item.status === 'completed') statusColor = '#034833'; // blue 
        if (item.status === 'cancelled') statusColor = '#DC3545'; // red

        let statusTextColor = '#FFFFFF'; // default Pending orange
        if (item.status === 'pending') statusTextColor = '#FFFFFF'; // yellow
        if (item.status === 'confirmed') statusTextColor = '#FFFFFF'; // yellow
        if (item.status === 'completed') statusTextColor = '#FFFFFF'; // blue
        if (item.status === 'cancelled') statusTextColor = '#FFFFFF'; // white

        return (
            <View style={styles.card}>
                {/* Status badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusTextColor }]}>{item.status}</Text>
                </View>

                <View style={styles.cardContent}>
                    <Image source={{ uri: staticImage }} resizeMode="cover" style={styles.image} />

                    <View style={styles.info}>
                        <Text style={styles.bookingId}>
                            Booking ID: <Text style={{ fontWeight: '600' }}>{item.id}</Text>
                        </Text>
                        <Text style={styles.name}>{item?.customer?.full_name}</Text>
                        <Text style={styles.date}>Date: <Text style={{ fontWeight: '600' }}>{item.booking_date}</Text></Text>
                        <Text style={styles.time}>Booking type: <Text style={{ fontWeight: '600' }}>{item?.customer?.phone}</Text></Text>
                        <Text style={styles.time}>Booking type: <Text style={{ fontWeight: '600' }}>{item.booking_type}</Text></Text>
                        <Text style={styles.time}>Start time: <Text style={{ fontWeight: '600' }}>{item.start_time}</Text></Text>
                        <Text style={styles.time}>End time: <Text style={{ fontWeight: '600' }}>{item.end_time}</Text></Text>
                        <Text style={styles.price}>₹{item.total_amount}</Text>

                        {/* Action Buttons */}
                        <View style={styles.actions}>
                            {item.status === 'confirmed' && (
                                <>
                                    <TouchableOpacity style={styles.declineBtn}>
                                        <Text style={styles.declineText}>Decline</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.contactBtn}>
                                        <Text style={styles.contactBtnText}>Contact</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            {item.status === 'cancelled' && (

                                <TouchableOpacity style={styles.contactBtn}>
                                    <Text style={styles.contactBtnText}>Contact</Text>
                                </TouchableOpacity>
                            )}
                            {item.status === 'pending' && (
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
        <>
            {
                isLoading ?
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#034833" />
                        <Text style={styles.loadingText}>Loading....</Text>
                    </View> : <ScrollView showsVerticalScrollIndicator={false}>
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
                                <Icon name="currency-rupee" size={32} color="#2F2F2F" />
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

                        <Text style={styles.labelText} >Select studio to view bookings<Text style={styles.required}> *</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedStudio}
                                onValueChange={(value) => setSelectedStudio(value)} // ✅ value is already the selected one
                                dropdownIconColor="#034833"
                                style={{ color: '#101010' }}
                            >
                                <Picker.Item label="Select a studio" value="" />
                                {studioList.map((studio, index) => (
                                    <Picker.Item key={index} label={studio.label} value={studio.value} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.datelableOutline}>
                            <Text style={styles.labelText} >Select date range<Text style={styles.required}> *</Text></Text>
                            <TouchableOpacity onPress={fetchStudiosBookings} disabled={!startdate || !enddate} style={styles.acceptBtn}>
                                <Text style={styles.acceptText}>Apply</Text>
                            </TouchableOpacity>
                            {startdate && enddate && <TouchableOpacity onPress={cleardatefilter} disabled={!startdate || !enddate} style={{...styles.acceptBtn, backgroundColor: '#DC3545', marginLeft: 10}}>
                                <Text style={styles.acceptText}>Clear</Text>
                            </TouchableOpacity>}
                        </View>

                        <View style={styles.timeRow}>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <Text style={styles.timeLabel}>Start Date</Text>
                                <Text style={styles.timeValue}>
                                    {startdate
                                        ? new Date(startdate).toLocaleDateString("en-GB", {
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
                                        ? new Date(enddate).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "Select"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={studioBookingList}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            ListEmptyComponent={
                                <View style={styles.noStudioOutline}>
                                    <Icon name="camera-alt" size={60} color="#ccc" style={{ marginBottom: 10 }} />
                                    <Text style={styles.noStudioText}>
                                        No bookings found
                                    </Text>
                                    <Text style={styles.addStudioDesc}>
                                        Start getting bookings — they’ll appear here once received.
                                    </Text>
                                </View>
                            }
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

                    </ScrollView>}
        </>
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
        height: 180,
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
        borderColor: '#DC3545',
        paddingHorizontal: 20,
        paddingVertical: 6,
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
        paddingVertical: 6,
        borderRadius: 6,
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
    labelText: {
        color: '#6C757D',
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 6,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 12,
    },
    required: {
        color: '#DC3545'
    },
    datelableOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    noStudioOutline: {
        alignItems: 'center',
        marginBottom: 60
    },
    loading: {
        marginTop: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 20,
        color: "#101010",
        fontWeight: "bold",
        fontSize: 16,
    },
    noStudioText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500'
    },
    addStudioDesc: {
        fontSize: 14,
        color: '#999',
        marginTop: 4
    },
})