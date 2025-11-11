import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import DashboardFilterPopup from "./DashboardFilter";
import { createStudioEquipThunk, getStudioEquipmentThunk, loadMyStudioThunk, updateStudioEquipThunk } from "../../features/studios/studiosSlice";
import { COLORS } from "../../constants";
import imagePaths from "../../constants/imagePaths";
import { Dropdown } from "react-native-element-dropdown";
import EquipmentsSkeleton from "../skeletonLoaders/StudioOwner/EquipmentsSkeleton";


// --- Main Component ---
export const ManageEquipmentComponent = () => {
    const dispatch = useDispatch();
    const [selectedStudio, setSelectedStudio] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [studioList, setStudioList] = useState([{ label: '', value: '' }]);
    const [isLoading, setIsLoading] = useState(false);
    const [editEquip, setEditEquip] = useState(false);
    const [editEquipId, setEditEquipId] = useState('');
    const [studioEquip, setStudioEquip] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [maxImageError, setMaxImageError] = useState('');
    const [showMaxImageError, setShowMaxImageError] = useState(false);
    const filterOptions = [
        { label: "Available", value: true }
    ];
    const [showFilter, setShowFilter] = useState(false);
    const [addStudio, setaddStudio] = useState({
        studioId: "",
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

    const equipmentList = [
        { label: "Camera", value: "camera" },
        { label: "Lighting", value: "lighting" },
        { label: "Backdrop", value: "backdrop" },
        { label: "Props", value: "props" },
        { label: "Lens", value: "lens" },
        { label: "Tripod", value: "tripod" },
        { label: "Audio", value: "audio" },
        { label: "Other", value: "other" },
    ];

    const ConditionList = [
        { label: "Excellent", value: "excellent" },
        { label: "Good", value: "good" },
        { label: "Fair", value: "fair" },
    ];

    const onFilterPress = () => {
        setShowFilter(!showFilter)
    }

    useEffect(() => {
        fetchStudios();
    }, []);

    useEffect(() => {
        fetchStudiosEquipments();
    }, [selectedStudio, selectedFilter])

    useEffect(() => {
        if (activeTab === "Studio Equipment") {
            clearStateValues();
            fetchStudiosEquipments();
        }
    }, [activeTab])

    const fetchStudios = async () => {
        setIsLoading(true);
        // { status: "inactive" }
        // let params = { include_stats: true }
        // if (selectedFilter) {
        //     params = { ...params, status: selectedFilter, }
        // }
        try {
            const studios = await dispatch(loadMyStudioThunk({ status: "active" })).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 Studios from API:', studios);

            // response looks like { studios: [ ... ], total: 16 }
            const studiosList = studios
                .map(studio => ({
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

    const fetchStudiosEquipments = async () => {
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
            params = { ...params, available_only: selectedFilter, }
        }

        try {
            const studiosEquipments = await dispatch(getStudioEquipmentThunk(params)).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 StudiosEquipments from API:', studiosEquipments);

            // response looks like { studiosEquipments: [ ... ], total: 16 }
            setStudioEquip(studiosEquipments || []);
        } catch (error) {
            console.log('❌ Failed to load studios bookings:', error);
        }
        finally {
            setIsLoading(false);
        }
    };


    const onEditEquiPress = (item: any) => {

        setActiveTab("Add Equipment");
        setEditEquip(true);
        setEditEquipId(item?.id ? item?.id : '')

        const selectedStudioName = studioList.find(
            (studio) => studio.value === selectedStudio
        )?.label || '';
        console.log(selectedStudioName, 'selectedStudioName');
        const itemStudioId = item?.id || selectedStudio || '';


        setaddStudio({
            studioId: itemStudioId,
            studioName: selectedStudioName ? selectedStudioName : '',
            equipmentName: item?.item_name ? item?.item_name : '',
            equipmentType: item?.item_type ? String(item?.item_type) : '',
            equipmentDesc: item?.description ? item?.description : '',
            resolution: item?.specifications?.resolution || '',
            video: item?.specifications?.video || '',
            availableQuantity: item?.quantity_available ? String(item?.quantity_available) : '',
            hourlyRate: item?.rental_price_hourly ? String(item?.rental_price_hourly) : '',
            dailyRate: item?.rental_price_daily ? String(item?.rental_price_daily) : '',
            Condition: item?.condition ? String(item?.condition) : '',
        });

        if (item?.equipment_images?.[0]?.image_url) {
            const formattedImages = item?.equipment_images?.map(img => ({
                ...img,
                uri: img.image_url,
            }));
            setSelectedImages(formattedImages);
        }
    }

    const handleDocumentPick = async () => {
        if (selectedImages.length == 10) {
            setMaxImageError('You can upload up to 10 images only.');
            setShowMaxImageError(true);
            setTimeout(() => {
                setShowMaxImageError(false);
            }, 3000);

        }
        else {
            const result = await launchImageLibrary({ mediaType: "photo", selectionLimit: 10 });

            if (!result.didCancel && result.assets && result.assets.length > 0) {
                setSelectedImages(result.assets); // store selected image info
            }
        }
    };


    const onAddEquiPress = () => {
        setActiveTab('Add Equipment')
    }

    const clearStateValues = () => {

        // set initial state value
        setaddStudio({
            studioId: "",
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

        // clear selected images values
        setSelectedImages([]);

        // move to list equipment tab

        setActiveTab("Studio Equipment");
        setEditEquip(false);
        setEditEquipId('');
    }

    const createOrEditEquipment = async () => {
        let studio_id = selectedStudio || ''
        try {

            if (!editEquip && !editEquipId) {
                if (addStudio?.studioId) {
                    studio_id = addStudio?.studioId

                }
                else {
                    Alert.alert('Please selecte a studio to add equipment')
                }

            }
            // 🧱 Build your base payload
            const payload = {
                studio_id: studio_id,
                item_name: addStudio.equipmentName,
                item_type: addStudio.equipmentType,
                description: addStudio.equipmentDesc,
                quantity_available: addStudio.availableQuantity,
                rental_price_hourly: addStudio.hourlyRate,
                rental_price_daily: addStudio.dailyRate,
                condition: addStudio.Condition,
                specifications: {
                    resolution: addStudio.resolution,
                    video: addStudio.video,
                },
            };

            // 🧠 Convert to FormData
            const formData = new FormData();

            formData.append('studio_id', payload.studio_id);
            formData.append('item_name', payload.item_name);
            formData.append('item_type', payload.item_type);
            formData.append('description', payload.description);
            formData.append('quantity_available', String(payload.quantity_available || 0));
            formData.append('rental_price_hourly', String(payload.rental_price_hourly || 0));
            formData.append('rental_price_daily', String(payload.rental_price_daily || 0));
            formData.append('condition', payload.condition || '');
            formData.append('specifications', JSON.stringify(payload.specifications));

            // 🖼️ Add image if available
            if (selectedImages?.length > 0) {
                selectedImages.forEach((image, index) => {
                    formData.append('images', {
                        uri: image.uri,
                        type: image.type || 'image/jpeg',
                        name: image.fileName || `equipment_image_${index}.jpg`,
                    });
                });
            }

            // 🧩 Add action and equipment_id if editing
            if (editEquip && editEquipId) {
                formData.append('action', 'update');
                formData.append('equipment_id', editEquipId);
                console.log('📦 Final Payload (Update):', formData);

                const response = await dispatch(updateStudioEquipThunk(formData)).unwrap();
                clearStateValues();
                console.log('✅ Equipment updated successfully:', response);
            } else {
                formData.append('action', 'add');
                console.log('📦 Final Payload (Add):', formData);

                const response = await dispatch(createStudioEquipThunk(formData)).unwrap();
                clearStateValues();
                console.log('✅ Equipment created successfully:', response);
            }
        } catch (error) {
            console.error('❌ Error submitting equipment:', error);
        }
    };



    const removeSelectedImage = (item: any) => {
        setSelectedImages((prevFiles: any[]) => prevFiles.filter(file => file.uri !== item.uri));

    }

    const renderImages = ({ item }: any) => (
        <View>
            <TouchableOpacity onPress={() => removeSelectedImage(item)} style={styles.imageDeSelect}>
                <Icon name="close" size={22} color="#034833" />
            </TouchableOpacity>
            <Image
                source={{ uri: item.image_url || item.uri }}
                style={styles.selectedImage}
                resizeMode="cover"
            />
        </View>
    )


    // --- Render Item Function for FlatList ---
    const renderStudioCard = ({ item }: any) => {

        let statusBgColor = '#FE9A55'; // default Pending orange
        if (item.available) statusBgColor = '#034833'; // green
        if (!item.available) statusBgColor = '#DC3545'; // red

        let statusText = 'Available';
        if (item.available) statusText = 'Available';
        if (!item.available) statusText = 'Unavailable';

        const imageSource = item?.equipment_images?.[0]?.image_url
            ? { uri: item.equipment_images[0].image_url }
            : imagePaths.StudioPlaceHolderImage;

        return (
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    {/* Studio Image */}
                    <Image
                        // Using a placeholder that simulates the image's structure
                        source={imageSource}
                        resizeMode="cover"
                        style={styles.cardImage}
                    />
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                        <Text style={styles.statusText}>{statusText}</Text>
                    </View>

                    {/* Text Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.studioName}>{item.item_name} <Text style={styles.equipmentType}>({item.item_type})</Text></Text>
                        <Text style={styles.studioDesc}>{item.description}</Text>
                        <Text style={styles.avaliable}>Price range:</Text>
                        <Text style={styles.avaliable}>Per hour: <Text style={{ ...styles.price, color: '#FF7441' }}>₹ {item.rental_price_hourly}</Text></Text>
                        <Text style={styles.avaliable}>Per Day: <Text style={{ ...styles.price, color: '#FF7441' }}>₹ {item.rental_price_daily}</Text></Text>
                        <Text style={styles.avaliable}>Avaliable: <Text style={styles.price}>{item.quantity_available} pieces</Text></Text>
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

        <View style={{ marginBottom: 350 }}>

            {/* Tabs */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        activeTab === "Studio Equipment" && styles.toggleButtonActive
                    ]}
                    onPress={() => setActiveTab("Studio Equipment")}
                >
                    <Icon
                        name="camera-alt"
                        size={16}
                        color={activeTab === "Studio Equipment" ? COLORS.background : COLORS.text.secondary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === "Studio Equipment" && styles.toggleButtonTextActive
                    ]}>
                        Studio Equipment
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        activeTab === "Add Equipment" && styles.toggleButtonActive
                    ]}
                    onPress={() => setActiveTab("Add Equipment")}
                >
                    <Icon
                        name={editEquip ? "edit" : "add-circle-outline"}
                        size={16}
                        color={activeTab === "Add Equipment" ? COLORS.background : COLORS.text.secondary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === "Add Equipment" && styles.toggleButtonTextActive
                    ]}>
                        {editEquip ? "Edit Equipment" : "Add Equipment"}
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {activeTab === "Studio Equipment" ? <>

                    <View style={styles.header}>
                        <Text style={styles.labelText} >Select Studio to View Equipment<Text style={styles.required}> *</Text></Text>
                        <TouchableOpacity onPress={onFilterPress} style={styles.addButton}>
                            <Icon name="filter-list" size={24} color="#1B4332" />
                            <Text style={styles.addButtonText}>Filter</Text>
                        </TouchableOpacity>
                    </View>
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

                    {/* Studio Cards Grid */}
                    {isLoading ? (
                        <FlatList
                            data={[1, 2, 3, 4]}
                            numColumns={2}
                            keyExtractor={(item) => item.toString()}
                            renderItem={() => <EquipmentsSkeleton />}
                            columnWrapperStyle={{ justifyContent: "space-between" }}
                            contentContainerStyle={{ paddingBottom: 80 }}
                        />
                    ) : (
                        <FlatList
                            data={studioEquip}
                            keyExtractor={(item) => item.id}
                            renderItem={renderStudioCard}
                            ListEmptyComponent={
                                <View style={styles.noStudioOutline}>
                                    <Icon name="handyman" size={60} color="#ccc" style={{ marginBottom: 10 }} />
                                    <Text style={styles.noStudioText}>
                                        No equipments found
                                    </Text>
                                    <Text style={styles.addStudioDesc}>
                                        Add new equipments to show
                                    </Text>
                                    <TouchableOpacity onPress={onAddEquiPress} style={styles.addStudioBtn}>
                                        <Icon name="add-circle-outline" size={24} color="#FFFFFF" />
                                        <Text style={styles.addStudioText}>Add equipment</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            numColumns={2} // Two columns for the grid layout
                            columnWrapperStyle={styles.row} // Style for the row wrapper
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </> :
                    <>
                        <Text style={styles.labelText} >Select a Studio<Text style={styles.required}> *</Text></Text>
                        {addStudio?.studioName && editEquip ?
                            <View style={styles.pickerWrapper}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>{addStudio?.studioName || '-'}</Text>
                                </View>
                            </View> :
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
                                value={addStudio.studioId}
                                onChange={(item) => {
                                    const selectedStudioObj = studioList.find(studio => studio.value === item.value);
                                    setaddStudio({
                                        ...addStudio,
                                        studioId: item.value,
                                        studioName: selectedStudioObj?.label || "",
                                    });
                                }}
                            />
                        }
                        <Text style={styles.labelText} >Equipment Image<Text style={styles.required}> *</Text></Text>

                        {selectedImages.length > 0 ? (
                            <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
                                <FlatList
                                    data={selectedImages}
                                    renderItem={renderImages}
                                    numColumns={2}
                                    keyExtractor={(item) => item.fileName}
                                    showsVerticalScrollIndicator={false}
                                />
                                {showMaxImageError && <Text style={{ ...styles.uploadText, ...styles.required }}>{maxImageError}</Text>}

                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
                                <Icon name="cloud-upload" size={28} color="#034833" />
                                <Text style={styles.uploadTextHeader}>Upload Equipment Images</Text>
                                <Text style={styles.uploadTextDesc}>Click to browse your images</Text>
                                <Text style={styles.supportedFilesText}>
                                    Supported formats: JPG, PNG, WebP. Max size: 5MB per image. Max 10 images.
                                </Text>
                                <Text style={styles.chooseFilesText}>Choose Files</Text>
                            </TouchableOpacity>
                        )}

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
                            placeholder="Select a equipment type"
                            value={addStudio.equipmentType}
                            onChange={(item) => {
                                setaddStudio({ ...addStudio, equipmentType: item.value });
                            }}
                        />
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

                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            containerStyle={styles.dropdownContainerStyle}
                            data={ConditionList}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select a equipment type"
                            value={addStudio.Condition}
                            onChange={(item) => {
                                setaddStudio({ ...addStudio, Condition: item.value });
                            }}
                        />

                        {/* Save button section  */}
                        <TouchableOpacity onPress={createOrEditEquipment} style={styles.createButton}>
                            <Text style={styles.createButtonText}>{editEquip ? "Update equipment" : "Create equipment"}</Text>
                        </TouchableOpacity>

                    </>
                }
            </ScrollView>
            <DashboardFilterPopup
                visible={showFilter}
                options={filterOptions}
                selectedValue={selectedFilter}
                onSelect={(val) => setSelectedFilter(val)}
                onApply={(val) => setSelectedFilter(val)}
                onClear={() => setSelectedFilter(null)}
                onClose={() => setShowFilter(false)}
            />
        </View>
    )
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    listContent: {
        paddingVertical: 10,
        paddingBottom: 80,
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
        marginBottom: 80,
        alignItems: "center",
    },
    createButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: "#BABABA",
        marginBottom: 12,
        marginTop: 10,
        borderRadius: 8,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderColor: "#BABABA",
        marginRight: 10,
        marginBottom: 10,
        borderRadius: 10,
    },
    imageDeSelect: {
        position: 'absolute',
        right: 15,
        top: 6,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#034833',
        zIndex: 1
    },
    selectedImageOutline: {
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    uploadText: {
        color: "#101010",
        fontWeight: "600",
        marginTop: 10
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
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
        fontSize: 12,
        fontWeight: '600',
    },
    infoRow: {
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        backgroundColor: "#ffffff",
    },

    infoLabel: {
        color: '#101010',
        fontSize: 14,
        fontWeight: "600",
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
});