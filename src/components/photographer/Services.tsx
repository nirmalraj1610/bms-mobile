import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../constants";
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch } from "react-redux";
import { useRoute } from "@react-navigation/native";
import { getUserData } from "../../lib/http";
import { getPhotographerServices } from "../../features/photographers/photographersSlice";
import imagePaths from "../../constants/imagePaths";


// --- Main Component ---
export const ServicesComponent = () => {
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [photographerServices, setPhotographerServices] = useState([]);
        const [editService, setEditService] = useState(false);
    const [editServiceId, setEditServiceId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [addService, setAddservice] = useState({
        photographyTitle: "",
        basePrice: "",
        serviceDesc: "",
        durationHours: "",
        serviceType: "",
        equipmentIncluded: [],
    });
    const [activeTab, setActiveTab] = useState("Services"); // 'Services' or 'Add Service'

const serviceTypeList = [
  { label: "Wedding", value: "Wedding" },
  { label: "Birthday", value: "Birthday" },
  { label: "Vacation", value: "Vacation" },
];

const equipmentList = [
  { label: "Camera", value: "Camera" },
  { label: "Lighting", value: "Lighting" },
  { label: "Lenses", value: "Lenses" },
  { label: "Tripod", value: "Tripod" },
];

    useEffect(() => {
        if (activeTab === "Services") {
            clearStateValues();
            fetchPhotographerService();
        }
    }, [activeTab]);

    const fetchPhotographerService = async () => {
        setIsLoading(true);
        const userData = await getUserData();
        const photographerId = userData?.customer?.customer_profiles?.customer_id
        
            //             {
            // photographer_id
    
            try {
                const serviceData = await dispatch(getPhotographerServices(photographerId)).unwrap(); // ✅ unwrap to get actual data
                console.log('📦 serviceData from API:', serviceData);
    
                // response looks like { serviceData: [ ... ], total: 16 }
                setPhotographerServices(serviceData?.services || []);
            } catch (error) {
                console.log('❌ Failed to load photographer services:', error);
            }
            finally {
                setIsLoading(false);
            }
        };

            const onAddServicesPress = () => {
        setActiveTab('Add Service')
    }

        const clearStateValues = () => {

        // set initial state value
        setAddservice({
        photographyTitle: "",
        basePrice: "",
        serviceDesc: "",
        durationHours: "",
        serviceType: "",
        equipmentIncluded: [],
    })

        // clear selected images values
        setSelectedImages([]);

        // move to list equipment tab

        setActiveTab("Services");
        setEditService(false);
        setEditServiceId('');
    }

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
        setEditService(true);
        setEditServiceId(item?.id ? item?.id : '')

        setAddservice({
            photographyTitle: item?.title ? item?.title : '',
            basePrice: item?.base_price ? String(item?.base_price) : '',
            serviceDesc: item?.description ? item?.description : '',
            durationHours: item?.duration_hours ? String(item?.duration_hours) : '',
            serviceType: item?.service_type ? String(item?.service_type) : '',
            equipmentIncluded: item?.equipment_included ? item?.equipment_included : [],
        });

        // if (item?.equipment_images?.[0]?.image_url) {
        //     const formattedImages = item?.equipment_images?.map(img => ({
        //         ...img,
        //         uri: img.image_url,
        //     }));
        //     setSelectedImages(formattedImages);
        // }
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
            equipmentIncluded: [],
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
                        source={imagePaths.PhotographerPlaceHolderImage}
                        resizeMode="cover"
                        style={styles.cardImage}
                    />

                    {/* Text Info */}
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.studioName}>{item.title}</Text>
                        <Text style={styles.studioDesc}>{item.description}</Text>
                        <Text style={styles.avaliable}>Duration : <Text style={{ ...styles.avaliable, fontWeight: '600' }}> {item.duration_hours} hours</Text></Text>
                        <Text style={styles.avaliable}>Service : <Text style={{ ...styles.avaliable, fontWeight: '600' }}>{item.service_type}</Text></Text>
                        <Text style={styles.avaliable}>Equipments included:</Text>
                        {item.equipment_included?.length > 0 ? (
  <Text style={{ ...styles.avaliable, fontWeight: '600' }}>
    {item.equipment_included.join(', ')}
  </Text>
) : null}
                        <Text style={styles.avaliable}>Base Price : <Text style={styles.price}>₹ {item.base_price}</Text></Text>

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
         <>
                    {
                        isLoading ?
                            <View style={styles.loading}>
                                <ActivityIndicator size="large" color="#034833" />
                                <Text style={styles.loadingText}>Loading....</Text>
                            </View> :
        <View style={{ marginBottom: 400 }}>

            {/* Tabs */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        activeTab === "Services" && styles.toggleButtonActive
                    ]}
                    onPress={() => setActiveTab("Services")}
                >
                    <Icon
                        name="handyman"
                        size={16}
                        color={activeTab === "Services" ? COLORS.background : COLORS.text.secondary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === "Services" && styles.toggleButtonTextActive
                    ]}>
                        Services
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        activeTab === "Add Service" && styles.toggleButtonActive
                    ]}
                    onPress={() => setActiveTab("Add Service")}
                >
                    <Icon
                        name={editService ? "edit" : "add-circle-outline"}
                        size={16}
                        color={activeTab === "Add Service" ? COLORS.background : COLORS.text.secondary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === "Add Service" && styles.toggleButtonTextActive
                    ]}>
                    {editService ? "Edit service" : "Add service"}
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {activeTab === "Services" ? <>

                    {/* Studio Cards Grid */}
                    <FlatList
                        data={photographerServices}
                        keyExtractor={(item) => item.id}
                        renderItem={renderStudioCard}
                         ListEmptyComponent={
                                                                <View style={styles.noStudioOutline}>
                                                                    <Icon name="handyman" size={60} color="#ccc" style={{ marginBottom: 10 }} />
                                                                    <Text style={styles.noStudioText}>
                                                                        Services not found
                                                                    </Text>
                                                                    <Text style={styles.addStudioDesc}>
                                                                        Add new services to show
                                                                    </Text>
                                                                    <TouchableOpacity onPress={onAddServicesPress} style={styles.addStudioBtn}>
                                                                        <Icon name="add-circle-outline" size={24} color="#FFFFFF" />
                                                                        <Text style={styles.addStudioText}>Add services</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            }
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
                        <Dropdown
                                                                style={styles.dropdown}
                                                                placeholderStyle={styles.placeholderStyle}
                                                                selectedTextStyle={styles.selectedTextStyle}
                                                                inputSearchStyle={styles.inputSearchStyle}
                                                                containerStyle={styles.dropdownContainerStyle}
                                                                data={serviceTypeList}
                                                                maxHeight={300}
                                                                labelField="label"
                                                                valueField="value"
                                                                placeholder="Select a equipment type"
                                                                value={addService.serviceType}
                                                                onChange={(item) => {
                                                                    setAddservice({ ...addService, serviceType: item.label });
                                                                }}
                                                            />
                        <Text style={styles.labelText} >Equipment Included<Text style={styles.required}> *</Text></Text>
                        {/* <Dropdown
                                                                style={styles.dropdown}
                                                                placeholderStyle={styles.placeholderStyle}
                                                                selectedTextStyle={styles.selectedTextStyle}
                                                                inputSearchStyle={styles.inputSearchStyle}
                                                                containerStyle={styles.dropdownContainerStyle}
                                                                data={equipmentList}
                                                                maxHeight={300}
                                                                labelField="label"
                                                                valueField="value"
                                                                placeholder="Select a equipment type"
                                                                value={addService.equipmentIncluded}
                                                                onChange={(item) => {
                                                                    setAddservice({ ...addService, equipmentIncluded: item.value });
                                                                }}
                                                            /> */}

                                                            <Dropdown
  style={styles.dropdown}
  placeholderStyle={styles.placeholderStyle}
  selectedTextStyle={styles.selectedTextStyle}
  inputSearchStyle={styles.inputSearchStyle}
  containerStyle={styles.dropdownContainerStyle}
  data={equipmentList}
  maxHeight={300}
  labelField="label"
  valueField="value"
  placeholder="Select equipment type(s)"
  value={addService.equipmentIncluded}
  onChange={(selectedItems) => {
    setAddservice({ ...addService, equipmentIncluded: selectedItems });
  }}
  multiple={true} // ✅ enable multiple selection
  renderSelectedItem={(item, unSelect) => (
    <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}>
        <Text style={{ fontSize: 14 }}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  )}
/>
                        {/* Save button section  */}
                        <TouchableOpacity onPress={createEquipment} style={styles.createButton}>
                            <Text style={styles.createButtonText}>{editService ? 'Update service'  : "Add service"}</Text>
                        </TouchableOpacity>

                    </>
                }
            </ScrollView>
        </View>}
        </>
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
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 25,
        borderColor: COLORS.bg,
        borderWidth: 1,
        padding: 8,
        marginTop: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 18,
        backgroundColor: 'transparent',
    },
    toggleButtonActive: {
        backgroundColor: COLORS.bg,
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginLeft: 6,
    },
    toggleButtonTextActive: {
        color: COLORS.background,
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
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#101010',
        fontWeight: '600',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
        color: '#101010',
        borderRadius: 10
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
    noStudioOutline: {
        alignItems: 'center',
        marginVertical: 30
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
});