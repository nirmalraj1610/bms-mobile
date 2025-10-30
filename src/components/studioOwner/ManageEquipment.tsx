import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from "react-native-vector-icons/MaterialIcons";


// --- Main Component ---
export const ManageEquipmentComponent = () => {
    const [selectedStudio, setSelectedStudio] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    const [addStudio, setaddStudio] = useState({
        studioName: "",
        equipmentName: "",
        equipmentType: "",
        equipmentDesc: "",
        resolution: "",
        video: "",
        availableQuantity: "",
        hourlyRate: "",
        dailyRate: "",
        Condition: ""
    });
    const [activeTab, setActiveTab] = useState("Studio Equipment"); // 'Studio Equipment' or 'Add Equipment'

    const viewStudioList = [
        "Nature studio",
        "Mani studio",
        "Jothi studio",
        "AK studio",
    ]

    const addStudioList = [
        "Nature studio",
        "Mani studio",
        "Jothi studio",
        "AK studio",
    ]

    const equipmentList = [
        "Camera",
        "Lighting",
        "backdrop",
        "Props",
        "Lens",
        "Tripod",
        "Audio",
        "Other",
    ]

    const ConditionList = [
        "Excellent",
        "Good",
        "Fair",
    ]

    // --- Data for the Studio Cards ---
    const studioData = [
        {
            id: '1',
            equipment: 'camera stand',
            equipmentType: 'backdrop',
            desc: 'Hold your camera for hand free',
            hourPrice: '120',
            dayPrice: '1198',
            avaliable: '4',
            condition: 'Excellent',
            image: 'https://fotocentreindia.com/wp-content/uploads/2020/01/Ulanzi-MT-08-Extendable-Mini-Tripod-Online-Buy-Mumbai-India-4.jpg' // Placeholder image
        },
        {
            id: '2',
            equipment: 'Camera lens',
            equipmentType: 'backdrop',
            desc: 'f1.8 pro',
            hourPrice: '100',
            dayPrice: '1000',
            avaliable: '6',
            condition: 'Good',
            image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQffoQTJWbabG47mNsJsEE8PUiVEPx-XPvbwFklqWMiJ2u5wPPubzud4oS-JJKtCwS4SfBcq1gHG1JZorjn-hLc059j9dT-uIrtWMNJwUkZDRUnbViSxJWI'
        },
        {
            id: '3',
            equipment: 'Ring light',
            equipmentType: 'backdrop',
            desc: 'Ring light for face brightness',
            hourPrice: '60',
            dayPrice: '800',
            avaliable: '3',
            condition: 'Fair',
            image: 'https://atlas-content-cdn.pixelsquid.com/assets_v2/275/2750427660483040505/jpeg-600/G03.jpg'
        },
        {
            id: '4',
            equipment: 'Flash light',
            equipmentType: 'backdrop',
            desc: 'Back light for better brightnes photo',
            hourPrice: '150',
            dayPrice: '1500',
            avaliable: '2',
            condition: 'Good',
            image: 'https://3.imimg.com/data3/VH/BQ/GLADMIN-119035/photo-studio-equipment-250x250.jpg'
        },
    ];

    const onEditEquiPress = (item: any) => {
        setActiveTab("Add Equipment");
        setSelectedFile(item?.image ? { uri: item?.image } : '')
        setaddStudio({
            studioName: selectedStudio ? selectedStudio : '',
            equipmentName: item?.equipment ? item?.equipment : '',
            equipmentType: item?.equipmentType ? item?.equipmentType : '',
            equipmentDesc: item?.desc ? item?.desc : '',
            resolution: "",
            video: "",
            availableQuantity: item?.avaliable ? item?.avaliable : '',
            hourlyRate: item?.hourPrice ? item?.hourPrice : '',
            dailyRate: item?.dayPrice ? item?.dayPrice : '',
            Condition: item?.condition ? item?.condition : '',
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
        setaddStudio({
            studioName: "",
            equipmentName: "",
            equipmentType: "",
            equipmentDesc: "",
            resolution: "",
            video: "",
            availableQuantity: "",
            hourlyRate: "",
            dailyRate: "",
            Condition: ""
        })

        // move to list equipment tab

        setActiveTab("Studio Equipment");

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
                    <View style={styles.infoContainer}>
                        <Text style={styles.studioName}>{item.equipment} <Text style={styles.equipmentType}>({item.equipmentType})</Text></Text>
                        <Text style={styles.studioDesc}>{item.desc}</Text>
                        <Text style={styles.avaliable}>Price range:</Text>
                        <Text style={styles.avaliable}>Per hour: <Text style={styles.price}>₹ {item.hourPrice}</Text></Text>
                        <Text style={styles.avaliable}>Per Day: <Text style={styles.price}>₹ {item.dayPrice}</Text></Text>
                        <Text style={styles.avaliable}>Avaliable: <Text style={styles.price}>{item.avaliable} pieces</Text></Text>
                        <Text style={styles.avaliable}>Condition: <Text style={styles.price}>{item.condition}</Text></Text>
                    </View>

                    {/* Edit Button (Bordered)  */}
                    <TouchableOpacity onPress={() => onEditEquiPress(item)} style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>Edit</Text>
                    </TouchableOpacity>

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
                        activeTab === "Studio Equipment" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("Studio Equipment")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Studio Equipment" && styles.activeTabText,
                        ]}
                    >
                        Studio Equipment
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "Add Equipment" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("Add Equipment")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Add Equipment" && styles.activeTabText,
                        ]}
                    >
                        Add Equipment
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {activeTab === "Studio Equipment" ? <>

                    <Text style={styles.labelText} >Select a Studio to View Equipment<Text style={styles.required}> *</Text></Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedStudio} // Must match one of Picker.Item values
                            onValueChange={(value) => setSelectedStudio(value)}
                            dropdownIconColor="#034833" // Color of the arrow
                            style={{ color: '#101010' }} // Color of the selected text
                        >
                            <Picker.Item label="Select a studio" value="" />
                            {viewStudioList.map((studio, index) => (
                                <Picker.Item key={index} label={studio} value={studio} />
                            ))}
                        </Picker>
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
                </> :
                    <>
                        <Text style={styles.labelText} >Select a Studio<Text style={styles.required}> *</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={addStudio.studioName} // Must match one of Picker.Item values
                                onValueChange={(value) => setaddStudio({ ...addStudio, studioName: value })}
                                dropdownIconColor="#034833" // Color of the arrow
                                style={{ color: '#101010' }} // Color of the selected text
                            >
                                <Picker.Item label="Select a studio" value="" />
                                {addStudioList.map((studio, index) => (
                                    <Picker.Item key={index} label={studio} value={studio} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.labelText} >Equipment Image<Text style={styles.required}> *</Text></Text>
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
                                <Text style={styles.uploadTextHeader}>Upload Equipment Image</Text>
                                <Text style={styles.uploadTextDesc}>Click to browse your image</Text>
                                <Text style={styles.supportedFilesText}>
                                    Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
                                </Text>
                                <Text style={styles.chooseFilesText}>Choose File</Text>
                            </TouchableOpacity>}
                        <Text style={styles.labelText} >Equipment Name<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., Camera"
                            value={addStudio.equipmentName}
                            onChangeText={(text) =>
                                setaddStudio({ ...addStudio, equipmentName: text })
                            }
                        />
                        <Text style={styles.labelText} >Equipment Type<Text style={styles.required}> *</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={addStudio.equipmentType} // Must match one of Picker.Item values
                                onValueChange={(value) => setaddStudio({ ...addStudio, equipmentType: value })}
                                dropdownIconColor="#034833" // Color of the arrow
                                style={{ color: '#101010' }} // Color of the selected text
                            >
                                <Picker.Item label="Select a equipment type" value="" />
                                {equipmentList.map((equipment, index) => (
                                    <Picker.Item key={index} label={equipment} value={equipment} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.labelText} >Description</Text>

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., DSLR Camera with f1.8 pro and ect..."
                            multiline
                            value={addStudio.equipmentDesc}
                            onChangeText={(text) =>
                                setaddStudio({ ...addStudio, equipmentDesc: text })
                            }
                        />
                        <Text style={styles.labelText} >Resolution</Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., 45MP"
                            multiline
                            value={addStudio.resolution}
                            onChangeText={(text) =>
                                setaddStudio({ ...addStudio, resolution: text })
                            }
                        />
                        <Text style={styles.labelText} >Video</Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., 8K @ 30fps"
                            multiline
                            value={addStudio.video}
                            onChangeText={(text) =>
                                setaddStudio({ ...addStudio, video: text })
                            }
                        />
                        <Text style={styles.labelText} >Quantity Available<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            keyboardType="number-pad"
                            placeholder="e.g., 6"
                            value={addStudio.availableQuantity}
                            onChangeText={(text) =>
                                setaddStudio({ ...addStudio, availableQuantity: text })
                            }
                        />
                        <Text style={styles.labelText} >Hourly Rate (₹)<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            keyboardType="number-pad"
                            placeholder="e.g., 300"
                            value={addStudio.hourlyRate}
                            onChangeText={(text) =>
                                setaddStudio({ ...addStudio, hourlyRate: text })
                            }
                        />
                        <Text style={styles.labelText} >Daily Rate (₹)<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            keyboardType="number-pad"
                            placeholder="e.g., 5000"
                            value={addStudio.dailyRate}
                            onChangeText={(text) =>
                                setaddStudio({ ...addStudio, dailyRate: text })
                            }
                        />
                        <Text style={styles.labelText} >Condition<Text style={styles.required}> *</Text></Text>

                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={addStudio.Condition} // Must match one of Picker.Item values
                                onValueChange={(value) => setaddStudio({ ...addStudio, Condition: value })}
                                dropdownIconColor="#034833" // Color of the arrow
                                style={{ color: '#101010' }} // Color of the selected text
                            >
                                <Picker.Item label="Select a Condition" value="" />
                                {ConditionList.map((Condition, index) => (
                                    <Picker.Item key={index} label={Condition} value={Condition} />
                                ))}
                            </Picker>
                        </View>

                        {/* Save button section  */}
                        <TouchableOpacity onPress={createEquipment} style={styles.createButton}>
                            <Text style={styles.createButtonText}>Save equipment</Text>
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
        fontSize: 14,
        color: '#034833',
        marginTop: 2,
        fontWeight: '600'
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
        marginHorizontal: 10,
        marginBottom: 10,
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