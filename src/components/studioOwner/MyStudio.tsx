import { ActivityIndicator, FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Used for the Add Studio icon and Star icon
import DashboardFilterPopup from "./DashboardFilter";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadMyStudioThunk } from "../../features/studios/studiosSlice";
import ViewStudioModal from "./ViewStudioModal";


// --- Main Component ---
export const MyStudioComponent = ({
    onPressAddStudio = (i: any) => { },
    editStudio = (i: boolean) => { },
    editStudioValues = (i: any) => { },
}) => {
    const dispatch = useDispatch();
    const studioStatusOptions = [
        { label: "Pending Approvals", value: "pending_approval" },
        { label: "Active Studios", value: "active" },
        { label: "Inactive Studios", value: "inactive" },
    ];;
    const [showFilter, setShowFilter] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showViewModal, setShowViewModal] = useState({ status: false, selectedStudio: {} });
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [studioList, setStudioList] = useState([]);
    const onFilterPress = () => {
        setShowFilter(!showFilter)
    }

    const onAddStudioPress = () => {
        onPressAddStudio('Add Studio')        
    }

    const onEditStudio = (item: any) => {
        editStudioValues(item)
        editStudio(true)
        onPressAddStudio('Add Studio')
    }

    const onCloseViewModal = () => {
        setShowViewModal({ status: false, selectedStudio: {} })
    }

    const onOpenViewModal = (item: any) => {
        setShowViewModal({ status: true, selectedStudio: item })
    }

    useEffect(() => {

        fetchStudios();
    }, [selectedFilter]);

    const fetchStudios = async () => {
        setIsLoading(true);
        // { status: "inactive" }
        let params = { include_stats: true }
        if (selectedFilter) {
            params = { ...params, status: selectedFilter, }
        }
        try {
            const studios = await dispatch(loadMyStudioThunk(params)).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 Studios from API:', studios);

            // response looks like { studios: [ ... ], total: 16 }
            setStudioList(studios || []);
        } catch (error) {
            console.log('❌ Failed to load studios:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    // --- Render Item Function for FlatList ---
    const renderStudioCard = ({ item }: any) => {
        // Determine status badge colors based on the image design
        let statusBgColor = '#FE9A55'; // default Pending orange
        if (item.status === 'pending_approval') statusBgColor = '#FE9A55'; // yellow
        if (item.status === 'active') statusBgColor = '#034833'; // blue
        if (item.status === 'inactive') statusBgColor = '#DC3545'; // red

        let statusText = 'pending';
        if (item.status === 'pending_approval') statusText = 'pending'; // yellow
        if (item.status === 'active') statusText = 'Active'; // blue
        if (item.status === 'inactive') statusText = 'Inactive'; // red

        return (
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    {/* Studio Image */}
                    <Image
                        // Using a placeholder that simulates the image's structure
                        source={item?.studio_images[0] ? { uri: item?.studio_images[0]?.image_url } : require('../../assets/images/logoo.png')}
                        style={styles.cardImage}
                    />

                    {/* Rating Badge */}
                    <View style={styles.ratingBadge}>
                        <Icon name="star" size={18} color="#FF7441" />
                        <Text style={styles.ratingText}>{item?.stats?.average_rating}</Text>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                        <Text style={styles.statusText}>{statusText}</Text>
                    </View>

                    {/* Text Info */}
                    <View style={styles.infoContainer}>
                        <Text style={[styles.studioName, { color: '#034833' }]}>{item.name}</Text>
                        <Text style={styles.studioLocation}>{item.description}</Text>
                        <Text style={styles.studioLocation}>City : <Text style={{ ...styles.studioLocation, fontWeight: '600' }}>{item?.location?.city}</Text></Text>
                        <Text style={styles.studioLocation}>State : <Text style={{ ...styles.studioLocation, fontWeight: '600' }}>{item?.location?.state}</Text></Text>
                        <Text style={styles.studioLocation}>Total bookings : <Text style={{ ...styles.studioLocation, fontWeight: '600' }}>{item?.stats?.total_bookings}</Text></Text>
                        <Text style={styles.studioLocation}>Pending bookings : <Text style={{ ...styles.studioLocation, fontWeight: '600' }}>{item?.stats?.pending_bookings}</Text></Text>
                        <Text style={styles.studioLocation}>hourly rate : <Text style={{ ...styles.studioLocation, fontWeight: '600', color: '#FF7441' }}>₹{item?.pricing?.hourly_rate}</Text></Text>
                        <Text style={styles.studioLocation}>Total revenue : <Text style={{ ...styles.studioLocation, fontWeight: '600', color: '#FF7441' }}>₹{item?.stats?.total_revenue}</Text></Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        {/* Edit Button (Bordered)  */}
                        {item.status === 'active' ? <TouchableOpacity onPress={() => onEditStudio(item)} style={[styles.actionButton, styles.editButton]}>
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity> : null}

                        {/* View Button (Bordered) */}
                        <TouchableOpacity onPress={() => onOpenViewModal(item)} style={[styles.actionButton, styles.viewButton]}>
                            <Text style={styles.viewButtonText}>{item.status === 'active' ? 'View' : 'View studio'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <>
            {isLoading ?
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#034833" />
                    <Text style={styles.loadingText}>Loading....</Text>
                </View> :
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
                            <Icon name="pending-actions" size={32} color="#2F2F2F" />
                            <View>
                                <Text style={styles.bgCountText}>7</Text>
                                <Text style={styles.bgText}>Pending Approval</Text>
                            </View>
                        </View>
                    </View>

                    {/* Header: Title and Add Studio Button */}
                    <View style={styles.header}>
                        <Text style={styles.title}>My Studios</Text>
                        <TouchableOpacity onPress={onAddStudioPress} style={styles.addButton}>
                            <Icon name="add-circle-outline" size={24} color="#1B4332" />
                            <Text style={styles.addButtonText}>Add Studio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onFilterPress} style={styles.addButton}>
                            <Icon name="filter-list" size={24} color="#1B4332" />
                            <Text style={styles.addButtonText}>Filter</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Studio Cards Grid */}
                    <FlatList
                        data={studioList}
                        keyExtractor={(item) => item.id}
                        renderItem={renderStudioCard}
                        ListEmptyComponent={
                            <View style={styles.noStudioOutline}>
                                <Icon name="storefront" size={60} color="#ccc" style={{ marginBottom: 10 }} />
                                <Text style={styles.noStudioText}>
                                    No studios found
                                </Text>
                                <Text style={styles.addStudioDesc}>
                                    Add your first studio to get started!
                                </Text>
                                <TouchableOpacity onPress={onAddStudioPress} style={styles.addStudioBtn}>
                                    <Icon name="add-circle-outline" size={24} color="#FFFFFF" />
                                    <Text style={styles.addStudioText}>Add Studio</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        numColumns={2} // Two columns for the grid layout
                        columnWrapperStyle={styles.row} // Style for the row wrapper
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />

                    <DashboardFilterPopup
                        visible={showFilter}
                        options={studioStatusOptions}
                        selectedValue={selectedFilter}
                        onSelect={(val) => setSelectedFilter(val)}
                        onApply={(val) => setSelectedFilter(val)}
                        onClear={() => setSelectedFilter(null)}
                        onClose={() => setShowFilter(false)}
                    />
                    <ViewStudioModal
                        visible={showViewModal.status}
                        studio={showViewModal.selectedStudio}
                        onClose={onCloseViewModal}
                    />
                </ScrollView>}
        </>
    )
};

// --- Stylesheet ---
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
    listContent: {
        paddingVertical: 10,
        paddingBottom: 20,
        marginBottom: 150
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16, // Space between rows
    },
    cardContainer: {
        width: '48%', // Allows two columns with space in between
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#00000026',
    },
    cardImage: {
        width: '100%',
        height: 120, // Height of the image section
        resizeMode: 'cover',
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 3,
    },
    statusBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    infoContainer: {
        padding: 10,
    },
    studioName: {
        fontSize: 14,
        fontWeight: '700',
    },
    studioLocation: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewButton: {
        marginLeft: 5,
        backgroundColor: '#0D6EFD',
    },
    viewButtonText: {
        fontWeight: '600',
        fontSize: 13,
        color: "#FFFFFF"
    },
    editButton: {
        marginLeft: 5,
        backgroundColor: '#034833',
    },
    editButtonText: {
        fontWeight: '600',
        fontSize: 13,
        color: "#FFFFFF"
    },
    addStudioBtn: {
        marginTop: 10,
        backgroundColor: '#034833',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 6,
    },
    addStudioText: {
        marginLeft: 10,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    noStudioOutline: {
        alignItems: 'center',
        marginTop: 40
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
});