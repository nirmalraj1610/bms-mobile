import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import DashboardFilterPopup from "./DashboardFilter";
import { createStudioEquipThunk, getStudioEquipmentThunk, loadMyStudioThunk, updateStudioEquipThunk } from "../../features/studios/studiosSlice";
import { COLORS } from "../../constants";
import imagePaths from "../../constants/imagePaths";
import { Dropdown } from "react-native-element-dropdown";
import EquipmentsSkeleton from "../skeletonLoaders/StudioOwner/EquipmentsSkeleton";
import { typography } from "../../constants/typography";
import { showError, showSuccess } from "../../utils/helperFunctions";


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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // pull to refresh
    const [refreshing, setRefreshing] = useState(false);

    const filterOptions = [
        { label: "Available", value: true }
    ];
    const [showFilter, setShowFilter] = useState(false);
    const [addEquipment, setaddEquipment] = useState({
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

    const [addEquipmentError, setaddEquipmentError] = useState({
        studioId: false,
        studioName: false,
        equipmentName: false,
        equipmentType: false,
        equipmentDesc: false,
        availableQuantity: false,
        hourlyRate: false,
        dailyRate: false,
        Condition: false
    });

    const [activeTab, setActiveTab] = useState("Equipments"); // 'Equipments' or 'Add Equipment'

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
        if (activeTab === "Equipments") {
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

            // response looks like { studios: [ ... ], total: 16 }
            const studiosList = studios
                .map((studio: any) => ({
                    label: studio.name,
                    value: studio.id,
                }));

            setStudioList(studiosList || []);
            setSelectedStudio(studiosList[0]?.value);
        } catch (error) {
            console.error('❌ Failed to load studios:', error);
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

            // response looks like { studiosEquipments: [ ... ], total: 16 }
            setStudioEquip(studiosEquipments || []);
        } catch (error) {
            console.error('❌ Failed to load studios bookings:', error);
        }
        finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStudiosEquipments();
    }


    const onEditEquiPress = (item: any) => {

        setActiveTab("Add Equipment");
        setEditEquip(true);
        setEditEquipId(item?.id ? item?.id : '')

        const selectedStudioName = studioList.find(
            (studio) => studio.value === selectedStudio
        )?.label || '';

        const itemStudioId = item?.id || selectedStudio || '';


        setaddEquipment({
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
        setaddEquipment({
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

        setActiveTab("Equipments");
        setEditEquip(false);
        setEditEquipId('');
    }

    const createOrEditEquipment = async () => {
        setIsSubmitting(true);
        let studio_id = selectedStudio || ''
        try {

            if (!editEquip && !editEquipId) {
                if (addEquipment?.studioId) {
                    studio_id = addEquipment?.studioId

                }
            }

            // 🧩 Validate Tab 4 — Images/Policies
            const newErrors = {
                studioId: !studio_id,
                studioName: !addEquipment?.studioName,
                equipmentName: !addEquipment?.equipmentName,
                equipmentType: !addEquipment?.equipmentType,
                equipmentDesc: !addEquipment?.equipmentDesc,
                availableQuantity: !addEquipment?.availableQuantity,
                hourlyRate: !addEquipment?.hourlyRate,
                dailyRate: !addEquipment?.dailyRate,
                Condition: !addEquipment?.Condition
            };

            setaddEquipmentError(newErrors);

            // ❌ If any value is empty → show alert and stop
            if (Object.values(newErrors).includes(true)) {
                showError('Please fill all the required fields!...');
                setIsSubmitting(false);
                return;
            }

            // 🧱 Build your base payload
            const payload = {
                studio_id: studio_id,
                item_name: addEquipment.equipmentName,
                item_type: addEquipment.equipmentType,
                description: addEquipment.equipmentDesc,
                quantity_available: addEquipment.availableQuantity,
                rental_price_hourly: addEquipment.hourlyRate,
                rental_price_daily: addEquipment.dailyRate,
                condition: addEquipment.Condition,
                specifications: {
                    resolution: addEquipment.resolution,
                    video: addEquipment.video,
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

                const response = await dispatch(updateStudioEquipThunk(formData)).unwrap();
                clearStateValues();
                showSuccess('Equipment updated successfully!...');
            } else {
                formData.append('action', 'add');

                const response = await dispatch(createStudioEquipThunk(formData)).unwrap();
                clearStateValues();
                showSuccess('Equipment created successfully!...');
            }
        } catch (error) {
            showError('Something went wrong!...');
            console.error('❌ Error submitting equipment:', error);
        }
        finally {
            setIsSubmitting(false);
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
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                    <Text style={styles.statusText}>{statusText}</Text>
                </View>
                <View style={styles.card}>
                    {/* Studio Image */}
                    <Image
                        // Using a placeholder that simulates the image's structure
                        source={imageSource}
                        resizeMode="cover"
                        style={styles.cardImage}
                    />

                    {/* Text Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.studioName}>{item.item_name} <Text style={styles.equipmentType}>({item.item_type})</Text></Text>
                        <Text numberOfLines={3} style={styles.studioDesc}>{item.description}</Text>
                        <View style={styles.infoContainerRow}>
                            <View style={{ alignItems: 'flex-start', width: '50%' }}>
                                <Text style={styles.avaliable}>Per hour: <Text style={{ ...styles.price, color: '#FF7441' }}>₹ {item.rental_price_hourly}</Text></Text>
                                <Text style={styles.avaliable}>Per Day: <Text style={{ ...styles.price, color: '#FF7441' }}>₹ {item.rental_price_daily}</Text></Text>
                            </View>
                            <View style={{ alignItems: 'flex-start', width: '50%' }}>
                                <Text style={styles.avaliable}>Avaliable: <Text style={styles.price}>{item.quantity_available} pieces</Text></Text>
                                <Text style={styles.avaliable}>Condition: <Text style={styles.price}>{item.condition}</Text></Text>
                            </View>
                        </View>
                        <View style={styles.infoContainerRow}>
                            <View style={{ alignItems: 'flex-start', width: '50%' }}>
                            </View>
                            <View style={{ alignItems: 'flex-start', width: '50%' }}>
                                {/* Edit Button (Bordered)  */}
                                <TouchableOpacity onPress={() => onEditEquiPress(item)} style={styles.viewButton}>
                                    <Text style={styles.viewButtonText}>Edit equipment</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

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
                        activeTab === "Equipments" && styles.toggleButtonActive
                    ]}
                    onPress={() => setActiveTab("Equipments")}
                >
                    <Icon
                        name="handyman"
                        size={16}
                        color={activeTab === "Equipments" ? COLORS.background : COLORS.text.secondary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === "Equipments" && styles.toggleButtonTextActive
                    ]}>
                        Equipments
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
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={activeTab === "Equipments" ?
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#034833"]}      // Android
                    /> : null}
            >
                {activeTab === "Equipments" ? <>

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
                            data={[1, 2, 3, 4, 5]}
                            keyExtractor={(item) => item.toString()}
                            renderItem={() => <EquipmentsSkeleton />}
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
                                    <Text style={styles.addEquipmentDesc}>
                                        Add new equipments to show
                                    </Text>
                                    <TouchableOpacity onPress={onAddEquiPress} style={styles.addEquipmentBtn}>
                                        <Icon name="add-circle-outline" size={24} color="#FFFFFF" />
                                        <Text style={styles.addEquipmentText}>Add equipment</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </> :
                    <>
                        <Text style={styles.labelText} >Select a Studio<Text style={styles.required}> *</Text></Text>
                        {addEquipment?.studioName && editEquip ?
                            <View style={styles.pickerWrapper}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>{addEquipment?.studioName || '-'}</Text>
                                </View>
                            </View> :
                            <Dropdown
                                style={[styles.dropdown, { borderColor: addEquipmentError.studioName ? "#DC3545" : "#BABABA" }]}
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
                                value={addEquipment.studioId}
                                onChange={(item) => {
                                    const selectedStudioObj = studioList.find(studio => studio.value === item.value);
                                    setaddEquipment({
                                        ...addEquipment,
                                        studioId: item.value,
                                        studioName: selectedStudioObj?.label || "",
                                    });
                                    setaddEquipmentError({ ...addEquipmentError, studioName: false, studioId: false });
                                }}
                            />
                        }
                        {addEquipmentError.studioName && (
                            <Text style={styles.errorText}>Studio Name is required</Text>
                        )}
                        <Text style={styles.labelText} >Equipment Image</Text>

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
                            style={[
                                styles.input,
                                { borderColor: addEquipmentError.equipmentName ? "#DC3545" : "#BABABA" }
                            ]}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., Camera"
                            value={addEquipment.equipmentName}
                            onChangeText={(text) => {
                                setaddEquipment({ ...addEquipment, equipmentName: text });
                                setaddEquipmentError({ ...addEquipmentError, equipmentName: false });
                            }}
                        />
                        {addEquipmentError.equipmentName && (
                            <Text style={styles.errorText}>Equipment Name is required</Text>
                        )}
                        <Text style={styles.labelText} >Equipment Type<Text style={styles.required}> *</Text></Text>
                        <Dropdown
                            style={[styles.dropdown, { borderColor: addEquipmentError.equipmentType ? "#DC3545" : "#BABABA" }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            containerStyle={styles.dropdownContainerStyle}
                            data={equipmentList}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select a equipment type"
                            value={addEquipment.equipmentType}
                            onChange={(item) => {
                                setaddEquipment({ ...addEquipment, equipmentType: item.value });
                                setaddEquipmentError({ ...addEquipmentError, equipmentType: false });
                            }}
                        />
                        {addEquipmentError.equipmentType && (
                            <Text style={styles.errorText}>Equipment Type is required</Text>
                        )}
                        <Text style={styles.labelText} >Equipment description<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={{ ...styles.input, ...styles.textArea, borderColor: addEquipmentError.equipmentDesc ? "#DC3545" : "#BABABA" }}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., DSLR Camera with f1.8 pro and ect..."
                            multiline
                            value={addEquipment.equipmentDesc}
                            onChangeText={(text) => {
                                setaddEquipment({ ...addEquipment, equipmentDesc: text });
                                setaddEquipmentError({ ...addEquipmentError, equipmentDesc: false });
                            }}
                        />
                        {addEquipmentError.equipmentDesc && (
                            <Text style={styles.errorText}>Equipment description is required</Text>
                        )}
                        <Text style={styles.labelText} >Resolution</Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., 45MP"
                            multiline
                            value={addEquipment.resolution}
                            onChangeText={(text) =>
                                setaddEquipment({ ...addEquipment, resolution: text })
                            }
                        />
                        <Text style={styles.labelText} >Video</Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., 8K @ 30fps"
                            multiline
                            value={addEquipment.video}
                            onChangeText={(text) =>
                                setaddEquipment({ ...addEquipment, video: text })
                            }
                        />
                        <Text style={styles.labelText} >Quantity Available<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={[
                                styles.input,
                                { borderColor: addEquipmentError.availableQuantity ? "#DC3545" : "#BABABA" }
                            ]}
                            placeholderTextColor={'#898787'}
                            keyboardType="number-pad"
                            placeholder="e.g., 6"
                            value={addEquipment.availableQuantity}
                            onChangeText={(text) => {
                                setaddEquipment({ ...addEquipment, availableQuantity: text });
                                setaddEquipmentError({ ...addEquipmentError, availableQuantity: false });
                            }}
                        />
                        {addEquipmentError.availableQuantity && (
                            <Text style={styles.errorText}>Quantity Available is required</Text>
                        )}
                        <Text style={styles.labelText} >Hourly Rate (₹)<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={[
                                styles.input,
                                { borderColor: addEquipmentError.hourlyRate ? "#DC3545" : "#BABABA" }
                            ]}
                            placeholderTextColor={'#898787'}
                            keyboardType="number-pad"
                            placeholder="e.g., 300"
                            value={addEquipment.hourlyRate}
                            onChangeText={(text) => {
                                setaddEquipment({ ...addEquipment, hourlyRate: text });
                                setaddEquipmentError({ ...addEquipmentError, hourlyRate: false });
                            }}
                        />
                        {addEquipmentError.hourlyRate && (
                            <Text style={styles.errorText}>Hourly Rate is required</Text>
                        )}
                        <Text style={styles.labelText} >Daily Rate (₹)<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={[
                                styles.input,
                                { borderColor: addEquipmentError.dailyRate ? "#DC3545" : "#BABABA" }
                            ]}
                            placeholderTextColor={'#898787'}
                            keyboardType="number-pad"
                            placeholder="e.g., 5000"
                            value={addEquipment.dailyRate}
                            onChangeText={(text) => {
                                setaddEquipment({ ...addEquipment, dailyRate: text });
                                setaddEquipmentError({ ...addEquipmentError, dailyRate: false });
                            }}
                        />
                        {addEquipmentError.dailyRate && (
                            <Text style={styles.errorText}>Daily Rate is required</Text>
                        )}
                        <Text style={styles.labelText} >Equipment Condition<Text style={styles.required}> *</Text></Text>

                        <Dropdown
                            style={[styles.dropdown, { borderColor: addEquipmentError.Condition ? "#DC3545" : "#BABABA" }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            containerStyle={styles.dropdownContainerStyle}
                            data={ConditionList}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select a equipment Condition"
                            value={addEquipment.Condition}
                            onChange={(item) => {
                                setaddEquipment({ ...addEquipment, Condition: item.value });
                                setaddEquipmentError({ ...addEquipmentError, Condition: false });
                            }}
                        />
                        {addEquipmentError.Condition && (
                            <Text style={styles.errorText}>Equipment Condition is required</Text>
                        )}

                        {/* Save button section  */}
                        <TouchableOpacity disabled={isSubmitting} onPress={createOrEditEquipment} style={styles.createButton}>
                            <Text style={styles.createButtonText}>{
                                isSubmitting
                                    ? (editEquip ? "Updating equipment" : "Creating equipment")
                                    : (editEquip ? "Update equipment" : "Create equipment")
                            }</Text>
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
        marginVertical: 25
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#00000026',
    },
    infoContainer: {
        paddingTop: 10,
    },
    cardImage: {
        width: '100%',
        borderRadius: 12,
        height: 140, // Height of the image section
        resizeMode: 'cover',
    },
    infoContainerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    studioName: {
        fontSize: 14,
        color: '#034833',
        ...typography.extrabold
    },
    studioDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        ...typography.semibold
    },
    equipmentType: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
        ...typography.semibold
    },
    avaliable: {
        fontSize: 14,
        color: '#101010',
        marginTop: 2,
        ...typography.semibold
    },
    price: {
        fontSize: 14,
        color: '#034833',
        marginTop: 2,
        ...typography.bold
    },
    labelText: {
        color: '#101010',
        fontSize: 14,
        marginTop: 12,
        marginBottom: 6,
        ...typography.bold
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 12,
    },
    required: {
        color: '#DC3545'
    },
    errorText: {
        color: '#DC3545',
        fontSize: 12,
        ...typography.semibold,
    },
    input: {
        borderWidth: 1,
        borderColor: "#BABABA",
        color: '#101010',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        backgroundColor: "#ffffff",
        ...typography.bold
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    viewButton: {
        width: '100%',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        backgroundColor: '#1B4332',
    },
    viewButtonText: {
        fontSize: 13,
        color: '#FFFFFF',
        ...typography.bold
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
        fontSize: 16,
        ...typography.bold
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
        marginTop: 10,
        ...typography.bold
    },
    uploadTextHeader: {
        color: "#101010",
        fontSize: 16,
        marginTop: 10,
        ...typography.bold
    },
    uploadTextDesc: {
        fontSize: 13,
        color: "#555",
        marginTop: 5,
        ...typography.semibold
    },
    supportedFilesText: {
        fontSize: 12,
        color: "#777",
        marginTop: 5,
        textAlign: "center",
        ...typography.semibold
    },
    chooseFilesText: {
        marginTop: 10,
        color: "#034833",
        ...typography.bold
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
        fontSize: 16,
        ...typography.bold
    },
    noStudioText: {
        fontSize: 16,
        color: '#666',
        ...typography.bold
    },
    addEquipmentDesc: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
        ...typography.semibold
    },
    addEquipmentBtn: {
        marginTop: 10,
        backgroundColor: '#034833',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 6,
    },
    addEquipmentText: {
        marginLeft: 10,
        color: '#fff',
        fontSize: 16,
        ...typography.bold
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#1B4332',
        ...typography.bold,
        fontSize: 16,
        marginLeft: 4,
        marginRight: 10
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
        ...typography.regular,
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
        ...typography.bold
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
        color: COLORS.text.secondary,
        marginLeft: 6,
        ...typography.semibold
    },
    toggleButtonTextActive: {
        color: COLORS.background,
        ...typography.bold
    },
    dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#999',
        ...typography.bold
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#101010',
        ...typography.bold
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
        color: '#101010',
        borderRadius: 10,
        ...typography.bold
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