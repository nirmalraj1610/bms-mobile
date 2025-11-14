import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardFilterPopup from "./DashboardFilter";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch } from "react-redux";
import { loadPhotographerBookingsThunk } from "../../features/photographers/photographersSlice";
import imagePaths from "../../constants/imagePaths";
import CancelPhotographerBookingModal from "./CancelPhotographerBookingModal";
import AcceptPhotographerBookingModal from "./AcceptPhotographerBookingModal";
import BookingsSkeleton from "../skeletonLoaders/Photographer/BookingsSkeleton";
import { typography } from "../../constants/typography";

export const BookingsComponent = () => {
    const filterOptions = [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
    ];
    const dispatch = useDispatch();
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [studioBookingList, setPhotographerBookingList] = useState([]);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
    const [startdate, setStartdate] = useState<string>('');
    const [enddate, setEnddate] = useState<string>('');
    const [showCancelModal, setShowCancelModal] = useState({ status: false, selectedBooking: {} });
    const [showAcceptModal, setShowAcceptModal] = useState({ status: false, selectedBooking: {} });
    const onFilterPress = () => {
        setShowFilter(!showFilter)
    }


    useEffect(() => {
        if (!showCancelModal.status && !showAcceptModal.status) {
            fetchPhotographerBookings();
        }
    }, [selectedFilter, showCancelModal, showAcceptModal]);

    const cleardatefilter = () => {
        setStartdate('');
        setEnddate('');
        fetchPhotographerBookings({ from_date: '', to_date: '' }); // force reset
    }

    const fetchPhotographerBookings = async (overrideParams?: any) => {
        setIsLoading(true);

        //   status?: string;
        //   from_date?: string;
        //   to_date?: string;
        //   limit?: number;
        //   offset?: number;
        // }
        let params = {}
        if (selectedFilter) {
            params = { ...params, status: selectedFilter, }
        }
        if (startdate && enddate) {
            console.log('calling here', startdate, enddate);
            params = { ...params, from_date: startdate, to_date: enddate }
        }

        if (overrideParams) params = { ...params, ...overrideParams };

        try {
            const photographerBookings = await dispatch(loadPhotographerBookingsThunk(params)).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 photographerBookings from API:', photographerBookings);

            // response looks like { photographerBookings: [ ... ], total: 16 }
            setPhotographerBookingList(photographerBookings || []);
        } catch (error) {
            console.log('❌ Failed to load photographer bookings:', error);
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
                    <Image source={imagePaths.PhotographerPlaceHolderImage} resizeMode="cover" style={styles.image} />

                    <View style={styles.info}>
                        <Text style={styles.bookingId}>
                            Booking ID:<Text style={{ ...typography.semibold, }}> {item.id}</Text>
                        </Text>
                        <Text style={styles.time}>Booked on :<Text style={{ ...typography.semibold, }}> {item.booking_date}</Text></Text>
                        <Text style={styles.name}>{item?.customer?.full_name}</Text>
                        <Text style={styles.studio}>{item?.service?.service_type} ({item?.booking_type})</Text>
                        <Text style={styles.time}>{item.start_time} - {item.end_time}</Text>
                        <Text style={styles.price}><Text style={{ ...styles.price, color: '#2F2F2F', fontSize: 14 }}>Total price : </Text>₹{item.total_amount}</Text>
                    </View>
                </View>
                {/* Action Buttons */}
                <View style={styles.actions}>
                    {item.status === 'pending' && (
                        <>
                            <TouchableOpacity onPress={() => onOpenAcceptModal(item)} style={styles.acceptBtn}>
                                <Text style={styles.acceptText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onOpenCancelModal(item)} style={styles.declineBtn}>
                                <Text style={styles.declineText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() =>
                                setExpandedBookingId(prev =>
                                    prev === item.id ? null : item.id
                                )
                            } style={styles.contactBtn}>
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

                    {item.status === 'confirmed' && (
                        <>
                            <TouchableOpacity onPress={() => onOpenCancelModal(item)} style={styles.declineBtn}>
                                <Text style={styles.declineText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() =>
                                setExpandedBookingId(prev =>
                                    prev === item.id ? null : item.id
                                )
                            } style={styles.contactBtn}>
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
                                Phone: <Text style={{ fontWeight: '600' }}>+91 {item?.customer?.phone}</Text>
                            </Text>
                            <Text style={[styles.time, { marginBottom: 10 }]}>
                                Email: <Text style={{ fontWeight: '600' }}>{item?.customer?.email}</Text>
                            </Text>
                        </View>
                    </View>
                )}
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
                    <TouchableOpacity onPress={fetchPhotographerBookings} disabled={!startdate || !enddate} style={styles.acceptBtn}>
                        <Text style={styles.acceptText}>Apply</Text>
                    </TouchableOpacity>
                </View>
            }

            {isLoading ? (
                <View style={{ marginBottom: 140, marginTop: 20 }} >
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

            <CancelPhotographerBookingModal
                visible={showCancelModal.status}
                booking={showCancelModal.selectedBooking}
                onClose={onCloseCancelModal}
            />
            <AcceptPhotographerBookingModal
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
        ...typography.medium,
    },
    bgCountText: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '700',
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
    labelText: {
        color: '#6C757D',
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 6,
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
        fontWeight: "bold",
        fontSize: 16,
    },
    noStudioText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
        ...typography.bold,
    },
    addStudioDesc: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
        ...typography.semibold,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        ...typography.regular,
    },
    cardContent: {
        flexDirection: 'row',
    },
    image: {
        width: 120,
        height: 160,
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
        ...typography.regular,
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
        fontWeight: '600',
        marginTop: 2,
        ...typography.bold,
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
        fontWeight: '600',
        ...typography.semibold,
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
        fontWeight: '600',
        ...typography.semibold,
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
        fontWeight: '600',
        ...typography.semibold,
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
        fontWeight: "600",
        color: "#1B4332",
        ...typography.bold,
    },
})