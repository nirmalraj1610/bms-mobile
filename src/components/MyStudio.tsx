import { FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Used for the Add Studio icon and Star icon
import DashboardFilterPopup from "./DashboardFilter";
import { useState } from "react";


// --- Main Component ---
export const MyStudioComponent = ({
    onPressAddStudio = (i: any) => { }
}) => {

    const filterOptions = ["Pending", "Confirmed", "Completed", "Cancelled"];
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const onFilterPress = () => {
        setShowFilter(!showFilter)
    }

    const onAddStudioPress = () => {
        onPressAddStudio('Add Studio')
    }

    // --- Data for the Studio Cards ---
    const studioData = [
        {
            id: '1',
            name: 'Priya Sharma',
            studio: 'Studio Elite Mumbai',
            rating: '4.9',
            status: 'Active',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg' // Placeholder image
        },
        {
            id: '2',
            name: 'Priya Sharma',
            studio: 'Studio Elite Mumbai',
            rating: '4.9',
            status: 'Pending',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
        {
            id: '3',
            name: 'Priya Sharma',
            studio: 'Studio Elite Mumbai',
            rating: '4.9',
            status: 'Pending',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
        {
            id: '4',
            name: 'Priya Sharma',
            studio: 'Studio Elite Mumbai',
            rating: '4.9',
            status: 'Active',
            image: 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg'
        },
    ];

    // --- Render Item Function for FlatList ---
    const renderStudioCard = ({ item }: any) => {
        // Determine status badge colors based on the image design
        const isActive = item.status === 'Active';
        const statusBgColor = isActive ? '#0D6EFD' : '#FE9A55'; // Blue for Active, Orange for Pending

        // The dark green color used for primary elements (Manage button, text)
        const primaryColor = '#034833';
        // The border color for the View button
        const secondaryColor = '#E0E0E0';

        return (
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    {/* Studio Image */}
                    <Image
                        // Using a placeholder that simulates the image's structure
                        source={{ uri: item.image }}
                        style={styles.cardImage}
                    />

                    {/* Rating Badge */}
                    <View style={styles.ratingBadge}>
                        <Icon name="star" size={18} color="#FF7441" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>

                    {/* Text Info */}
                    <View style={styles.infoContainer}>
                        <Text style={[styles.studioName, { color: primaryColor }]}>{item.name}</Text>
                        <Text style={styles.studioLocation}>{item.studio}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        {/* Manage Button (Solid Dark Green) */}
                        <TouchableOpacity style={[styles.actionButton, styles.manageButton, { backgroundColor: primaryColor }]}>
                            <Text style={styles.manageButtonText}>Manage</Text>
                        </TouchableOpacity>

                        {/* View Button (Bordered) */}
                        <TouchableOpacity style={[styles.actionButton, styles.viewButton, { borderColor: primaryColor }]}>
                            <Text style={[styles.viewButtonText, { color: primaryColor }]}>View</Text>
                        </TouchableOpacity>
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
                data={studioData}
                keyExtractor={(item) => item.id}
                renderItem={renderStudioCard}
                numColumns={2} // Two columns for the grid layout
                columnWrapperStyle={styles.row} // Style for the row wrapper
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
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
    manageButton: {
        marginRight: 5,
    },
    manageButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    viewButton: {
        marginLeft: 5,
        borderWidth: 1.5,
        backgroundColor: '#fff',
    },
    viewButtonText: {
        fontWeight: '600',
        fontSize: 13,
    },
});