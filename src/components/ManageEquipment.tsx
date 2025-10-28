import { FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Used for the Add Studio icon and Star icon

// --- Data for the Studio Cards ---
const studioData = [
    {
        id: '1',
        equipment: 'camera stand',
        desc: 'Hold your camera for hand free',
        price: ['120/hr', '1198/day'],
        avaliable: '4',
        image: 'https://fotocentreindia.com/wp-content/uploads/2020/01/Ulanzi-MT-08-Extendable-Mini-Tripod-Online-Buy-Mumbai-India-4.jpg' // Placeholder image
    },
    {
        id: '2',
        equipment: 'Camera lens',
        desc: 'f1.8 pro',
        price: ['100/hr', '1000/day'],
        avaliable: '6',
        image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQffoQTJWbabG47mNsJsEE8PUiVEPx-XPvbwFklqWMiJ2u5wPPubzud4oS-JJKtCwS4SfBcq1gHG1JZorjn-hLc059j9dT-uIrtWMNJwUkZDRUnbViSxJWI'
    },
    {
        id: '3',
        equipment: 'Ring light',
        desc: 'Ring light for face brightness',
        price: ['60/hr', '800/day'],
        avaliable: '3',
        image: 'https://atlas-content-cdn.pixelsquid.com/assets_v2/275/2750427660483040505/jpeg-600/G03.jpg'
    },
    {
        id: '4',
        equipment: 'Flash light',
        desc: 'Back light for better brightnes photo',
        price: ['150/hr', '1500/day'],
        avaliable: '2',
        image: 'https://img.freepik.com/premium-vector/realistic-spotlight-design-illustration_176411-1504.jpg'
    },
];

// --- Render Item Function for FlatList ---
const renderStudioCard = ({ item }: any) => {

    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                {/* Studio Image */}
                <Image
                    // Using a placeholder that simulates the image's structure
                    source={{ uri: item.image }}
                    resizeMode="cover"
                    style={styles.cardImage}
                />

                {/* Text Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.studioName}>{item.equipment}</Text>
                    <Text style={styles.studioLocation}>{item.desc}</Text>
                    <Text style={styles.avaliable}>Price range:</Text>
                    {item.price.map((i: string) => (<Text style={styles.price}>₹{i}</Text>))}
                    <Text style={styles.avaliable}>Avaliable: <Text style={styles.price}>{item.avaliable} pieces</Text></Text>
                </View>

            </View>
        </View>
    );
}

// --- Main Component ---
export const ManageEquipmentComponent = () => {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>

            {/* Header: Title and Add Studio Button */}
            <View style={styles.header}>
                <Text style={styles.title}>Studio Equipment</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Icon name="add-circle-outline" size={24} color="#1B4332" />
                    <Text style={styles.addButtonText}>Add Equipment</Text>
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
        </ScrollView>
    )
};

// --- Stylesheet ---
const styles = StyleSheet.create({

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
    infoContainer: {
        padding: 10,
    },
    studioName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#034833'
    },
    studioLocation: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    avaliable: {
        fontSize: 14,
        color: '#101010',
        marginTop: 2,
    },
    price: {
        fontSize: 14,
        color: '#034833',
        marginTop: 2,
        fontWeight: '600'
    }
});