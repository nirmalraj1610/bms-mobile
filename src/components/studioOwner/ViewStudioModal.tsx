import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS } from "../../constants";
import Icon from 'react-native-vector-icons/MaterialIcons';

const ViewStudioModal = ({ visible = false, onClose = () => { }, studio = {} }) => {
    const staticImage = 'https://cdn.shopify.com/s/files/1/2303/2711/files/Beauty_backdrop_lighting_setup_1024x1024.jpg';
    // Determine status badge colors based on the image design
    let statusBgColor = '#FE9A55'; // default Pending orange
    if (studio?.status === 'pending_approval') statusBgColor = '#FE9A55'; // yellow
    if (studio?.status === 'active') statusBgColor = '#034833'; // blue
    if (studio?.status === 'inactive') statusBgColor = '#DC3545'; // red

    let statusText = 'pending';
    if (studio?.status === 'pending_approval') statusText = 'pending'; // yellow
    if (studio?.status === 'active') statusText = 'Active'; // blue
    if (studio?.status === 'inactive') statusText = 'Inactive'; // red
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color={'#DC3545'} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{studio?.name ? studio?.name : 'Studio details'}</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <Image
                        source={{ uri: staticImage }}
                        style={styles.selectedImage}
                        resizeMode="cover"
                    />
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                        <Text style={styles.statusText}>{statusText}</Text>
                    </View>
                    {/* Rating Badge */}
                    <View style={styles.ratingBadge}>
                        <Icon name="star" size={18} color="#FF7441" />
                        <Text style={styles.ratingText}>{studio?.stats?.average_rating || 0}</Text>
                    </View>

                    {studio?.description ? 
                    <>
                    <Text style={styles.infoLabel}>Description</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>{studio?.description || '-'}</Text>
                    </View>
                    </> : null}

                    {studio?.location?.address ? 
                    <>
                    <Text style={styles.infoLabel}>Address</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>{studio?.location?.address || '-'}</Text>
                    </View>
                    </> : null}

                    {studio?.location?.city ? 
                    <>
                    <Text style={styles.infoLabel}>City</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>{studio?.location?.city || '-'}</Text>
                    </View>
                    </> : null}

                    {studio?.location?.state ? 
                    <>
                    <Text style={styles.infoLabel}>State</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>{studio?.location?.state || '-'}</Text>
                    </View>
                    </> : null}

                    {studio?.location?.pincode ? 
                    <> 
                    <Text style={styles.infoLabel}>PinCode</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>{studio?.location?.pincode || '-'}</Text>
                    </View>
                    </> : null}

                    {studio?.pricing?.hourly_rate ? 
                    <>
                    <Text style={styles.infoLabel}>Base Price (per Hour)</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>₹ {studio?.pricing?.hourly_rate || '-'}</Text>
                    </View>
                    </> : null}

                    {studio?.pricing?.weekend_multiplier ? 
                    <>
                    <Text style={styles.infoLabel}>Weekend Price (per hour)</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>₹ {studio?.pricing?.weekend_multiplier || '-'}</Text>
                    </View> 
                    </> : null}

                    {studio?.pricing?.extra_hour_rate ? 
                    <>
                    <Text style={styles.infoLabel}>Overtime Price (per hour)</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>₹ {studio?.pricing?.extra_hour_rate || '-'}</Text>
                    </View>
                     </> : null}

                    {studio?.pricing?.minimum_hours ? 
                    <><Text style={styles.infoLabel}>Min Booking Hours</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoValue}>{studio?.pricing?.minimum_hours || '-'}</Text>
                    </View>
                    </> : null}

                    {studio?.amenities?.length > 0 ? (
                        <>
                    <Text style={styles.infoLabel}>Amenities</Text>

                        <View style={styles.infoRow}>

                            {studio?.amenities.map(item => (
                                <Text key={item.id} style={styles.infoValue}>
                                    • {item}
                                </Text>
                            ))}
                        </View>
                        </>
                    ) : null}
                </ScrollView>
            </View>
        </Modal>
    )
}

export default ViewStudioModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 20
    },
    infoRow: {
        borderWidth: 1,
        borderColor: "#BABABA",
        color: '#101010',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        fontSize: 15,
        backgroundColor: "#ffffff",
    },

    infoLabel: {
        color: '#6C757D',
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 6,
    },

    infoValue: {
        color: '#101010',
        fontSize: 15,
        fontWeight: '600',
    },
    title: {
        color: '#101010',
        fontWeight: '700',
        fontSize: 16,
        marginVertical: 15
    },
    selectedImage: {
        width: '100%',
        height: 200,
        borderWidth: 1,
        borderColor: "#BABABA",
        marginRight: 10,
        marginBottom: 10,
        borderRadius: 10,
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
});