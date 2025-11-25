import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardFilterPopup from "./DashboardFilter";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch } from "react-redux";
import { loadMyStudioThunk, loadStudioBookingsThunk } from "../../features/studios/studiosSlice";
import CancelStudioBookingModal from "./CancelStudioBookingModal";
import AcceptStudioBookingModal from "./AcceptStudioBookingModal";
import imagePaths from "../../constants/imagePaths";
import { Dropdown } from "react-native-element-dropdown";
import BookingsSkeleton from "../skeletonLoaders/StudioOwner/BookingsSkeleton";
import { typography } from "../../constants/typography";

export const BookingsComponent = () => {
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
    const [studiosStats, setStudiosStats] = useState({ activeStudios_count: 0, total_Bookings: 0, total_Earnings: 0, pending_Approvals: 0 });
    const [studioBookingList, setStudioBookingList] = useState([]);
    const [studiosData, setStudioSData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [selectedStudio, setSelectedStudio] = useState('');
    const [startdate, setStartdate] = useState<string>('');
    const [enddate, setEnddate] = useState<string>('');
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState({ status: false, selectedBooking: {} });
    const [showAcceptModal, setShowAcceptModal] = useState({ status: false, selectedBooking: {} });

    // pull to refresh
    const [refreshing, setRefreshing] = useState(false);

    const onFilterPress = () => {
        setShowFilter(!showFilter)
    }

    useEffect(() => {
        fetchStudios();
    }, [])

    useEffect(() => {
        if (!showCancelModal.status && !showAcceptModal.status) {
            fetchStudiosBookings();
        }
    }, [selectedStudio, selectedFilter, showCancelModal, showAcceptModal]);

    const fetchStudios = async () => {
        setIsLoading(true);
        // { status: "inactive" }
        // let params = { include_stats: true }
        // if (selectedFilter) {
        //     params = { ...params, status: selectedFilter, }
        // }
        try {
            const studios = await dispatch(loadMyStudioThunk({ status: "active", include_stats: true })).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 Studios from API:', studios);

            // response looks like { studios: [ ... ], total: 16 }
            const studiosList = studios
                .map((studio: any) => ({
                    label: studio.name,
                    value: studio.id,
                }));

            setStudioList(studiosList || []);
            setSelectedStudio(studiosList[0]?.value);
            setStudioSData(studios || []);
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
        fetchStudiosBookings({ from_date: '', to_date: '' }); // force reset
    }

    const fetchStudiosBookings = async (overrideParams?: any) => {
        setIsLoading(true);
        //             {
        //   studio_id: string;
        //   status?: string;
        //   from_date?: string;
        //   to_date?: string;
        //   limit?: number;
        //   offset?: number;
        // }

        let params = { studio_id: selectedStudio }
        if (selectedFilter) {
            params = { ...params, status: selectedFilter, }
        }
        if (startdate && enddate) {
            console.log('calling here', startdate, enddate);
            params = { ...params, from_date: startdate, to_date: enddate }
        }

        if (overrideParams) params = { ...params, ...overrideParams };

        try {
            const studiosBookings = await dispatch(loadStudioBookingsThunk(params)).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 StudiosBookings from API:', studiosBookings);

            // response looks like { studiosBookings: [ ... ], total: 16 }
            setStudioBookingList(studiosBookings || []);

            // 1. Count active studios (if still needed globally)
            const activeStudiosCount = studiosData.length;

            // 2. Find ONLY the selected studio
            const selected = studiosData.find(studio => studio.id === selectedStudio);

            // 3. If not found, avoid crash
            if (!selected) {
                setStudiosStats({ activeStudios_count: 0, total_Bookings: 0, total_Earnings: 0, pending_Approvals: 0 });
                return;
            }

            // 4. Build stats ONLY for this studio
            const studioStats = {
                activeStudios_count: activeStudiosCount || 0,
                total_Bookings: selected?.stats?.total_bookings || 0,
                total_Earnings: selected?.stats?.total_revenue || 0,
                pending_Approvals: selected?.stats?.pending_bookings || 0,
            };

            // 5. Update state
            setStudiosStats(studioStats);

        } catch (error) {
            console.log('❌ Failed to load studios bookings:', error);
        }
        finally {
            setIsLoading(false);
            setRefreshing(false);
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

    const onCloseCancelModal = () => {
        setShowCancelModal({ status: false, selectedBooking: {} })
    }

    const onOpenCancelModal = (item: any) => {
        setShowCancelModal({ status: true, selectedBooking: item })
    }

    const onCloseAcceptModal = () => {
        setShowAcceptModal({ status: false, selectedBooking: {} })
    }

    const onOpenAcceptModal = (item: any) => {
        setShowAcceptModal({ status: true, selectedBooking: item })
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStudiosBookings();
    }

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
                    <Image source={imagePaths.StudioPlaceHolderImage} resizeMode="cover" style={styles.image} />

                    <View style={styles.info}>
                        <Text style={styles.bookingId}>
                            Booking ID: <Text style={{ ...typography.bold, }}>{item.id}</Text>
                        </Text>
                        <Text style={styles.name}>{item?.customer?.full_name}</Text>
                        <Text style={styles.date}>Date: <Text style={{ ...typography.bold, }}>{item.booking_date}</Text></Text>
                        <Text style={styles.time}>Booking type: <Text style={{ ...typography.bold, }}>{item.booking_type}</Text></Text>
                        <Text style={styles.time}>Start time: <Text style={{ ...typography.bold, }}>{item.start_time}</Text></Text>
                        <Text style={styles.time}>End time: <Text style={{ ...typography.bold, }}>{item.end_time}</Text></Text>
                        <Text style={styles.time}>Price: <Text style={styles.price}>₹{item.total_amount}</Text></Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    {item.status === 'confirmed' && (
                        <>
                            <TouchableOpacity onPress={() => onOpenCancelModal(item)} style={styles.declineBtn}>
                                <Text style={styles.declineText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.contactBtn}
                                onPress={() =>
                                    setExpandedBookingId(prev =>
                                        prev === item.id ? null : item.id
                                    )
                                }
                            >
                                <Text style={styles.contactBtnText}>
                                    {expandedBookingId === item.id ? 'Hide Details' : 'Details'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {(item.status === 'cancelled' || item.status === 'completed') && (

                        <TouchableOpacity
                            style={styles.contactBtn}
                            onPress={() =>
                                setExpandedBookingId(prev =>
                                    prev === item.id ? null : item.id
                                )
                            }
                        >
                            <Text style={styles.contactBtnText}>
                                {expandedBookingId === item.id ? 'Hide Details' : 'Details'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'pending' && (
                        <>
                            <TouchableOpacity onPress={() => onOpenAcceptModal(item)} style={styles.acceptBtn}>
                                <Text style={styles.acceptText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onOpenCancelModal(item)} style={styles.declineBtn}>
                                <Text style={styles.declineText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.contactBtn}
                                onPress={() =>
                                    setExpandedBookingId(prev =>
                                        prev === item.id ? null : item.id
                                    )
                                }
                            >
                                <Text style={styles.contactBtnText}>
                                    {expandedBookingId === item.id ? 'Hide Details' : 'Details'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
                {expandedBookingId === item.id && (
                    <View style={[styles.card, { marginTop: 20, marginBottom: 0 }]}>
                        <View style={styles.info}>
                            <Text style={styles.labelText}>Contact Information:</Text>
                            <Text style={styles.time}>
                                Phone: <Text style={{ ...typography.bold }}>+91 {item?.customer?.phone}</Text>
                            </Text>
                            <Text style={[styles.time, { marginBottom: 10 }]}>
                                Email: <Text style={{ ...typography.bold }}>{item?.customer?.email}</Text>
                            </Text>

                            <Text style={styles.labelText}>Required Equipment:</Text>
                            {item?.equipment?.length > 0 ? (
                                <>
                                    {item.equipment.map(eq => (
                                        <Text key={eq?.id} style={{ ...styles.time, ...typography.bold }}>
                                            • {eq.item_name}
                                        </Text>
                                    ))}
                                </>
                            ) : (
                                <Text style={{ ...styles.labelText, fontSize: 10 }}>
                                    No equipment found
                                </Text>
                            )}
                        </View>
                    </View>
                )}


            </View>
        );

    }

    return (

        <ScrollView showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#034833"]}      // Android
                />}
        >
            {/* Dashboard views one */}
            <View style={styles.statusViewsOutline}>
                <View style={styles.bgImageCard}>
                    <Image source={imagePaths.activeStudios} resizeMode="contain" style={styles.bgImage} />
                    <View>
                        <Text style={styles.bgCountText}>{studiosStats?.activeStudios_count}</Text>
                        <Text style={styles.bgText}>Active Studios</Text>
                    </View>
                </View>

                <View style={styles.bgImageCard}>
                    <Image source={imagePaths.totalBookings} resizeMode="contain" style={styles.bgImage} />
                    <View>
                        <Text style={styles.bgCountText}>{studiosStats?.total_Bookings}</Text>
                        <Text style={styles.bgText}>Total Bookings</Text>
                    </View>
                </View>
            </View>
            {/* Dashboard views two */}
            <View style={styles.statusViewsOutline}>
                <View style={styles.bgImageCard}>
                    <Image source={imagePaths.totalEarnings} resizeMode="contain" style={styles.bgImage} />
                    <View>
                        <Text style={styles.bgCountText}>₹{studiosStats?.total_Earnings}</Text>
                        <Text style={styles.bgText}>Total Earnings</Text>
                    </View>
                </View>

                <View style={styles.bgImageCard}>
                    <Image source={imagePaths.pendingRequests} resizeMode="contain" style={styles.bgImage} />
                    <View>
                        <Text style={styles.bgCountText}>{studiosStats?.pending_Approvals}</Text>
                        <Text style={styles.bgText}>Pending Requests</Text>
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

            <Text style={styles.labelText} >Select studio to view bookings<Text style={styles.required}> *</Text></Text>
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                containerStyle={styles.dropdownContainerStyle}
                data={studioList}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select a studio"
                searchPlaceholder="Search studio..."
                value={selectedStudio}
                onChange={(item) => {
                    setSelectedStudio(item.value);
                }}
            />

            <Text style={styles.labelText} >Select date range<Text style={styles.required}> *</Text></Text>

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
            {startdate && enddate &&
                <View style={styles.datelableOutline}>
                    <TouchableOpacity onPress={cleardatefilter} disabled={!startdate || !enddate} style={{ ...styles.acceptBtn, backgroundColor: '#DC3545', marginRight: 10 }}>
                        <Text style={styles.acceptText}>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={fetchStudiosBookings} disabled={!startdate || !enddate} style={styles.acceptBtn}>
                        <Text style={styles.acceptText}>Apply</Text>
                    </TouchableOpacity>
                </View>
            }

            {isLoading ? (
                <View style={{ marginBottom: 140, marginTop: 10 }} >
                    {[1, 2, 3].map((_, i) => <BookingsSkeleton key={i} />)}
                </View>
            ) : (
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
            )}

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

            <CancelStudioBookingModal
                visible={showCancelModal.status}
                booking={showCancelModal.selectedBooking}
                onClose={onCloseCancelModal}
            />

            <AcceptStudioBookingModal
                visible={showAcceptModal.status}
                booking={showAcceptModal.selectedBooking}
                onClose={onCloseAcceptModal}
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
        fontSize: 16,
        ...typography.bold,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#1B4332',
        fontSize: 16,
        marginLeft: 4,
        marginRight: 10,
        ...typography.bold,
    },

    bgImageCard: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        gap: 5,
        overflow: 'hidden',
        height: 80,
        backgroundColor: '#F2F5EC'
    },
    bgImage: {
        height: 36,
        width: 36,
    },
    bgText: {
        fontSize: 10,
        color: '#2F2F2F',
        ...typography.semibold,
    },
    bgCountText: {
        fontSize: 16,
        color: '#FF6B35',
        ...typography.bold,
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
        ...typography.medium,
    },
    cardContent: {
        flexDirection: 'row',
    },
    required: {
        color: '#DC3545'
    },
    image: {
        width: 120,
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
        ...typography.semibold,
    },
    date: {
        fontSize: 12,
        color: '#2F2F2F',
        ...typography.semibold,
    },
    name: {
        fontSize: 16,
        color: '#034833',
        marginTop: 2,
        ...typography.extrabold,
    },
    studio: {
        fontSize: 12,
        color: '#2F2F2F',
        ...typography.bold,
    },
    time: {
        fontSize: 12,
        color: '#2F2F2F',
        marginTop: 2,
        ...typography.semibold,
    },
    paymentOutline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: {
        fontSize: 16,
        color: '#FF6B35',
        ...typography.bold,
        marginTop: 2,
    },
    paid: {
        fontSize: 16,
        color: '#034833',
        ...typography.bold,
        marginTop: 2,
    },
    due: {
        fontSize: 16,
        color: '#DC3545',
        ...typography.bold,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        marginTop: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    contactBtn: {
        borderWidth: 1,
        borderColor: '#007BFF',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
        marginRight: 8,
    },
    contactBtnText: {
        color: '#007BFF',
        fontSize: 12,
        ...typography.bold,
    },
    declineBtn: {
        borderWidth: 1,
        borderColor: '#DC3545',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
        marginRight: 8,
    },
    declineText: {
        color: '#DC3545',
        fontSize: 12,
        ...typography.bold,
    },
    acceptBtn: {
        backgroundColor: '#034833',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
        marginRight: 8,
    },
    acceptText: {
        color: '#fff',
        fontSize: 12,
        ...typography.bold,
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
        ...typography.semibold,
    },
    timeValue: {
        fontSize: 15,
        color: "#1B4332",
        ...typography.bold,
    },
    labelText: {
        color: '#101010',
        fontSize: 16,
        marginBottom: 6,
        ...typography.semibold,
    },
    datelableOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
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
        fontSize: 16,
        ...typography.bold,
    },
    noStudioText: {
        fontSize: 16,
        color: '#666',
        ...typography.bold,
    },
    addStudioDesc: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
        ...typography.semibold,
    },
    dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#999',
        ...typography.bold,
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#101010',
        ...typography.bold,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
        color: '#101010',
        borderRadius: 10,
        ...typography.bold,
    },
    dropdownContainerStyle: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        paddingVertical: 6,
        elevation: 5, // for Android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
})