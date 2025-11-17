import { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import imagePaths from '../../constants/imagePaths';
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch } from "react-redux";
import { createStudioThunk, updateStudioThunk } from "../../features/studios/studiosSlice";
import { Dropdown } from "react-native-element-dropdown";
import { typography } from "../../constants/typography";

const AddStudioComponent = ({
  editStudio = false,
  onPressSelectmenu = (i: any) => { },
  editStudioValues = {},
}) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(1);
  const flatListRef = useRef<FlatList>(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [maxImageError, setMaxImageError] = useState('');
  const [showMaxImageError, setShowMaxImageError] = useState(false);
  const [termsSelected, setTermsSelected] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<"open" | "close" | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);

  const [days, setDays] = useState([
    { id: 1, name: "Monday", selected: true, openTime: null, closeTime: null },
    { id: 2, name: "Tuesday", selected: true, openTime: null, closeTime: null },
    { id: 3, name: "Wednesday", selected: true, openTime: null, closeTime: null },
    { id: 4, name: "Thursday", selected: true, openTime: null, closeTime: null },
    { id: 5, name: "Friday", selected: true, openTime: null, closeTime: null },
    { id: 6, name: "Saturday", selected: true, openTime: null, closeTime: null },
    { id: 7, name: "Sunday", selected: true, openTime: null, closeTime: null },
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
    latitude: "",
    longitude: "",
  });

  const [basicInfoError, setBasicInfoError] = useState({
    studioName: false,
    studioType: false,
    studioDesc: false,
    studioAddress: false,
    state: false,
    city: false,
    pinCode: false,
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

  const [detailsError, setDetailsError] = useState({
    studioSize: false,
    maximumPeople: false,
    minBookingHours: false,
    maxBookingHours: false,
    basePrice: false,
    weekendPrice: false,
    overtimePrice: false,
    securityDeposit: false,
    contactPhone: false,
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

  useEffect(() => {
    if (editStudio && editStudioValues) {
      setStudioValues();
      console.log(editStudio, editStudioValues);

    }
  }, [editStudio])

  const setStudioValues = () => {

    // 🧭 Set Basic Info
    setBasicInfo({
      studioName: editStudioValues?.name?.trim() || '',
      studioType: editStudioValues?.studio_type || '',
      studioDesc: editStudioValues?.description?.trim() || '',
      studioAddress: editStudioValues?.location?.address?.trim() || '',
      state: editStudioValues?.location?.state?.trim() || '',
      city: editStudioValues?.location?.city?.trim() || '',
      pinCode: editStudioValues?.location?.pincode
        ? String(editStudioValues.location.pincode)
        : '',
      landMark: '',
      latitude: editStudioValues?.location?.coordinates?.lat
        ? String(editStudioValues.location.coordinates.lat)
        : '',
      longitude: editStudioValues?.location?.coordinates?.lng
        ? String(editStudioValues.location.coordinates.lng)
        : '',
    });

    // 🧩 Set Details Info
    setDetails({
      studioSize: editStudioValues?.studio_size
        ? String(editStudioValues.studio_size)
        : '',
      maximumPeople: editStudioValues?.max_capacity
        ? String(editStudioValues.max_capacity)
        : '',
      minBookingHours: editStudioValues?.pricing?.minimum_hours
        ? String(editStudioValues.pricing.minimum_hours)
        : '',
      maxBookingHours: editStudioValues?.max_booking_hours
        ? String(editStudioValues.max_booking_hours)
        : '',
      basePrice: editStudioValues?.pricing?.hourly_rate
        ? String(editStudioValues.pricing.hourly_rate)
        : '',
      weekendPrice: editStudioValues?.pricing?.weekend_multiplier
        ? String(editStudioValues.pricing.weekend_multiplier)
        : '',
      overtimePrice: editStudioValues?.pricing?.extra_hour_rate
        ? String(editStudioValues.pricing.extra_hour_rate)
        : '',
      securityDeposit: editStudioValues?.security_deposit
        ? String(editStudioValues.security_deposit)
        : '',
      contactPhone: editStudioValues?.contact_phone?.trim() || '',
      alternatePhone: '',
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

    if (editStudioValues?.studio_images?.[0]?.image_url) {
      const formattedImages = editStudioValues.studio_images.map(img => ({
        ...img,
        uri: img.image_url,
      }));
      setSelectedImages(formattedImages);
    }

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
      latitude: "",
      longitude: "",
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

    // clear selected images values
    setSelectedImages([]);

    onPressSelectmenu('Dashboard')
  }

  const [images, setImages] = useState({
    cancellationPolicy: "",
    paymentPolicy: "",
    additionalRules: "",
  });

  const [imagesError, setImagesError] = useState({
    cancellationPolicy: false,
    paymentPolicy: false,
    additionalRules: false,
  });

  const studioTypes = [
    { label: "Portrait studio", value: "Portrait studio" },
    { label: "Fashion studio", value: "Fashion studio" },
    { label: "Product photography studio", value: "Product photography studio" },
    { label: "Wedding studio", value: "Wedding studio" },
    { label: "Commercial studio", value: "Commercial studio" },
    { label: "Multi-purpose studio", value: "Multi-purpose studio" },
  ];

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
    { label: "Free cancellation up to 24 hours", value: "Free cancellation up to 24 hours" },
    { label: "Free cancellation up to 48 hours", value: "Free cancellation up to 48 hours" },
    { label: "Free cancellation up to 72 hours", value: "Free cancellation up to 72 hours" },
    { label: "Strict - No cancellation", value: "Strict - No cancellation" },
  ];

  const paymentPolicy = [
    { label: "50% advance payment required", value: "50% advance payment required" },
    { label: "100% advance payment required", value: "100% advance payment required" },
    { label: "Flexible payment terms", value: "Flexible payment terms" },
  ];

  const tabs = [
    { id: 1, name: "Basic Info" },
    { id: 2, name: "Details" },
    { id: 3, name: "Amenities" },
    { id: 4, name: "Images" },
    { id: 5, name: "Review Your Studio Listing" },
  ];

  const onSubmitPress = async () => {

    if (!termsSelected) {
      Alert.alert("To proceed", "you need to confirm your agreement to the Terms and Conditions.");
      return;
    }

    const payload = {
      name: basicInfo?.studioName?.trim() || "",
      description: basicInfo?.studioDesc?.trim() || "",
      location: {
        address: basicInfo?.studioAddress?.trim() || "",
        city: basicInfo?.city?.trim() || "",
        state: basicInfo?.state?.trim() || "",
        pincode: Number(basicInfo?.pinCode) || 0,
        coordinates: {
          latitude: Number(basicInfo?.latitude) || 0, // TODO: replace with actual coordinates if available
          longitude: Number(basicInfo?.longitude) || 0
        }
      },
      pricing: {
        hourly_rate: Number(details?.basePrice) || 0,
        minimum_hours: Number(details?.minBookingHours) || 0,
        extra_hour_rate: Number(details?.overtimePrice) || 0,
        weekend_multiplier: Number(details?.weekendPrice) || 0
      },
      amenities: selectedAmenities?.map(item => item?.name) || [],
      studio_type: basicInfo?.studioType || "",
      studio_size: Number(details?.studioSize) || 0,
      max_capacity: Number(details?.maximumPeople) || 0,
      max_booking_hours: Number(details?.maxBookingHours) || 0,
      security_deposit: Number(details?.securityDeposit) || 0,
      contact_phone: details?.contactPhone?.trim() || "",
      details: {
        alternate_phone: details?.alternatePhone?.trim() || ""
      },
      policies: {
        cancellation: images?.cancellationPolicy?.trim() || "",
        payment: images?.paymentPolicy?.trim() || "",
        rules: images?.additionalRules?.trim() || ""
      },
      availability_slots: buildOperatingHoursPayload(days, details)
    };

    // 🧠 Create FormData
    const formData = new FormData();

    // Basic Info
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('studio_type', payload.studio_type);

    // Numbers
    formData.append('studio_size', String(payload.studio_size));
    formData.append('max_capacity', String(payload.max_capacity));
    formData.append('max_booking_hours', String(payload.max_booking_hours));
    formData.append('security_deposit', String(payload.security_deposit));
    formData.append('contact_phone', payload.contact_phone);

    // Nested objects → convert to JSON strings
    formData.append('location', JSON.stringify(payload.location));
    formData.append('pricing', JSON.stringify(payload.pricing));
    formData.append('details', JSON.stringify(payload.details));
    formData.append('policies', JSON.stringify(payload.policies));
    formData.append('availability_slots', JSON.stringify(payload.availability_slots));

    // Arrays
    formData.append('amenities', JSON.stringify(payload.amenities));


    // 🖼️ Append all selected images
    if (selectedImages?.length > 0) {
      selectedImages.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `studio_image_${index}.jpg`,
        });
      });
    }

    console.log("📦 Final FormData payload ready to send");

    if (selectedImages?.length > 0) {
      try {
        let response;
        if (editStudio) {
          console.log('calls from formData update', formData);

          // UPDATE studio
          formData.append('studio_id', editStudioValues?.id);
          response = await dispatch(updateStudioThunk(formData)).unwrap();
          console.log("✅ Studio updated successfully:", response);
        } else {
          // CREATE studio
          console.log('calls from formData create', formData);
          response = await dispatch(createStudioThunk(formData)).unwrap();
          console.log("✅ Studio created successfully:", response);
        }
        clearAllStates();
      } catch (error) {
        console.error("❌ Error submitting studio:", error);
      }
    }
    else {
      try {
        let response;
        if (editStudio) {
          console.log('calls from json update', payload);
          // UPDATE studio
          const convertedPayload = { ...payload, studio_id: editStudioValues?.id }
          response = await dispatch(updateStudioThunk(convertedPayload)).unwrap();
          console.log("✅ Studio updated successfully:", response);
        } else {
          console.log('calls from json update', payload);
          // CREATE studio
          response = await dispatch(createStudioThunk(payload)).unwrap();
          console.log("✅ Studio created successfully:", response);
        }
        clearAllStates();
      } catch (error) {
        console.error("❌ Error submitting studio:", error);
      }
    }
  };



  const buildOperatingHoursPayload = (days: any[], details: any) => {
    return days.map((day) => {
      // Convert name → day_of_week number
      const dayOfWeekMap: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      return {
        day_of_week: dayOfWeekMap[day.name],
        start_time: day.openTime ? day.openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "09:00",
        end_time: day.closeTime ? day.closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '21:00',
        is_available: day.selected,
        hourly_rate: details?.basePrice || 0,
      };
    });
  };



  const toggleDay = (id: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === id ? { ...day, selected: !day.selected } : day
      )
    );
  };

  const onTimeChange = (event: any, selectedTime: Date | undefined) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    if (selectedTime && selectedDayId !== null && pickerType) {
      // Round to full hour
      const rounded = new Date(selectedTime);
      rounded.setMinutes(0, 0, 0);

      // Clamp between 09:00 and 21:00
      const hour = rounded.getHours();
      if (hour < 9) rounded.setHours(9);
      if (hour > 21) rounded.setHours(21);

      // Update the correct day & time
      setDays((prevDays) =>
        prevDays.map((day) => {
          if (day.id === selectedDayId) {
            return {
              ...day,
              [pickerType === "open" ? "openTime" : "closeTime"]: rounded,
            };
          }
          return day;
        })
      );

      setShowPicker(false);
    }
  };

  // 🕘 open picker
  const handleOpenTimePress = (dayId: number) => {
    setSelectedDayId(dayId);
    setPickerType("open");
    setShowPicker(true);
  };

  // 🕕 close picker
  const handleCloseTimePress = (dayId: number) => {
    setSelectedDayId(dayId);
    setPickerType("close");
    setShowPicker(true);
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

  const onpressPrevious = () => {
    const prevTab = selectedTab - 1;
    if (prevTab >= 1) {
      setSelectedTab(prevTab);
      scrollToTab(prevTab);
    }
  };

  const onpressNext = () => {
    if (selectedTab === 1) {
      // 🧩 Validate Tab 1 — Basic Info

      const newErrors = {
        studioName: !basicInfo.studioName,
        studioType: !basicInfo.studioType,
        studioDesc: !basicInfo.studioDesc,
        studioAddress: !basicInfo.studioAddress,
        state: !basicInfo.state,
        city: !basicInfo.city,
        pinCode: !basicInfo.pinCode,
      };

      setBasicInfoError(newErrors);

      // ❌ If any value is empty → show alert and stop
      if (Object.values(newErrors).includes(true)) {
        return;
      }

      // ✅ All good → move next
    }

    if (selectedTab === 2) {
      // 🧩 Validate Tab 2 — Details

      const newErrors = {
        studioSize: !details.studioSize,
        maximumPeople: !details.maximumPeople,
        minBookingHours: !details.minBookingHours,
        maxBookingHours: !details.maxBookingHours,
        basePrice: !details.basePrice,
        weekendPrice: !details.weekendPrice,
        overtimePrice: !details.overtimePrice,
        securityDeposit: !details.securityDeposit,
        contactPhone: !details.contactPhone,
      };

      setDetailsError(newErrors);

      // ❌ If any value is empty → show alert and stop
      if (Object.values(newErrors).includes(true)) {
        return;
      }

      // ✅ All good → move next
    }

    // 🧩 Tab 3 — Amenities (optional, no validation)

    if (selectedTab === 4) {
      // 🧩 Validate Tab 4 — Images/Policies
      const newErrors = {
        cancellationPolicy: !images.cancellationPolicy,
        paymentPolicy: !images.paymentPolicy,
        additionalRules: !images.additionalRules,
      };

      setImagesError(newErrors);

      // ❌ If any value is empty → show alert and stop
      if (Object.values(newErrors).includes(true)) {
        return;
      }

      // ✅ All good → move next
    }

    // ✅ Move to next tab
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
                onPress={() => handleOpenTimePress(item.id)}
              >
                <Text style={styles.timeLabel}>Open Time</Text>
                <Text style={styles.timeValue}>
                  {item.openTime ? item.openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '09:00'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => handleCloseTimePress(item.id)}
              >
                <Text style={styles.timeLabel}>Close Time</Text>
                <Text style={styles.timeValue}>
                  {item.closeTime ? item.closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '21:00'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const rendertabs = ({ item }: any) => (
    <View
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
          { color: item.id === selectedTab ? "#2F2F2F" : "#868484", ...typography.bold, },
        ]}
      >
        {item.name}
      </Text>
    </View>
  );

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
            style={[
              styles.input,
              { borderColor: basicInfoError.studioName ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            placeholder="e.g., Elite Photography Studio"
            value={basicInfo.studioName}
            onChangeText={(text) => {
              setBasicInfo({ ...basicInfo, studioName: text });
              setBasicInfoError({ ...basicInfoError, studioName: false });
            }}
          />
          {basicInfoError.studioName && (
            <Text style={styles.errorText}>Studio name is required</Text>
          )}
          <Text style={styles.labelText} >Studio Type<Text style={styles.required}> *</Text></Text>
          <Dropdown
            style={[styles.dropdown, { borderColor: basicInfoError.studioType ? "#DC3545" : "#BABABA" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            containerStyle={styles.dropdownContainerStyle}
            data={studioTypes}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select studio type"
            value={basicInfo.studioType}
            onChange={(item) => {
              setBasicInfo({ ...basicInfo, studioType: item.value })
              setBasicInfoError({ ...basicInfoError, studioType: false });
            }}
          />
          {basicInfoError.studioType && (
            <Text style={styles.errorText}>Studio Type is required</Text>
          )}
          <Text style={styles.labelText} >Description<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={{ ...styles.input, ...styles.textArea, borderColor: basicInfoError.studioDesc ? "#DC3545" : "#BABABA" }}
            placeholderTextColor={'#898787'}
            multiline
            placeholder="Describe your studio , its unique features and what make it special..."
            value={basicInfo.studioDesc}
            onChangeText={(text) => {
              setBasicInfo({ ...basicInfo, studioDesc: text });
              setBasicInfoError({ ...basicInfoError, studioDesc: false });
            }}
          />
          {basicInfoError.studioDesc && (
            <Text style={styles.errorText}>Studio Description is required</Text>
          )}
          <Text style={styles.labelText} >Full Address<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={{ ...styles.input, ...styles.textArea, borderColor: basicInfoError.studioAddress ? "#DC3545" : "#BABABA" }}
            placeholderTextColor={'#898787'}
            placeholder="Enter the complete studio adress..."
            multiline
            value={basicInfo.studioAddress}
            onChangeText={(text) => {
              setBasicInfo({ ...basicInfo, studioAddress: text });
              setBasicInfoError({ ...basicInfoError, studioAddress: false });
            }}
          />
          {basicInfoError.studioAddress && (
            <Text style={styles.errorText}>Studio Address is required</Text>
          )}
          <Text style={styles.labelText} >State<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: basicInfoError.state ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            placeholder="Enter the state"
            value={basicInfo.state}
            onChangeText={(text) => {
              setBasicInfo({ ...basicInfo, state: text });
              setBasicInfoError({ ...basicInfoError, state: false });
            }}
          />
          {basicInfoError.state && (
            <Text style={styles.errorText}>State is required</Text>
          )}
          <Text style={styles.labelText} >City<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: basicInfoError.city ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            placeholder="Enter the city"
            value={basicInfo.city}
            onChangeText={(text) => {
              setBasicInfo({ ...basicInfo, city: text });
              setBasicInfoError({ ...basicInfoError, city: false });
            }}
          />
          {basicInfoError.city && (
            <Text style={styles.errorText}>City is required</Text>
          )}
          <Text style={styles.labelText} >Pin Code<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: basicInfoError.pinCode ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="Enter the pincode"
            value={basicInfo.pinCode}
            onChangeText={(text) => {
              setBasicInfo({ ...basicInfo, pinCode: text });
              setBasicInfoError({ ...basicInfoError, pinCode: false });
            }}
          />
          {basicInfoError.pinCode && (
            <Text style={styles.errorText}>Pin Code is required</Text>
          )}
          <Text style={styles.labelText} >Landmark</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            placeholder="Near famous landmark"
            value={basicInfo.landMark}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, landMark: text })
            }
          />
          <Text style={styles.labelText} >Latitude</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            placeholder="e.g., 19.1136"
            keyboardType="number-pad"
            value={basicInfo.latitude}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, latitude: text })
            }
          />
          <Text style={styles.labelText} >Longitude</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#898787'}
            placeholder="e.g., 72.8697"
            keyboardType="number-pad"
            value={basicInfo.longitude}
            onChangeText={(text) =>
              setBasicInfo({ ...basicInfo, longitude: text })
            }
          />
        </View> : selectedTab == 2 ? <View>
          <Text style={styles.title}>Studio Details & Pricing</Text>
          <Text style={styles.labelText} >Studio size (sq ft)<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: detailsError.studioSize ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 1200"
            value={details.studioSize}
            onChangeText={(text) => {
              setDetails({ ...details, studioSize: text });
              setDetailsError({ ...detailsError, studioSize: false });
            }}
          />
          {detailsError.studioSize && (
            <Text style={styles.errorText}>Studio size is required</Text>
          )}
          <Text style={styles.labelText} >Maximum People<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: detailsError.maximumPeople ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 2"
            value={details.maximumPeople}
            onChangeText={(text) => {
              setDetails({ ...details, maximumPeople: text });
              setDetailsError({ ...detailsError, maximumPeople: false });
            }}
          />
          {detailsError.maximumPeople && (
            <Text style={styles.errorText}>Maximum People is required</Text>
          )}
          <Text style={styles.labelText} >Min Booking Hours<Text style={styles.required}> *</Text></Text>
          <Dropdown
            style={[styles.dropdown, { borderColor: detailsError.minBookingHours ? "#DC3545" : "#BABABA" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            containerStyle={styles.dropdownContainerStyle}
            data={minBookingHours}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select min hours"
            value={details.minBookingHours}
            onChange={(item) => {
              setDetails({ ...details, minBookingHours: item.value });
              setDetailsError({ ...detailsError, minBookingHours: false });
            }}
          />
          {detailsError.minBookingHours && (
            <Text style={styles.errorText}>Min Booking Hours is required</Text>
          )}
          <Text style={styles.labelText} >Max Booking Hours<Text style={styles.required}> *</Text></Text>
          <Dropdown
            style={[styles.dropdown, { borderColor: detailsError.maxBookingHours ? "#DC3545" : "#BABABA" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            containerStyle={styles.dropdownContainerStyle}
            data={maxBookingHours}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select max hours"
            value={details.maxBookingHours}
            onChange={(item) => {
              setDetails({ ...details, maxBookingHours: item.value });
              setDetailsError({ ...detailsError, maxBookingHours: false });
            }}
          />
          {detailsError.maxBookingHours && (
            <Text style={styles.errorText}>Max Booking Hours is required</Text>
          )}
          <Text style={styles.labelText} >Base Price (per Hour)<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: detailsError.basePrice ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 2500"
            value={details.basePrice}
            onChangeText={(text) => {
              setDetails({ ...details, basePrice: text });
              setDetailsError({ ...detailsError, basePrice: false });
            }}
          />
          {detailsError.basePrice && (
            <Text style={styles.errorText}>Base Price is required</Text>
          )}
          <Text style={styles.labelText} >Weekend Price (per hour)<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: detailsError.weekendPrice ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 1200"
            value={details.weekendPrice}
            onChangeText={(text) => {
              setDetails({ ...details, weekendPrice: text });
              setDetailsError({ ...detailsError, weekendPrice: false });
            }}
          />
          {detailsError.weekendPrice && (
            <Text style={styles.errorText}>Weekend Price is required</Text>
          )}
          <Text style={styles.labelText} >Overtime Price (per hour)<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: detailsError.overtimePrice ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 3000"
            value={details.overtimePrice}
            onChangeText={(text) => {
              setDetails({ ...details, overtimePrice: text })
              setDetailsError({ ...detailsError, overtimePrice: false });
            }}
          />
          {detailsError.overtimePrice && (
            <Text style={styles.errorText}>Overtime Price is required</Text>
          )}
          <Text style={styles.labelText} >Security Deposit<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: detailsError.securityDeposit ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            keyboardType="number-pad"
            placeholder="e.g., 5000"
            value={details.securityDeposit}
            onChangeText={(text) => {
              setDetails({ ...details, securityDeposit: text })
              setDetailsError({ ...detailsError, securityDeposit: false });
            }}
          />
          {detailsError.securityDeposit && (
            <Text style={styles.errorText}>Security Deposit is required</Text>
          )}
          <Text style={styles.labelText} >Contact Phone<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: detailsError.contactPhone ? "#DC3545" : "#BABABA" }
            ]}
            placeholderTextColor={'#898787'}
            keyboardType="phone-pad"
            placeholder="e.g., +91 9876543210"
            value={details.contactPhone}
            onChangeText={(text) => {
              setDetails({ ...details, contactPhone: text })
              setDetailsError({ ...detailsError, contactPhone: false });
            }}
          />
          {detailsError.contactPhone && (
            <Text style={styles.errorText}>Contact Phone is required</Text>
          )}
          <Text style={styles.labelText} >Alternate Phone</Text>
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

          <Text style={styles.title}>Operating Hours Only (9:00 to 21:00)</Text>

          <FlatList
            data={days}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDayList}
          />

        </View> : selectedTab === 4 ? <View>
          <Text style={styles.title}>Studio Images</Text>
          <Text style={styles.labelText} >Upload high-quality images of your studio. First image will be used as cover photo.</Text>
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
              <Text style={styles.uploadTextHeader}>Upload Studio Images</Text>
              <Text style={styles.uploadTextDesc}>Click to browse your images</Text>
              <Text style={styles.supportedFilesText}>
                Supported formats: JPG, PNG, WebP. Max size: 5MB per image. Max 10 images.
              </Text>
              <Text style={styles.chooseFilesText}>Choose Files</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.labelText} >Cancellation Policy<Text style={styles.required}> *</Text></Text>
          {/* <Dropdown
            style={[styles.dropdown, { borderColor: imagesError.cancellationPolicy ? "#DC3545" : "#BABABA" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            containerStyle={styles.dropdownContainerStyle}
            data={cancellationPolicy}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Cancellation Policy"
            value={images.cancellationPolicy}
            onChange={(item) => {
              setImages({ ...images, cancellationPolicy: item.value });
              setImagesError({ ...imagesError, cancellationPolicy: false });
            }}
          /> */}
          <TextInput
            style={{ ...styles.input, ...styles.textArea, borderColor: imagesError.cancellationPolicy ? "#DC3545" : "#BABABA" }}
            placeholderTextColor={'#898787'}
            multiline
            placeholder="Write your cancellation rules here..."
            value={images.cancellationPolicy}
            onChangeText={(text) => {
              setImages({ ...images, cancellationPolicy: text });
              setImagesError({ ...imagesError, cancellationPolicy: false });
            }}
          />
          {imagesError.cancellationPolicy && (
            <Text style={styles.errorText}>Cancellation Policy is required</Text>
          )}
          <Text style={styles.labelText} >Payment Policy<Text style={styles.required}> *</Text></Text>

          {/* <Dropdown
            style={[styles.dropdown, { borderColor: imagesError.paymentPolicy ? "#DC3545" : "#BABABA" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            containerStyle={styles.dropdownContainerStyle}
            data={paymentPolicy}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Payment Policy"
            value={images.paymentPolicy}
            onChange={(item) => {
              setImages({ ...images, paymentPolicy: item.value });
              setImagesError({ ...imagesError, paymentPolicy: false });
            }}
          /> */}
          <TextInput
            style={{ ...styles.input, ...styles.textArea, borderColor: imagesError.paymentPolicy ? "#DC3545" : "#BABABA" }}
            placeholderTextColor={'#898787'}
            multiline
            placeholder="Write your payment rules here...."
            value={images.paymentPolicy}
            onChangeText={(text) => {
              setImages({ ...images, paymentPolicy: text });
              setImagesError({ ...imagesError, paymentPolicy: false });
            }}
          />
          {imagesError.paymentPolicy && (
            <Text style={styles.errorText}>Payment Policy is required</Text>
          )}
          <Text style={styles.labelText} >Additional Rules & Policies<Text style={styles.required}> *</Text></Text>
          <TextInput
            style={{ ...styles.input, ...styles.textArea, borderColor: imagesError.additionalRules ? "#DC3545" : "#BABABA" }}
            placeholderTextColor={'#898787'}
            multiline
            placeholder="e.g., Full refund before 24 hours, 50% refund within 24 hours, no refund for last-minute cancellations"
            value={images.additionalRules}
            onChangeText={(text) => {
              setImages({ ...images, additionalRules: text });
              setImagesError({ ...imagesError, additionalRules: false });
            }}
          />
          {imagesError.additionalRules && (
            <Text style={styles.errorText}>Additional Rules & Policies is required</Text>
          )}

        </View> :
          <View>
            {/* basic info list view */}
            <Text style={styles.title}>Basic Information</Text>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%', ...typography.semibold }} >Studio Name</Text>
              <Text style={styles.listInformation} >{' : '} {basicInfo.studioName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%', ...typography.semibold }} >Studio Type</Text>
              <Text style={styles.listInformation} >{' : '} {basicInfo.studioType}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%', ...typography.semibold }} >State</Text>
              <Text style={styles.listInformation} >{' : '} {basicInfo.state}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%', ...typography.semibold }} >City</Text>
              <Text style={styles.listInformation} >{' : '} {basicInfo.city}</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%', ...typography.semibold }} >Studio Size</Text>
              <Text style={styles.listInformation} >{' : '} {details.studioSize} sq ft</Text>
            </View>
            <View style={styles.row}>
              <Text style={{ ...styles.listInformation, minWidth: '30%', ...typography.semibold }} >Capacity</Text>
              <Text style={styles.listInformation} >{' : '} {details.maximumPeople} Peoples</Text>
            </View>

            {/* price and details view */}
            <Text style={styles.title}>Pricing and Booking</Text>
            {details.basePrice ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%', ...typography.semibold }}>
                  Base Price (per Hour)
                </Text>
                <Text style={styles.listInformation}>{' : '} ₹{details.basePrice}</Text>
              </View>
            ) : null}

            {details.weekendPrice ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%', ...typography.semibold }}>
                  Weekend Price (per Hour)
                </Text>
                <Text style={styles.listInformation}>{' : '} ₹{details.weekendPrice}</Text>
              </View>
            ) : null}

            {details.securityDeposit ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%', ...typography.semibold }}>
                  Security Deposit
                </Text>
                <Text style={styles.listInformation}>{' : '} ₹{details.securityDeposit}</Text>
              </View>
            ) : null}

            {details.overtimePrice ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%', ...typography.semibold }}>
                  Overtime Price (per Hour)
                </Text>
                <Text style={styles.listInformation}>{' : '} ₹{details.overtimePrice}</Text>
              </View>
            ) : null}

            {details.minBookingHours ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%', ...typography.semibold }}>
                  Min Booking Hours
                </Text>
                <Text style={styles.listInformation}>
                  {' : '} {details.minBookingHours} hours
                </Text>
              </View>
            ) : null}

            {details.maxBookingHours ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%', ...typography.semibold }}>
                  Max Booking Hours
                </Text>
                <Text style={styles.listInformation}>
                  {' : '} {details.maxBookingHours} hours
                </Text>
              </View>
            ) : null}

            {details.contactPhone ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%', ...typography.semibold }}>
                  Contact Phone
                </Text>
                <Text style={styles.listInformation}>
                  {' : '} +91 {details.contactPhone}
                </Text>
              </View>
            ) : null}

            {details.alternatePhone ? (
              <View style={styles.row}>
                <Text style={{ ...styles.listInformation, minWidth: '60%', ...typography.semibold }}>
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
          value={new Date("1970-01-01T09:00:00")}
          is24Hour={true}
          display="default"
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 18,
    lineHeight: 30,
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
    ...typography.bold,
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    ...typography.semibold,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  title: {
    color: '#101010',
    fontSize: 16,
    marginVertical: 15,
    ...typography.bold,
  },
  required: {
    color: '#DC3545'
  },
  labelText: {
    color: '#101010',
    fontSize: 15,
    marginTop: 12,
    marginBottom: 6,
    ...typography.bold,
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
    ...typography.semibold,
    paddingRight: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: "#FFFFFF",
  },
  nextText: {
    ...typography.semibold,
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
    ...typography.medium
  },
  chooseFilesText: {
    marginTop: 10,
    color: "#034833",
    ...typography.bold
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  listInformation: {
    color: '#101010',
    fontSize: 14,
    ...typography.bold
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
    ...typography.medium
  },
  DayText: {
    fontSize: 16,
    marginRight: 25,
    color: '#333', // Dark text color
    ...typography.medium
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
    ...typography.semibold
  },
  timeValue: {
    fontSize: 15,
    color: "#1B4332",
    ...typography.bold
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
    fontSize: 14,
    ...typography.bold
  },
  termsOutline: {
    flexDirection: 'row',
    alignItems: 'center'
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
