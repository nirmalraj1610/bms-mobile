import { Picker } from "@react-native-picker/picker";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch } from "react-redux";
import { createStudio } from "../../features/studios/studios.service";
import { createStudioThunk, updateStudioThunk } from "../../features/studios/studiosSlice";
import { useNavigation } from "@react-navigation/native";

const AddStudioComponent = ({
  editStudio = false,
  onPressSelectmenu = (i:any) => {},
  editStudioValues = {},
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [selectedTab, setSelectedTab] = useState(1);
  const flatListRef = useRef<FlatList>(null);
  const [selectedFile, setSelectedFile] = useState([]);
  const [maxImageError, setMaxImageError] = useState('');
  const [showMaxImageError, setShowMaxImageError] = useState(false);
  const [termsSelected, setTermsSelected] = useState(false);
  const [showPicker, setShowPicker] = useState<{ id: number; type: "open" | "close" } | null>(null);

  const [days, setDays] = useState([
    { id: 1, name: "Monday", selected: false, openTime: null, closeTime: null },
    { id: 2, name: "Tuesday", selected: false, openTime: null, closeTime: null },
    { id: 3, name: "Wednesday", selected: false, openTime: null, closeTime: null },
    { id: 4, name: "Thursday", selected: false, openTime: null, closeTime: null },
    { id: 5, name: "Friday", selected: false, openTime: null, closeTime: null },
    { id: 6, name: "Saturday", selected: false, openTime: null, closeTime: null },
    { id: 7, name: "Sunday", selected: false, openTime: null, closeTime: null },
  ]);
  const [basicInfo, setBasicInfo] = useState({
    studioName: "",
    studioType: "",
    studioDesc: "",
    studioAddress: "",
    state: "",
    city: "",
    pinCode: "",
    landMark: "",
  });

  const [details, setDetails] = useState({
    studioSize: "",
    maximumPeople: "",
    minBookingHours: "",
    maxBookingHours: "",
    basePrice: "",
    weekendPrice: "",
    overtimePrice: "",
    securityDeposit: "",
    contactPhone: "",
    alternatePhone: "",
  });

  const [amenities, setAmenities] = useState([
    { id: 1, name: "Professional Lighting Setup", selected: false },
    { id: 2, name: "Props & Accessories", selected: false },
    { id: 3, name: "Makeup Station", selected: false },
    { id: 4, name: "Changing Room", selected: false },
    { id: 5, name: "Air Conditioning", selected: false },
    { id: 6, name: "Parking Available", selected: false },
    { id: 7, name: "Refreshments", selected: false },
    { id: 8, name: "Sound System", selected: false },
    { id: 9, name: "Green Screen", selected: false },
    { id: 10, name: "Cyclorama Wall", selected: false },
    { id: 11, name: "Natural Light", selected: false },
    { id: 12, name: "Storage Space", selected: false },
    { id: 13, name: "Client Lounge", selected: false },
  ]);

  const [equipments, setEquipments] = useState([
    { id: 1, name: "Canon DSLR Cameras", selected: false },
    { id: 2, name: "Sony Mirrorless Cameras", selected: false },
    { id: 3, name: "Nikon Professional Cameras", selected: false },
    { id: 4, name: "Profoto Flash Systems", selected: false },
    { id: 5, name: "Godox LED Lights", selected: false },
    { id: 6, name: "Softbox Light Modifiers", selected: false },
    { id: 7, name: "Reflectors & Diffusers", selected: false },
    { id: 8, name: "Tripods & Stands", selected: false },
    { id: 9, name: "Backdrop Support System", selected: false },
    { id: 10, name: "Light Meters", selected: false },
    { id: 11, name: "Wireless Triggers", selected: false },
    { id: 12, name: "Extension Cords & Power", selected: false },
    { id: 13, name: "Sandbags & Clamps", selected: false },
    { id: 14, name: "Memory Cards", selected: false },
    { id: 15, name: "Lens Cleaning Kit", selected: false },
  ]);

  useEffect(() => {
    if (editStudio && editStudioValues) {
      setStudioValues();
      console.log(editStudio , editStudioValues);
      
    }
  }, [editStudio])

  const setStudioValues = () => {

    // clear basic info
    setBasicInfo({
      studioName: editStudioValues?.name || '',
      studioType: "",
      studioDesc: editStudioValues?.description || '',
      studioAddress: editStudioValues?.location?.address || '',
      state: editStudioValues?.location?.state || '',
      city: editStudioValues?.location?.city || '',
      pinCode: String(editStudioValues?.location?.pincode) || '',
      landMark: "",
    });

    // set details value
    setDetails({
      studioSize: "",
      maximumPeople: "",
      minBookingHours: String(editStudioValues?.pricing?.minimum_hours) || '',
      maxBookingHours: "",
      basePrice: String(editStudioValues?.pricing?.hourly_rate) || '',
      weekendPrice: String(editStudioValues?.pricing?.weekend_multiplier) || '',
      overtimePrice: String(editStudioValues?.pricing?.extra_hour_rate) || '',
      securityDeposit: "",
      contactPhone: "",
      alternatePhone: "",
    });

    // set amenities values
    const selectedFromAPI = editStudioValues?.amenities || [];

    // Mark dynamically as selected
    const updatedAmenities = amenities.map(item => ({
      ...item,
      selected: selectedFromAPI.includes(item.name),
    }));

    setAmenities(updatedAmenities);

    setAmenities(updatedAmenities);

  }

  const clearAllStates = () => {
    // clear edit statevalues
      editStudio = false,
      editStudioValues = {},

      // clear days value
      setDays([
        { id: 1, name: "Monday", selected: false, openTime: null, closeTime: null },
        { id: 2, name: "Tuesday", selected: false, openTime: null, closeTime: null },
        { id: 3, name: "Wednesday", selected: false, openTime: null, closeTime: null },
        { id: 4, name: "Thursday", selected: false, openTime: null, closeTime: null },
        { id: 5, name: "Friday", selected: false, openTime: null, closeTime: null },
        { id: 6, name: "Saturday", selected: false, openTime: null, closeTime: null },
        { id: 7, name: "Sunday", selected: false, openTime: null, closeTime: null },
      ]);

    // clear basic info
    setBasicInfo({
      studioName: "",
      studioType: "",
      studioDesc: "",
      studioAddress: "",
      state: "",
      city: "",
      pinCode: "",
      landMark: "",
    });

    // clear details value
    setDetails({
      studioSize: "",
      maximumPeople: "",
      minBookingHours: "",
      maxBookingHours: "",
      basePrice: "",
      weekendPrice: "",
      overtimePrice: "",
      securityDeposit: "",
      contactPhone: "",
      alternatePhone: "",
    });

    // clear amenities values
    setAmenities([
      { id: 1, name: "Professional Lighting Setup", selected: false },
      { id: 2, name: "Props & Accessories", selected: false },
      { id: 3, name: "Makeup Station", selected: false },
      { id: 4, name: "Changing Room", selected: false },
      { id: 5, name: "Air Conditioning", selected: false },
      { id: 6, name: "Parking Available", selected: false },
      { id: 7, name: "Refreshments", selected: false },
      { id: 8, name: "Sound System", selected: false },
      { id: 9, name: "Green Screen", selected: false },
      { id: 10, name: "Cyclorama Wall", selected: false },
      { id: 11, name: "Natural Light", selected: false },
      { id: 12, name: "Storage Space", selected: false },
      { id: 13, name: "Client Lounge", selected: false },
    ]);

    // clear equipments values
    setEquipments([
      { id: 1, name: "Canon DSLR Cameras", selected: false },
      { id: 2, name: "Sony Mirrorless Cameras", selected: false },
      { id: 3, name: "Nikon Professional Cameras", selected: false },
      { id: 4, name: "Profoto Flash Systems", selected: false },
      { id: 5, name: "Godox LED Lights", selected: false },
      { id: 6, name: "Softbox Light Modifiers", selected: false },
      { id: 7, name: "Reflectors & Diffusers", selected: false },
      { id: 8, name: "Tripods & Stands", selected: false },
      { id: 9, name: "Backdrop Support System", selected: false },
      { id: 10, name: "Light Meters", selected: false },
      { id: 11, name: "Wireless Triggers", selected: false },
      { id: 12, name: "Extension Cords & Power", selected: false },
      { id: 13, name: "Sandbags & Clamps", selected: false },
      { id: 14, name: "Memory Cards", selected: false },
      { id: 15, name: "Lens Cleaning Kit", selected: false },
    ]);

    onPressSelectmenu('Dashboard')
  }

  const [images, setImages] = useState({
    cancellationPolicy: "",
    paymentPolicy: "",
    additionalRules: "",
  });

  const studioTypes = [
    "Portrait studio",
    "Fashion studio",
    "Product photography studio",
    "Wedding studio",
    "Commercial studio",
    "Multi-purpose studio",
  ]

  const minBookingHours = [
    { label: "1 Hour", value: "1" },
    { label: "2 Hours", value: "2" },
    { label: "3 Hours", value: "3" },
    { label: "4 Hours", value: "4" },
  ];

  const maxBookingHours = [
    { label: "8 Hours", value: "8" },
    { label: "10 Hours", value: "10" },
    { label: "12 Hours", value: "12" },
    { label: "24 Hours", value: "24" },
  ];

  const cancellationPolicy = [
    "Free cancellation upto 24 hours",
    "Free cancellation upto 48 hours",
    "Free cancellation upto 72 hours",
    "Strict-No cancellation",
  ]

  const paymentPolicy = [
    "50% advance payment required",
    "100% advance payment required",
    "Flexible payment terms",
  ]

  const tabs = [
    { id: 1, name: "Basic Info" },
    { id: 2, name: "Details" },
    { id: 3, name: "Amenities" },
    { id: 4, name: "Images" },
    { id: 5, name: "Review Your Studio Listing" },
  ];

  const onSubmitPress = async () => {
    const payload = {
      name: basicInfo?.studioName?.trim() || "",
      description: basicInfo?.studioDesc?.trim() || "",
      location: {
        address: basicInfo?.studioAddress?.trim() || "",
        city: basicInfo?.city?.trim() || "",
        state: basicInfo?.state?.trim() || "",
        pincode: Number(basicInfo?.pinCode) || 0,
        coordinates: {
          lat: 19.076,  // TODO: replace with actual user-selected coordinates if available
          lng: 72.8777
        }
      },
      pricing: {
        hourly_rate: Number(details?.basePrice) || 0,
        minimum_hours: Number(details?.minBookingHours) || 0,
        maximum_hours: Number(details?.maxBookingHours) || 0,
        extra_hour_rate: Number(details?.overtimePrice) || 0,
        weekend_multiplier: Number(details?.weekendPrice) || 0
      },
      amenities: selectedAmenities?.map(item => item?.name) || [],
      studio_type: basicInfo?.studioType || "",
      details: {
        size: Number(details?.studioSize) || 0,
        capacity: Number(details?.maximumPeople) || 0,
        contact_phone: details?.contactPhone?.trim() || "",
        alternate_phone: details?.alternatePhone?.trim() || ""
      },
      policies: {
        cancellation: images?.cancellationPolicy?.trim() || "",
        payment: images?.paymentPolicy?.trim() || "",
        rules: images?.additionalRules?.trim() || ""
      },
      operating_hours: buildOperatingHoursPayload(days),
      equipment: selectedEquipments?.map(item => item?.name) || []
    };

    console.log("📦 Final Payload:", JSON.stringify(payload, null, 2));

    if (editStudio) {
      console.log('calling here 1');
      
      const convertedPayload = { ...payload, studio_id: editStudioValues?.id }
      try {
        const response = await dispatch(updateStudioThunk(convertedPayload)).unwrap(); // 👈 unwrap() to get actual resolved value
        clearAllStates();
        console.log("✅ Studio updated Successfully:", response);
      } catch (error) {
        console.error("❌ Error updating studio:", error);
      }
    }
    else {
      console.log('calling here 2');
      try {
        const response = await dispatch(createStudioThunk(payload)).unwrap(); // 👈 unwrap() to get actual resolved value
        clearAllStates();
        console.log("✅ Studio Created Successfully:", response);
      } catch (error) {
        console.error("❌ Error submitting studio:", error);
      }
    }
  };


  const buildOperatingHoursPayload = (days: any[]) => {
    const result: any = {};

    days.forEach((day) => {
      const key = day.name.toLowerCase(); // "Monday" → "monday"

      result[key] = {
        open: day.openTime
          ? new Date(day.openTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
          : null,
        close: day.closeTime
          ? new Date(day.closeTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
          : null,
        closed: !day.selected, // if unchecked → closed = true
      };
    });

    return result;
  };


  const toggleDay = (id: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === id ? { ...day, selected: !day.selected } : day
      )
    );
  };

  // ✅ Handle time selection
  const onTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (!selectedTime || !showPicker) {
      setShowPicker(null);
      return;
    }

    const { id, type } = showPicker;
    setDays((prev) =>
      prev.map((day) => {
        if (day.id === id) {
          return {
            ...day,
            [type === "open" ? "openTime" : "closeTime"]: selectedTime,
          };
        }
        return day;
      })
    );
    setShowPicker(null);
  };

  const onPressTab = (item: any) => {
    setSelectedTab(item.id);
    scrollToTab(item.id);
  };

  const scrollToTab = (tabId: number) => {
    const index = tabs.findIndex((t) => t.id === tabId);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // keeps the item near center
      });
    }
  };

  const handleDocumentPick = async () => {
    if (selectedFile.length == 10) {
      setMaxImageError('You can upload up to 10 images only.');
      setShowMaxImageError(true);
      setTimeout(() => {
        setShowMaxImageError(false);
      }, 3000);

    }
    else {
      const result = await launchImageLibrary({ mediaType: "photo", selectionLimit: 10 });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets); // store selected image info
      }
    }
  };

  const onpressPrevious = () => {
    const prevTab = selectedTab - 1;
    if (prevTab >= 1) {
      setSelectedTab(prevTab);
      scrollToTab(prevTab);
    }
  };

  const onpressNext = () => {
    const nextTab = selectedTab + 1;
    if (nextTab <= tabs.length) {
      setSelectedTab(nextTab);
      scrollToTab(nextTab);
    }
  };

  // ✅ Render each day
  const renderDayList = ({ item }: any) => {
    return (
      <View style={styles.dayOuterContainer}>
        <View key={item.id} style={styles.dayContainer}>
          {/* Day Row with Checkbox */}
          <TouchableOpacity
            style={styles.dayHeader}
            activeOpacity={0.8}
            onPress={() => toggleDay(item.id)}
          >
            <Icon
              name={item.selected ? "check-box" : "check-box-outline-blank"}
              size={24}
              color={item.selected ? "#1B4332" : "#444"}
            />
            <Text style={styles.DayText}>{item.name}</Text>
          </TouchableOpacity>

          {/* Time Picker Row (Visible only if selected) */}
          {item.selected && (
            <View style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowPicker({ id: item.id, type: "open" })}
              >
                <Text style={styles.timeLabel}>Open Time</Text>
                <Text style={styles.timeValue}>
                  {item.openTime
                    ? item.openTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "Select"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowPicker({ id: item.id, type: "close" })}
              >
                <Text style={styles.timeLabel}>Close Time</Text>
                <Text style={styles.timeValue}>
                  {item.closeTime
                    ? item.closeTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "Select"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const rendertabs = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => onPressTab(item)}
      style={[
        styles.tabContainer,
        {
          backgroundColor: item.id === selectedTab ? "#F2F5EC" : "#FFFFFF",
        },
      ]}
      key={item.id}
    >
      <Text
        style={[
          styles.tabText,
          { color: item.id === selectedTab ? "#2F2F2F" : "#868484" },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const removeSelectedImage = (item: any) => {
    setSelectedFile((prevFiles: any[]) => prevFiles.filter(file => file.uri !== item.uri));

  }

  const renderImages = ({ item }: any) => (
    <View>
      <TouchableOpacity onPress={() => removeSelectedImage(item)} style={styles.imageDeSelect}>
        <Icon name="close" size={22} color="#034833" />
      </TouchableOpacity>
      <Image
        source={{ uri: item.uri }}
        style={styles.selectedImage}
        resizeMode="cover"
      />
    </View>
  )

  const toggleAmenity = (id: number) => {
    setAmenities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };
  const selectedAmenities = amenities.filter(a => a.selected);

  // --- Render Item Function ---
  const renderAmenity = ({ item }: any) => (
    <TouchableOpacity
      style={styles.amenityItem}
      activeOpacity={0.8}
      onPress={() => toggleAmenity(item.id)}
    >
      <Icon
        name={item.selected ? "check-box" : "check-box-outline-blank"}
        size={22}
        color={item.selected ? "#1B4332" : "#333"}
        style={styles.checkboxIcon}
      />
      <Text style={styles.amenityText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const toggleEquip = (id: number) => {
    setEquipments(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectedEquipments = equipments.filter(a => a.selected);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.amenityItem}
      activeOpacity={0.8}
      onPress={() => toggleEquip(item.id)}
    >
      <Icon
        name={item.selected ? "check-box" : "check-box-outline-blank"}
        size={22}
        color={item.selected ? "#1B4332" : "#333"}
        style={styles.checkboxIcon}
      />
      <Text style={styles.amenityText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      {/* Render tabs */}
      <FlatList
        ref={flatListRef}
        data={tabs}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={rendertabs}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ marginVertical: 10 }}
        getItemLayout={(_, index) => ({
          length: 150, // approximate width of tab
          offset: 150 * index,
          index,
        })}
      />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Render form section 1 */}

        {selectedTab == 1 ? <View>
          <Text style={styles.title}>Basic Studio Information</Text>
          <Text style={styles.labelText} >Studio Name<Text style={styles.required}> *</Text></Text>

          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            placeholder="e.g., Elite Photography Studio"
            value={basicInfo.studioName}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, studioName: text })
            }
          />
          <Text style={styles.labelText} >Studio Type<Text style={styles.required}> *</Text></Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={basicInfo.studioType} // Must match one of Picker.Item values
              onValueChange={(value) => setBasicInfo({ ...basicInfo, studioType: value })}
              dropdownIconColor="#034833" // Color of the arrow
              style={{ color: '#101010' }} // Color of the selected text
            >
              <Picker.Item label="Select studio type" value="" />
              {studioTypes.map((type, index) => (
                <Picker.Item key={index} label={type} value={type} />
              ))}
            </Picker>
          </View>
          <Text style={styles.labelText} >Description<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={{ ...styles.input, ...styles.textArea }}
            placeholderTextColor={'#898787'}
            multiline
            placeholder="Describe your studio , its unique features and what make it special..."
            value={basicInfo.studioDesc}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, studioDesc: text })
            }
          />
          <Text style={styles.labelText} >Full Address<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={{ ...styles.input, ...styles.textArea }}
            placeholderTextColor={'#898787'}
            placeholder="Enter the complete studio adress..."
            multiline
            value={basicInfo.studioAddress}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, studioAddress: text })
            }
          />
          <Text style={styles.labelText} >State<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            placeholder="Enter the state"
            value={basicInfo.state}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, state: text })
            }
          />
          <Text style={styles.labelText} >City<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            placeholder="Enter the city"
            value={basicInfo.city}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, city: text })
            }
          />
          <Text style={styles.labelText} >Pin Code<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="Enter the pincode"
            value={basicInfo.pinCode}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, pinCode: text })
            }
          />
          <Text style={styles.labelText} >Landmark<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            placeholder="Near famous landmark"
            value={basicInfo.landMark}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, landMark: text })
            }
          />
        </View> : selectedTab == 2 ? <View>
          <Text style={styles.title}>Studio Details & Pricing</Text>
          <Text style={styles.labelText} >Studio size (sq ft)<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 1200"
            value={details.studioSize}
            onChangeText={(text) =>
              setDetails({ ...details, studioSize: text })
            }
          />
          <Text style={styles.labelText} >Maximum People<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 2"
            value={details.maximumPeople}
            onChangeText={(text) =>
              setDetails({ ...details, maximumPeople: text })
            }
          />
          <Text style={styles.labelText} >Min Booking Hours<Text style={styles.required}> *</Text></Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={details.minBookingHours} // Must match one of Picker.Item values
              onValueChange={(value) => setDetails({ ...details, minBookingHours: value })}
              dropdownIconColor="#034833" // Color of the arrow
              style={{ color: '#101010' }} // Color of the selected text
            >
              <Picker.Item label="Select min hours" value="" />
              {minBookingHours.map((minHours, index) => (
                <Picker.Item key={index} label={minHours.label} value={minHours.value} />
              ))}
            </Picker>
          </View>
          <Text style={styles.labelText} >Max Booking Hours<Text style={styles.required}> *</Text></Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={details.maxBookingHours} // Must match one of Picker.Item values
              onValueChange={(value) => setDetails({ ...details, maxBookingHours: value })}
              dropdownIconColor="#034833" // Color of the arrow
              style={{ color: '#101010' }} // Color of the selected text
            >
              <Picker.Item label="Select max hours" value="" />
              {maxBookingHours.map((maxHours, index) => (
                <Picker.Item key={index} label={maxHours.label} value={maxHours.value} />
              ))}
            </Picker>
          </View>
          <Text style={styles.labelText} >Base Price (per Hour)<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 2500"
            value={details.basePrice}
            onChangeText={(text) =>
              setDetails({ ...details, basePrice: text })
            }
          />
          <Text style={styles.labelText} >Weekend Price (per hour)<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 1200"
            value={details.weekendPrice}
            onChangeText={(text) =>
              setDetails({ ...details, weekendPrice: text })
            }
          />
          <Text style={styles.labelText} >Overtime Price (per hour)<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 3000"
            value={details.overtimePrice}
            onChangeText={(text) =>
              setDetails({ ...details, overtimePrice: text })
            }
          />
          <Text style={styles.labelText} >Security Deposit<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 5000"
            value={details.securityDeposit}
            onChangeText={(text) =>
              setDetails({ ...details, securityDeposit: text })
            }
          />
          <Text style={styles.labelText} >Contact Phone<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="phone-pad"
            placeholder="e.g., +91 9876543210"
            value={details.contactPhone}
            onChangeText={(text) =>
              setDetails({ ...details, contactPhone: text })
            }
          />
          <Text style={styles.labelText} >Alternate Phone<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            keyboardType="phone-pad"
            placeholder="e.g., +91 9876543210"
            value={details.alternatePhone}
            onChangeText={(text) =>
              setDetails({ ...details, alternatePhone: text })
            }
          />
        </View> : selectedTab === 3 ? <View>
          <Text style={styles.title}>Available Amenities</Text>

          <FlatList
            data={amenities}
            renderItem={renderAmenity}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          <Text style={styles.title}>Available Equipment</Text>

          <FlatList
            data={equipments}
            renderItem={renderItem}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />

          <Text style={styles.title}>Operating Hours</Text>

          <FlatList
            data={days}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDayList}
          />

        </View> : selectedTab === 4 ? <View>
          <Text style={styles.title}>Studio Images</Text>
          <Text style={styles.labelText} >Upload high-quality images of your studio. First image will be used as cover photo.<Text style={styles.required}> *</Text></Text>
          {selectedFile.length > 0 ? (
            <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
              <FlatList
                data={selectedFile}
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
              <Text style={styles.uploadTextHeader}>Upload Studio Images</Text>
              <Text style={styles.uploadTextDesc}>Click to browse your images</Text>
              <Text style={styles.supportedFilesText}>
                Supported formats: JPG, PNG, WebP. Max size: 5MB per image. Max 10 images.
              </Text>
              <Text style={styles.chooseFilesText}>Choose Files</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.labelText} >Cancellation Policy<Text style={styles.required}> *</Text></Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={images.cancellationPolicy} // Must match one of Picker.Item values
              onValueChange={(value) => setImages({ ...images, cancellationPolicy: value })}
              dropdownIconColor="#034833" // Color of the arrow
              style={{ color: '#101010' }} // Color of the selected text
            >
              <Picker.Item label="Select Cancellation Policy" value="" />
              {cancellationPolicy.map((Cancellation, index) => (
                <Picker.Item key={index} label={Cancellation} value={Cancellation} />
              ))}
            </Picker>
          </View>
          <Text style={styles.labelText} >Payment Policy<Text style={styles.required}> *</Text></Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={images.paymentPolicy} // Must match one of Picker.Item values
              onValueChange={(value) => setImages({ ...images, paymentPolicy: value })}
              dropdownIconColor="#034833" // Color of the arrow
              style={{ color: '#101010' }} // Color of the selected text
            >
              <Picker.Item label="Select Payment Policy" value="" />
              {paymentPolicy.map((payment, index) => (
                <Picker.Item key={index} label={payment} value={payment} />
              ))}
            </Picker>
          </View>
          <Text style={styles.labelText} >Additional Rules & Policies<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={{ ...styles.input, ...styles.textArea }}
            placeholderTextColor={'#898787'}
            multiline
            placeholder="Any additional rules, restrictions, or policies for your studio"
            value={images.additionalRules}
            onChangeText={(text) =>
              setImages({ ...images, additionalRules: text })
            }
          />

        </View> :
          <View>
            {/* basic info list view */}
            <Text style={styles.title}>Basic Information</Text>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%' }} >Studio Name</Text>
              <Text style={styles.listInformation} >{' : '} {basicInfo.studioName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%' }} >Studio Type</Text>
              <Text style={styles.listInformation} >{' : '} {basicInfo.studioType}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%' }} >State</Text>
              <Text style={styles.listInformation} >{' : '} {basicInfo.state}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%' }} >City</Text>
              <Text style={styles.listInformation} >{' : '} {basicInfo.city}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%' }} >Studio Size</Text>
              <Text style={styles.listInformation} >{' : '} {details.studioSize} sq ft</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%' }} >Capacity</Text>
              <Text style={styles.listInformation} >{' : '} {details.maximumPeople} Peoples</Text>
            </View>

            {/* price and details view */}
            <Text style={styles.title}>Pricing and Booking</Text>
            {details.basePrice ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%' }}>
                  Base Price (per Hour)
                </Text>
                <Text style={styles.listInformation}>{' : '} ₹{details.basePrice}</Text>
              </View>
            ) : null}

            {details.weekendPrice ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%' }}>
                  Weekend Price (per Hour)
                </Text>
                <Text style={styles.listInformation}>{' : '} ₹{details.weekendPrice}</Text>
              </View>
            ) : null}

            {details.securityDeposit ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%' }}>
                  Security Deposit
                </Text>
                <Text style={styles.listInformation}>{' : '} ₹{details.securityDeposit}</Text>
              </View>
            ) : null}

            {details.overtimePrice ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%' }}>
                  Overtime Price (per Hour)
                </Text>
                <Text style={styles.listInformation}>{' : '} ₹{details.overtimePrice}</Text>
              </View>
            ) : null}

            {details.minBookingHours ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%' }}>
                  Min Booking Hours
                </Text>
                <Text style={styles.listInformation}>
                  {' : '} {details.minBookingHours} hours
                </Text>
              </View>
            ) : null}

            {details.maxBookingHours ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%' }}>
                  Max Booking Hours
                </Text>
                <Text style={styles.listInformation}>
                  {' : '} {details.maxBookingHours} hours
                </Text>
              </View>
            ) : null}

            {details.contactPhone ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%' }}>
                  Contact Phone
                </Text>
                <Text style={styles.listInformation}>
                  {' : '} +91 {details.contactPhone}
                </Text>
              </View>
            ) : null}

            {details.alternatePhone ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%' }}>
                  Alternate Phone
                </Text>
                <Text style={styles.listInformation}>
                  {' : '} +91 {details.alternatePhone}
                </Text>
              </View>
            ) : null}


            {/* amenities view */}
            <Text style={styles.title}>
              Selected Amenities ({selectedAmenities.length})
            </Text>

            {selectedAmenities.length > 0 ? (
              <View>
                {selectedAmenities.map(item => (
                  <Text key={item.id} style={styles.listInformation}>
                    • {item.name}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={{ ...styles.listInformation, fontSize: 12 }}>No amenities selected</Text>
            )}
            <Text style={styles.title}>
              Selected Equipments ({selectedEquipments.length})
            </Text>

            {selectedEquipments.length > 0 ? (
              <View>
                {selectedEquipments.map(item => (
                  <Text key={item.id} style={styles.listInformation}>
                    • {item.name}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={{ ...styles.listInformation, fontSize: 12 }}>No amenities selected</Text>
            )}

            <View style={styles.noteTextOutline}>
              <Icon
                name={"info"}
                size={24}
                color={'#101010'}
              />
              <Text style={styles.noteText}>Your studio listing will be reviewed by our team before going live. You'll receive an email notification once approved.</Text>
            </View>
            <View style={styles.termsOutline}>
              <Icon
                onPress={() => setTermsSelected(!termsSelected)}
                name={termsSelected ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={termsSelected ? "#1B4332" : "#444"}
              />
              <Text style={{ ...styles.listInformation, fontSize: 12, marginLeft: 5 }}>I agree to the Terms & Conditions and confirm that all information provided is accurate.</Text>
            </View>
          </View>}



        {/* Render bottom section */}

        <View style={styles.actionButtonOutline}>
          {selectedTab !== 1 ? (
            <TouchableOpacity onPress={onpressPrevious} style={styles.previousButton}>
              <Icon name={"arrow-back-ios"} size={16} color="#FFFFFF" />
              <Text style={styles.previousText}>Previous</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {selectedTab !== tabs.length &&
            <TouchableOpacity onPress={onpressNext} style={styles.nextButton}>
              <Text style={styles.nextText}>Next</Text>
              <Icon name={"arrow-forward-ios"} size={16} color="#FFFFFF" />
            </TouchableOpacity>
          }

          {selectedTab == tabs.length &&
            <TouchableOpacity onPress={onSubmitPress} style={styles.previousButton}>
              <Icon name={"check"} size={16} color="#FFFFFF" />
              <Text style={[styles.previousText, { marginLeft: 5 }]}>{editStudio ? 'Update studio' : 'Submit for review'}</Text>
            </TouchableOpacity>
          }
        </View>
      </ScrollView>

      {/* ✅ Show native time picker */}
      {showPicker && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

export default AddStudioComponent;

const styles = StyleSheet.create({
  tabContainer: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#F2F5EC",
    borderRadius: 10,
  },
  tabText: {
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 18,
    lineHeight: 30
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
  title: {
    color: '#101010',
    fontWeight: '700',
    fontSize: 16,
    marginVertical: 15
  },
  required: {
    color: '#DC3545'
  },
  labelText: {
    color: '#6C757D',
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 12,
  },
  actionButtonOutline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 380,
    marginTop: 20
  },
  previousButton: {
    backgroundColor: "#034833",
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 12,
  },
  nextButton: {
    backgroundColor: "#034833",
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 12,
  },
  previousText: {
    fontWeight: "500",
    paddingRight: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: "#FFFFFF",
  },
  nextText: {
    fontWeight: "500",
    paddingLeft: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: "#FFFFFF",
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
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  listInformation: {
    fontWeight: '600',
    color: '#101010',
    fontSize: 14,
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  amenityItem: {
    flex: 1, // Ensures the item takes up half the row width
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Vertical spacing between rows
    paddingRight: 10, // Small space for the right column items
  },
  checkboxIcon: {
    marginRight: 8,
  },
  amenityText: {
    fontSize: 16,
    marginRight: 25,
    color: '#333', // Dark text color
    fontWeight: '400', // Regular weight for clear reading
  },
  DayText: {
    fontSize: 16,
    marginRight: 25,
    color: '#333', // Dark text color
    fontWeight: '400', // Regular weight for clear reading
  },
  dayOuterContainer: {
    marginTop: 10,
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
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
  },
  timeValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1B4332",
  },
  noteTextOutline: {
    textAlign: 'center',
    backgroundColor: '#F2F5EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 40,
    paddingVertical: 10
  },
  noteText: {
    textAlign: 'center',
    color: '#101010',
    marginTop: 5,
    fontWeight: '500',
    fontSize: 14
  },
  termsOutline: {
    flexDirection: 'row',
    alignItems: 'center'
  },
});
