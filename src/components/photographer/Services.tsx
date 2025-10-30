import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from "react-native-vector-icons/MaterialIcons";


// --- Main Component ---
export const ServicesComponent = () => {
    const [selectedFile, setSelectedFile] = useState('');
    const [addService, setAddservice] = useState({
        photographyTitle: "",
        basePrice: "",
        serviceDesc: "",
        durationHours: "",
        serviceType: "",
        equipmentIncluded: "",
    });
    const [activeTab, setActiveTab] = useState("Services"); // 'Services' or 'Add Service'

    const serviceTypeList = [
        "Wedding",
        "Birthday",
        "Vaccation",
    ]

    const equipmentList = [
        "Camera",
        "Lighting",
        "Lenses",
        "Tripod",
    ]

    // --- Data for the Studio Cards ---
    const serviceData = [
        {
            id: '1',
            title: 'wedding',
            baseprice: '1200',
            desc: 'we can give the best photo service',
            durationHuous: '2',
            serviceType: 'Wedding',
            equipIncluded: 'Camera',
            image: 'https://fotocentreindia.com/wp-content/uploads/2020/01/Ulanzi-MT-08-Extendable-Mini-Tripod-Online-Buy-Mumbai-India-4.jpg' // Placeholder image
        },
        {
            id: '2',
            title: 'Portrait Session',
            baseprice: '400',
            desc: 'Professional portrait photography',
            durationHuous: '2',
            serviceType: 'Birthday',
            equipIncluded: 'Lenses',
            image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQffoQTJWbabG47mNsJsEE8PUiVEPx-XPvbwFklqWMiJ2u5wPPubzud4oS-JJKtCwS4SfBcq1gHG1JZorjn-hLc059j9dT-uIrtWMNJwUkZDRUnbViSxJWI'
        },
        {
            id: '3',
            title: 'Wedding Photography',
            baseprice: '800',
            desc: 'Full-day coverage with 2 photographers and drone shots',
            durationHuous: '8',
            serviceType: 'Wedding',
            equipIncluded: 'Tripod',
            image: 'https://atlas-content-cdn.pixelsquid.com/assets_v2/275/2750427660483040505/jpeg-600/G03.jpg'
        },
        {
            id: '4',
            title: 'Portrait Session',
            baseprice: '600',
            desc: 'Professional portrait photography',
            durationHuous: '3',
            serviceType: 'Vaccation',
            equipIncluded: 'Lighting',
            image: 'https://3.imimg.com/data3/VH/BQ/GLADMIN-119035/photo-studio-equipment-250x250.jpg'
        },
    ];

    const onEditServicePress = (item: any) => {
        setActiveTab("Add Service");
        setSelectedFile(item?.image ? { uri: item?.image } : '')
        setAddservice({
            photographyTitle: item?.title ? item?.title : '',
            basePrice: item?.baseprice ? item?.baseprice : '',
            serviceDesc: item?.desc ? item?.desc : '',
            durationHours: item?.durationHuous ? item?.durationHuous : '',
            serviceType: item?.serviceType ? item?.serviceType : '',
            equipmentIncluded: item?.equipIncluded ? item?.equipIncluded : '',
        })
    }

    const handleDocumentPick = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (!result.didCancel && result.assets && result.assets.length > 0) {
            setSelectedFile(result.assets[0]);
        }
    };

    const createEquipment = () => {
        setSelectedFile('')
        // set initial state value
        setAddservice({
            photographyTitle: "",
            basePrice: "",
            serviceDesc: "",
            durationHours: "",
            serviceType: "",
            equipmentIncluded: "",
        })

        // move to list equipment tab

        setActiveTab("Services");

    }

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
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.studioName}>{item.title}</Text>
                        <Text style={styles.studioDesc}>{item.desc}</Text>
                        <Text style={styles.avaliable}>Duration : <Text style={{ ...styles.avaliable, fontWeight: '600' }}> {item.durationHuous} hours</Text></Text>
                        <Text style={styles.avaliable}>Service : <Text style={{ ...styles.avaliable, fontWeight: '600' }}>{item.serviceType}</Text></Text>
                        <Text style={styles.avaliable}>Equipment : <Text style={{ ...styles.avaliable, fontWeight: '600' }}>{item.equipIncluded}</Text></Text>
                        <Text style={styles.avaliable}>Base Price : <Text style={styles.price}>₹ {item.baseprice}</Text></Text>

                        {/* Edit Button (Bordered)  */}
                        <TouchableOpacity onPress={() => onEditServicePress(item)} style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>Edit</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={{ marginBottom: 360 }}>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "Services" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("Services")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Services" && styles.activeTabText,
                        ]}
                    >
                        Services
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "Add Service" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("Add Service")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Add Service" && styles.activeTabText,
                        ]}
                    >
                        Add Service
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {activeTab === "Services" ? <>

                    {/* Studio Cards Grid */}
                    <FlatList
                        data={serviceData}
                        keyExtractor={(item) => item.id}
                        renderItem={renderStudioCard}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                </> :
                    <>
                        <Text style={styles.labelText} >Photography Title<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., Wedding"
                            value={addService.photographyTitle}
                            onChangeText={(text) =>
                                setAddservice({ ...addService, photographyTitle: text })
                            }
                        />
                        <Text style={styles.labelText} >Service Image<Text style={styles.required}> *</Text></Text>
                        {selectedFile ?
                            <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
                                <Image
                                    source={{ uri: selectedFile?.uri }}
                                    style={styles.selectedImage}
                                    resizeMode={"cover"}
                                />
                            </TouchableOpacity> :
                            <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
                                <Icon name="cloud-upload" size={28} color="#034833" />
                                <Text style={styles.uploadTextHeader}>Upload Service Image</Text>
                                <Text style={styles.uploadTextDesc}>Click to browse your image</Text>
                                <Text style={styles.supportedFilesText}>
                                    Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
                                </Text>
                                <Text style={styles.chooseFilesText}>Choose File</Text>
                            </TouchableOpacity>}
                        <Text style={styles.labelText} >Base Price<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            keyboardType="number-pad"
                            placeholder="e.g., 1200"
                            multiline
                            value={addService.basePrice}
                            onChangeText={(text) =>
                                setAddservice({ ...addService, basePrice: text })
                            }
                        />
                        <Text style={styles.labelText} >Description</Text>

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., We can give the best wedding photography and best price..."
                            multiline
                            value={addService.serviceDesc}
                            onChangeText={(text) =>
                                setAddservice({ ...addService, serviceDesc: text })
                            }
                        />
                        <Text style={styles.labelText} >Duration Hours<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            keyboardType="number-pad"
                            placeholder="e.g., 4"
                            multiline
                            value={addService.durationHours}
                            onChangeText={(text) =>
                                setAddservice({ ...addService, durationHours: text })
                            }
                        />

                        <Text style={styles.labelText} >Service Type<Text style={styles.required}> *</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={addService.serviceType} // Must match one of Picker.Item values
                                onValueChange={(value) => setAddservice({ ...addService, serviceType: value })}
                                dropdownIconColor="#034833" // Color of the arrow
                                style={{ color: '#101010' }} // Color of the selected text
                            >
                                <Picker.Item label="Select service type" />
                                {serviceTypeList.map((studio, index) => (
                                    <Picker.Item key={index} label={studio} value={studio} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.labelText} >Equipment Included<Text style={styles.required}> *</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={addService.equipmentIncluded} // Must match one of Picker.Item values
                                onValueChange={(value) => setAddservice({ ...addService, equipmentIncluded: value })}
                                dropdownIconColor="#034833" // Color of the arrow
                                style={{ color: '#101010' }} // Color of the selected text
                            >
                                <Picker.Item label="Select equipment" value="" />
                                {equipmentList.map((equipment, index) => (
                                    <Picker.Item key={index} label={equipment} value={equipment} />
                                ))}
                            </Picker>
                        </View>
                        {/* Save button section  */}
                        <TouchableOpacity onPress={createEquipment} style={styles.createButton}>
                            <Text style={styles.createButtonText}>Save service</Text>
                        </TouchableOpacity>

                    </>
                }
            </ScrollView>
        </View>
    )
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    listContent: {
        paddingVertical: 10,
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16, // Space between rows
    },
    cardContainer: {
        marginBottom: 10,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#00000026',
        padding: 10,
    },
    cardTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    cardImage: {
        width: 130,
        height: 180,
        borderRadius: 10,
        resizeMode: 'contain',
        borderWidth: 1,
        borderColor: '#00000026',
    },
    studioName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#034833'
    },
    studioDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    equipmentType: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
        fontWeight: '500'
    },
    avaliable: {
        fontSize: 14,
        color: '#101010',
        marginTop: 2,
    },
    price: {
        fontSize: 18,
        color: '#FF6B35',
        fontWeight: '600',
        marginTop: 2,
    },
    labelText: {
        color: '#6C757D',
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 6,
    },
    required: {
        color: '#DC3545'
    },
    input: {
        borderWidth: 1,
        borderColor: "#BABABA",
        color: '#101010',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        fontSize: 14,
        backgroundColor: "#ffffff",
        fontWeight: '600',
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 12,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center'
    },
    tab: {
        flex: 0.50,
        paddingVertical: 12,
        alignItems: "center",
    },
    tabText: {
        fontSize: 16,
        color: "#777",
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: "#034833",
        borderRadius: 10
    },
    activeTabText: {
        color: "#034833",
        fontWeight: "600",
    },
    viewButton: {
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: '#1B4332',
    },
    viewButtonText: {
        fontWeight: '600',
        fontSize: 13,
        color: '#FFFFFF'
    },
    createButton: {
        backgroundColor: "#034833",
        paddingVertical: 14,
        borderRadius: 10,
        marginVertical: 25,
        alignItems: "center",
    },
    createButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    uploadButton: {
        borderWidth: 1,
        width: '100%',
        height: 200,
        borderColor: "#BABABA",
        borderRadius: 10,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadTextHeader: {
        fontWeight: "600",
        color: "#101010",
        fontSize: 16,
        marginTop: 10,
    },
    uploadTextDesc: {
        fontSize: 13,
        color: "#555",
        marginTop: 5,
    },
    supportedFilesText: {
        fontSize: 12,
        color: "#777",
        marginTop: 5,
        textAlign: "center",
    },
    chooseFilesText: {
        marginTop: 10,
        fontWeight: "bold",
        color: "#034833",
    },
    selectedImage: {
        height: 150,
        width: 150,
        borderRadius: 10
    },
});