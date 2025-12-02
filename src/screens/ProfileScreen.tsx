import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  FlatList,
  ImageSourcePropType,
  Dimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types as DocumentTypes, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { philosopherTypography, typography } from '../constants/typography';
import { updateProfile, updateProfileImage } from "../features/profile/profileSlice";
import { useDispatch } from "react-redux";
import { getUserProfile } from "../lib/api";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { clearToken, clearUserData } from "../lib/http";
import imagePaths from "../constants/imagePaths";
import LinearGradient from "react-native-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";
import ProfileSkeleton from "../components/skeletonLoaders/ProfileSkeleton";
import { showError, showInfo, showSuccess } from "../utils/helperFunctions";
import { AnimatedDot } from "../components/AnimateDot";
import LogoutConfirmationModal from "../components/LogoutConfirmationModal";
import ConfirmationModal from "../components/ConfirmationModal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { kycUploadFile } from '../lib/api';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  const isFocused = useIsFocused();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = Dimensions.get('window');
  const WHY_CHOOSE_CARD_WIDTH = width * 0.9;

  type whyChoose = {
    id: string;
    image: ImageSourcePropType;
    title: string;
    desc: string;
  };

  const whyChooseImages = {
    camera: imagePaths.camera,
    thunder: imagePaths.thunder,
    payment: imagePaths.payment,
    star: imagePaths.star,
    target: imagePaths.target,
    mobile: imagePaths.mobile,
    // add more if needed
  };

  const whyChooseData: whyChoose[] = [
    { id: '1', image: whyChooseImages.camera, title: 'Professional Studios', desc: 'Access to premium photography studios with professional equipment' },
    { id: '2', image: whyChooseImages.thunder, title: 'Instant Booking', desc: 'Book studios instantly with real-time availability and pricing' },
    { id: '3', image: whyChooseImages.payment, title: 'Secure Payments', desc: 'Multiple payment options including UPI, cards, and digital wallets' },
    { id: '4', image: whyChooseImages.star, title: 'Verified Reviews', desc: 'Read authentic reviews from photographers and make informed decisions' },
    { id: '5', image: whyChooseImages.target, title: 'Equipment Included', desc: 'Access to professional lighting, cameras, and props included with bookings' },
    { id: '6', image: whyChooseImages.mobile, title: 'Mobile App', desc: 'Manage bookings, communicate, and access studios through our mobile app' },
  ];

  const navigateToLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const navigateToSignUp = () => {
    navigation.navigate('Auth', { screen: 'SignUp' });
  };

  const [activeTab, setActiveTab] = useState("personal"); // 'personal' or 'verification'
  const [loading, setLoading] = useState(false);

  // PERSONAL INFO STATES
  const [loggedInUser, setLoggedInUser] = useState(false)
  const [fullProfileData, setFullProfileData] = useState({});
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState({ status: false, header: '', message: '' });
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    description: "",
  });

  const [profileError, setProfileError] = useState({
    firstName: false,
    phone: false,
    location: false
  });

  const [documentError, setDocumentError] = useState({
    documentType: false,
    document: false,
  });

  const locations = [
    { label: "Mumbai", value: "Mumbai" },
    { label: "Delhi", value: "Delhi" },
    { label: "Bangalore", value: "Bangalore" },
    { label: "Chennai", value: "Chennai" },
    { label: "Hyderabad", value: "Hyderabad" },
    { label: "Pune", value: "Pune" },
  ];

  const documentTypes = [
    { label: "Aadhar Card", value: "aadhar" },
    { label: "Voter ID", value: "voter" },
    { label: "PAN Card", value: "pan" },
    { label: "Passport", value: "passport" },
    { label: "Driving Licence", value: "licence" },
  ];

  // VERIFICATION STATES
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(false);

  const KYC_STATUS_CONFIG = {
    pending: {
      icon: "hourglass-empty",
      color: "#A0A0A0",
      label: "KYC - Pending Verification",
      bg: "#F1F1F1"
    },
    submitted: {
      icon: "hourglass-top",
      color: "#FE9A55",
      label: "KYC - Submitted for Review",
      bg: "#FFF3E8"
    },
    approved: {
      icon: "check-circle",
      color: "#034833",
      label: "KYC - Verified Successfully",
      bg: "#E8F5E9"
    },
    rejected: {
      icon: "cancel",
      color: "#DC3545",
      label: "KYC - Rejected – Resubmit Required",
      bg: "#FDECEA"
    }
  };


  const KycBadge = ({ status }) => {
    const cfg = KYC_STATUS_CONFIG[status];

    if (!cfg) return null;

    return (
      <TouchableOpacity
        onPress={() => setActiveTab("verification")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 20,
          backgroundColor: cfg.bg,
          marginBottom: 10
        }}>
        <Icon name={cfg.icon} size={16} color={cfg.color} />
        <Text style={{ marginLeft: 6, fontSize: 13, color: cfg.color, fontWeight: "600" }}>
          {cfg.label}
        </Text>
      </TouchableOpacity>
    );
  };


  // --- API Call to Fetch Profile ---
  useEffect(() => {
    if (isFocused) {
      fetchProfile();
    }
  }, [isFocused]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res: any = await getUserProfile();
      const profileRoot = res?.profile ?? res?.customer ?? res;
      const cp = profileRoot?.customer_profiles ?? {};
      const nameParts = (profileRoot?.full_name ?? "").split(" ");
      setFullProfileData(profileRoot);
      setUploadedDocument(profileRoot?.kyc_status === "pending" ? false : true);
      setProfile({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: profileRoot?.email || "",
        phone: profileRoot?.phone || "",
        location: cp?.address?.city || "",
        description: cp?.bio || "", // add bio/description
      });
      setLoggedInUser(true);
    } catch (err) {
      setLoggedInUser(false);
      showInfo('Please login to view your profile!...')
    } finally {
      setLoading(false);
    }
  };


  const onOpenLogoutModal = () => {
    setLogoutVisible(true);
  };

  const onCloseLogoutModal = () => {
    setLogoutVisible(false);
  };

  const confirmLogout = async () => {
    try {
      setLogoutVisible(false);
      await clearToken();
      await clearUserData();
      fetchProfile();
      showSuccess('User logged out Successfully!...');
    } catch (error) {
      showError('Something went wrong!...');
      console.error(error);
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const width = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const renderWhuChooseCard = ({ item, index }: { item: whyChoose, index: number }) => (
    <LinearGradient key={item.id}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={['#2CBA9E', '#CEF9ED']}
      style={[styles.whyCard, { marginLeft: index == 0 ? 5 : -5, marginRight: index === whyChooseData.length - 1 ? 5 : 10, width: WHY_CHOOSE_CARD_WIDTH }]}>
      <View>
        <Image
          source={item.image}
          style={styles.whyIconImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.whyTextContent}>
        <Text style={styles.whyTitle}>{item.title}</Text>
        <Text style={styles.whySubtitle}>
          {item.desc}
        </Text>
      </View>
    </LinearGradient>
  );

  // --- Save Changes to API for update profile ---
  const handleSaveProfile = async () => {

    // 🧩 profile Validation
    const newErrors = {
      firstName: !profile.firstName,
      phone: !profile.phone,
      location: !profile.location
    };

    setProfileError(newErrors);

    // ❌ If any value is empty → show alert and stop
    if (Object.values(newErrors).includes(true)) {
      showError('Please fill all the required fields!...');
      return;
    }

    const mobileTrimmed = profile.phone.trim();

    if (!isValidMobile(mobileTrimmed)) {
      setMessageModalVisible({ status: true, header: 'Invalid Mobile Number', message: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        full_name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,

        address: { city: profile.location },
        bio: profile.description,
      };
      await dispatch(updateProfile(payload));
      showSuccess('Profile updated successfully!..')
    } catch (err: any) {
      showError('Something went wrong!...');
    } finally {
      setLoading(false);
      setIsEditing(false)
    }
  };

  const isValidMobile = (value: string) => {
    const mobileRegex = /^[0-9]{10}$/;   // Strict 10-digit Indian mobile number
    return mobileRegex.test(value);
  };

  const handleDocumentPick = async () => {
    try {
      const [doc] = await pick({
        type: [DocumentTypes.images, DocumentTypes.pdf],
        presentationStyle: 'fullScreen',
      });

      if (!doc) return;
      const type = (doc as any).type || '';
      const size = (doc as any).size || 0;
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      const isTypeOk = allowed.includes(type) || String(type).startsWith('image/');
      const isSizeOk = size > 0 && size <= 5 * 1024 * 1024;
      if (!isTypeOk) { showError('Invalid file type. Allowed: JPEG, PNG, WEBP, PDF'); return; }
      if (!isSizeOk) { showError('File size exceeds 5MB limit'); return; }

      const unified: any = {
        uri: (doc as any).uri,
        type,
        name: (doc as any).name || (doc as any).fileName,
        size,
      };

      setSelectedFile(unified);
      setDocumentError({ ...documentError, document: false });
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
      showError('Failed to open file picker');
    }
  };

  const onpressDocumentVerification = async () => {
    const newErrors = {
      documentType: !selectedDocType,
      document: !selectedFile,
    };
    setDocumentError(newErrors);
    if (Object.values(newErrors).includes(true)) {
      showError('Please fill all the required fields!...');
      return;
    }
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      showError('Missing authorization. Please log in.');
      return;
    }
    const apiDocType = (() => {
      const v = String(selectedDocType || '').toLowerCase();
      if (['aadhar', 'voter', 'pan', 'passport', 'licence'].includes(v)) return 'id_proof';
      if (['address', 'address_proof'].includes(v)) return 'address_proof';
      if (['business', 'business_license'].includes(v)) return 'business_license';
      return 'id_proof';
    })();
    const asset: any = selectedFile;
    const formData: any = new FormData();
    formData.append('document_type', apiDocType);
    const isPdf = String(asset?.type || '').toLowerCase() === 'application/pdf' || String(asset?.name || asset?.fileName || '').toLowerCase().endsWith('.pdf');
    const filename = asset?.fileName || asset?.name || `kyc_${Date.now()}.${isPdf ? 'pdf' : 'jpg'}`;
    const mime = asset?.type || (isPdf ? 'application/pdf' : 'image/jpeg');
    formData.append('file', {
      uri: asset?.uri,
      type: mime,
      name: filename,
    } as any);
    try {
      const data: any = await kycUploadFile(formData);
      console.log('KYC upload response:', { status: 200, ok: true, data });
      showSuccess('KYC document uploaded successfully');
      setSelectedDocType('');
      setSelectedFile(null);
    } catch (e: any) {
      console.log('KYC upload error:', e);
      showError(e?.error || 'Failed to upload file');
    }
  }

  const handleProfilePick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      setSelectedProfile(image);

      // 🧠 Correctly append image file to FormData
      const formdata = new FormData();
      formdata.append('file', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `profile_${Date.now()}.jpg`,
      });

      try {
        const response = await dispatch(updateProfileImage(formdata)).unwrap();

        // 🧠 Update local state on success
        setFullProfileData((prev) => ({
          ...prev,
          customer_profiles: {
            ...prev?.customer_profiles,
            profile_image_url: response?.updated_image_url || image.uri,
          },
        }));

        // Optional: show success toast
        // Toast.show('Profile updated successfully!');
        showSuccess('profile image Updated successfully!...');
      } catch (error) {
        console.error('❌ Error updating profile:', error);
        showError('Something went wrong!...');
      }
    }
  };

  const convertedUserType = (type: string) => {
    let userType = 'User'
    switch (type) {
      case 'studio_owner':
        userType = 'Studio owner';
        break;
      // case 'photographer':
      //   userType = 'Photographer';
      //   break;
      case 'photographer':
        userType = 'User';
        break;

      case 'client':
        userType = 'User';
        break;

      default:
        userType = 'User';
    }
    return userType;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading */}
      {loading ?
        <ProfileSkeleton /> :

        <>
          {loggedInUser ?
            <View style={styles.container}>
              <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={handleProfilePick} style={styles.profileImageOutline}>
                  <Image
                    source={
                      selectedProfile
                        ? { uri: selectedProfile.uri }
                        : fullProfileData?.customer_profiles?.profile_image_url
                          ? { uri: fullProfileData?.customer_profiles.profile_image_url }
                          : require('../assets/images/logoo.png')
                    }
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cameraOutline}>
                    <Icon
                      name={"edit"}
                      size={22}
                      color='#034833'
                    />
                  </View>
                </TouchableOpacity>
                <KycBadge status={fullProfileData?.kyc_status} />
                <View style={styles.userDetailOutline}>
                  <Text style={styles.userName}>{fullProfileData?.full_name}</Text>
                  <Text style={styles.userRole}>
                    ( {convertedUserType(fullProfileData?.customer_profiles?.user_type)} )
                  </Text>
                </View>

                <TouchableOpacity onPress={onOpenLogoutModal} style={styles.logoutBtn}>
                  <Icon name="logout" size={20} color="#FFFFFF" />
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    activeTab === "personal" && styles.toggleButtonActive
                  ]}
                  onPress={() => setActiveTab("personal")}
                >
                  <Icon
                    name="person"
                    size={16}
                    color={activeTab === "personal" ? COLORS.background : COLORS.text.secondary}
                  />
                  <Text style={[
                    styles.toggleButtonText,
                    activeTab === "personal" && styles.toggleButtonTextActive
                  ]}>
                    Personal Info
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    activeTab === "verification" && styles.toggleButtonActive
                  ]}
                  onPress={() => setActiveTab("verification")}
                >
                  <Icon
                    name="verified-user"
                    size={16}
                    color={activeTab === "verification" ? COLORS.background : COLORS.text.secondary}
                  />
                  <Text style={[
                    styles.toggleButtonText,
                    activeTab === "verification" && styles.toggleButtonTextActive
                  ]}>
                    Verification
                  </Text>
                </TouchableOpacity>
              </View>


              {/* PERSONAL INFO TAB */}
              {activeTab === "personal" && !loading && (
                <ScrollView>
                  <View style={{ backgroundColor: isEditing ? '#FFFFFF' : "#f5f5f5", padding: 16 }}>
                    <View style={styles.editHeader}>
                      <Text style={styles.sectionTitle}>Personal Information</Text>
                      <TouchableOpacity
                        style={[
                          styles.toggleEditButton,
                          isEditing ? styles.viewMode : styles.editMode
                        ]}
                        onPress={() => setIsEditing(!isEditing)}
                      >
                        <Icon
                          name={isEditing ? "remove-red-eye" : "edit"}
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.toggleEditButtonText}>
                          {isEditing ? "View" : "Edit"}
                        </Text>
                      </TouchableOpacity>

                    </View>

                    {/* If not editing – just show info */}
                    {!isEditing ? (
                      <>
                        <Text style={styles.infoLabel}>First Name</Text>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoValue}>{profile.firstName || '-'}</Text>
                        </View>
                        <Text style={styles.infoLabel}>Last Name</Text>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoValue}>{profile.lastName || '-'}</Text>
                        </View>
                        <Text style={styles.infoLabel}>Email</Text>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoValue}>{profile.email || '-'}</Text>
                        </View>
                        <Text style={styles.infoLabel}>Phone Number</Text>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoValue}>{profile.phone || '-'}</Text>
                        </View>
                        <Text style={styles.infoLabel}>Location</Text>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoValue}>{profile.location || '-'}</Text>
                        </View>
                        <Text style={styles.infoLabel}>About</Text>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoValue}>{profile.description || '-'}</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        {/* Editable Mode */}
                        <Text style={styles.labelText} >First Name<Text style={styles.required}> *</Text></Text>
                        <TextInput
                          style={[styles.input, { borderColor: profileError.firstName ? "#DC3545" : "#BABABA" }]}
                          placeholderTextColor={'#898787'}
                          placeholder="First Name"
                          value={profile.firstName}
                          onChangeText={(text) => {
                            setProfile({ ...profile, firstName: text });
                            setProfileError({ ...profileError, firstName: false });
                          }}
                        />
                        {profileError.firstName && (
                          <Text style={styles.errorText}>First Name is required</Text>
                        )}
                        <Text style={styles.labelText} >Last Name</Text>

                        <TextInput
                          style={styles.input}
                          placeholderTextColor={'#898787'}
                          placeholder="Last Name"
                          value={profile.lastName}
                          onChangeText={(text) =>
                            setProfile({ ...profile, lastName: text })
                          }
                        />
                        <Text style={styles.labelText} >Email (Read Only)</Text>

                        <TextInput
                          style={[styles.input, styles.readOnly]}
                          placeholderTextColor={'#898787'}
                          placeholder="Email"
                          editable={false}
                          value={profile.email}
                        />

                        <Text style={styles.labelText} >Phone Number<Text style={styles.required}> *</Text></Text>

                        <TextInput
                          style={[styles.input, { borderColor: profileError.phone ? "#DC3545" : "#BABABA" }]}
                          placeholderTextColor={'#898787'}
                          placeholder="Phone Number"
                          keyboardType="phone-pad"
                          value={profile.phone}
                          onChangeText={(text) => {
                            setProfile({ ...profile, phone: text });
                            setProfileError({ ...profileError, phone: false });
                          }}
                        />
                        {profileError.phone && (
                          <Text style={styles.errorText}>Phone Number is required</Text>
                        )}

                        {/* Dropdown */}
                        <Text style={styles.labelText} >Location<Text style={styles.required}> *</Text></Text>

                        <Dropdown
                          style={[styles.dropdown, { borderColor: profileError.location ? "#DC3545" : "#BABABA" }]}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          containerStyle={styles.dropdownContainerStyle}
                          data={locations}
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder="Select your location"
                          value={profile.location}
                          onChange={(item) => {
                            setProfile({ ...profile, location: item.value });
                            setProfileError({ ...profileError, location: false });
                          }}
                        />
                        {profileError.location && (
                          <Text style={styles.errorText}>Location is required</Text>
                        )}

                        <Text style={styles.labelText} >About</Text>

                        <TextInput
                          style={[styles.input, styles.textArea]}
                          placeholderTextColor={'#898787'}
                          placeholder="Tell us about yourself and your photography style..."
                          multiline
                          value={profile.description}
                          onChangeText={(text) =>
                            setProfile({ ...profile, description: text })
                          }
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                          <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </ScrollView>
              )}

              {/* VERIFICATION TAB */}
              {activeTab === "verification" && !loading && (
                <>
                  {/* ---------- KYC STATUS BLOCK (SUBMITTED / APPROVED / REJECTED) ---------- */}
                  {(fullProfileData?.kyc_status === "submitted" ||
                    fullProfileData?.kyc_status === "approved" ||
                    fullProfileData?.kyc_status === "rejected") && uploadedDocument ? (

                    <View style={styles.statusContainer}>
                      <Icon
                        name={
                          fullProfileData?.kyc_status === "submitted"
                            ? "hourglass-top"
                            : fullProfileData?.kyc_status === "approved"
                              ? "verified-user"
                              : "cancel"
                        }
                        size={30}
                        color={
                          fullProfileData?.kyc_status === "submitted"
                            ? "#FE9A55"
                            : fullProfileData?.kyc_status === "approved"
                              ? "#034833"
                              : "#DC3545"
                        }
                      />

                      <Text style={styles.statusTitle}>
                        {fullProfileData?.kyc_status === "submitted"
                          ? "Submitted for Verification"
                          : fullProfileData?.kyc_status === "approved"
                            ? "Verification Approved"
                            : "Verification Rejected"}
                      </Text>

                      <Text style={styles.statusMessage}>
                        {fullProfileData?.kyc_status === "submitted"
                          ? "Your document has been successfully submitted and is currently under review. You will be notified once the verification is complete."
                          : fullProfileData?.kyc_status === "approved"
                            ? "Your document has been verified successfully! Your identity is now confirmed."
                            : "Your verification attempt was rejected. Please upload clear and valid documents to continue."}
                      </Text>

                      {/* If rejected, allow re-submit */}
                      {fullProfileData?.kyc_status === "rejected" && (
                        <TouchableOpacity
                          style={styles.retryButton}
                          onPress={() => setUploadedDocument(false)}
                        >
                          <Text style={styles.retryButtonText}>Re-Submit Document</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                  ) : (
                    /* ---------- NORMAL DOCUMENT UPLOAD UI ---------- */
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                      <Text style={styles.labelText} >Select Document Type<Text style={styles.required}> *</Text></Text>
                      <Dropdown
                        style={[styles.dropdown, { borderColor: documentError.documentType ? "#DC3545" : "#BABABA" }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        containerStyle={styles.dropdownContainerStyle}
                        data={documentTypes}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Choose document type"
                        value={selectedDocType}
                        onChange={(item) => {
                          setSelectedDocType(item.value);
                          setDocumentError({ ...documentError, documentType: false });
                        }}
                      />

                      {documentError.documentType && (
                        <Text style={styles.errorText}>Document type is required</Text>
                      )}

                      <Text style={styles.labelText} >Select a Document<Text style={styles.required}> *</Text></Text>
                      {selectedFile ?
                        <TouchableOpacity style={[styles.uploadButton, { borderColor: documentError.document ? "#DC3545" : "#BABABA" }]}
                          onPress={handleDocumentPick} >
                          {String(((selectedFile as any)?.type || '')).startsWith('image/') ? (
                            <Image
                              source={{ uri: (selectedFile as any)?.uri }}
                              style={styles.selectedImage}
                              resizeMode={"cover"}
                            />
                          ) : (
                            <View style={styles.pdfPreviewRow}>
                              <Icon name="picture-as-pdf" size={32} color="#DC3545" />
                              <View style={{ marginLeft: 8, flex: 1 }}>
                                <Text style={styles.uploadTextHeader} numberOfLines={1}>{(selectedFile as any)?.name || (selectedFile as any)?.fileName || 'Selected PDF'}</Text>
                                <Text style={styles.uploadTextDesc}>{Math.round((((selectedFile as any)?.size || 0) / 1024))} KB</Text>
                              </View>
                            </View>
                          )}
                        </TouchableOpacity> :
                        <TouchableOpacity style={[styles.uploadButton, { borderColor: documentError.document ? "#DC3545" : "#BABABA" }]}
                          onPress={handleDocumentPick} >
                          <Icon name="cloud-upload" size={28} color="#034833" />
                          <Text style={styles.uploadTextHeader}>Upload Document</Text>
                          <Text style={styles.uploadTextDesc}>Click to browse your file</Text>
                          <Text style={styles.supportedFilesText}>
                            Supported formats: JPG, PNG, WebP, PDF. Max size: 5MB.
                          </Text>
                          <Text style={styles.chooseFilesText}>Choose File</Text>
                        </TouchableOpacity>}
                      {documentError.document && (
                        <Text style={styles.errorText}>Document is required</Text>
                      )}

                      <TouchableOpacity onPress={onpressDocumentVerification} style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Submit for Verification</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  )}
                </>
              )}
            </View> :
            <View style={styles.logoutUserContainer}>
              <ImageBackground
                source={imagePaths.LoginBg}
                resizeMode="cover"
                style={styles.backgroundImage}
              >
                <ScrollView
                  contentContainerStyle={styles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Logo Section */}
                  <View style={styles.logoContainer}>
                    <Image
                      source={imagePaths.logo}
                      style={styles.headerLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.tagline}>Discover Your</Text>
                    <Text style={styles.taglineSecond}>Best Photo Studio, Photographers</Text>
                  </View>

                  {/* Form Section */}
                  <View style={styles.formContainer}>

                    {/* Login Button */}
                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={navigateToLogin}
                    >
                      <Text style={styles.loginButtonText}>
                        Log In
                      </Text>
                    </TouchableOpacity>

                    {/* Signup Button */}
                    <TouchableOpacity
                      style={styles.signupButton}
                      onPress={navigateToSignUp}
                    >
                      <Text style={styles.signupButtonText}>
                        Sign Up
                      </Text>
                    </TouchableOpacity>

                  </View>

                  {/* Why Choose Book My Shoot? */}
                  <View style={styles.section}>
                    <Text style={styles.whyHeading}>Why Choose Book My Shoot?</Text>
                    <FlatList
                      data={whyChooseData}
                      ref={flatListRef}
                      renderItem={renderWhuChooseCard}
                      keyExtractor={(item) => item.id}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.studioList}
                      onMomentumScrollEnd={handleScroll}
                    />
                    <View style={styles.dotsRow}>
                      {whyChooseData.map((_, index) => (
                        <AnimatedDot key={index} isActive={currentIndex === index} />
                      ))}
                    </View>



                  </View>

                </ScrollView>
              </ImageBackground>
            </View>

          }
        </>}
      <LogoutConfirmationModal
        Visible={logoutVisible}
        onClose={onCloseLogoutModal}
        onSubmit={confirmLogout} />

      <ConfirmationModal
        Visible={messageModalVisible.status}
        Header={messageModalVisible.header}
        Message={messageModalVisible.message}
        OnSubmit={() => setMessageModalVisible({ status: false, header: '', message: '' })}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoutUserContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLogo: {
    width: 160,
    height: 120,
    marginBottom: 10
  },
  tagline: {
    fontSize: 18,
    color: '#2C5530',
    ...philosopherTypography.bold,
    textAlign: 'center',
  },
  taglineSecond: {
    fontSize: 18,
    color: '#2C5530',
    ...philosopherTypography.bold,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 50,
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#034833',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 10
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    ...typography.bold,
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#034833',
    marginVertical: 10
  },
  signupButtonText: {
    color: '#034833',
    fontSize: 18,
    ...typography.bold,
  },
  tempButton: {
    width: "90%",
    backgroundColor: '#034833',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },

  tempButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    ...typography.semibold,
  },

  signUpButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#034833',
  },

  signUpButtonText: {
    color: '#034833',
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logo: {
    width: 185,
    height: 140,
    marginTop: 20,
    marginBottom: 30
  },
  titleText: {
    color: "#034833",
    fontSize: 20,
    ...typography.bold,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    color: "#101010",
    ...typography.bold,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#BABABA",
    color: '#101010',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#ffffff",
    ...typography.semibold,
  },
  readOnly: {
    backgroundColor: "#f5f5f5",
    color: "#101010",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#034833",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    ...typography.bold,
    fontSize: 16,
  },
  label: {
    fontSize: 15,
    ...typography.medium,
    marginBottom: 6,
  },
  labelText: {
    color: '#101010',
    fontSize: 14,
    ...typography.medium,
    marginBottom: 6,
    marginTop: 12
  },
  uploadButton: {
    borderWidth: 1,
    width: '100%',
    height: 200,
    borderColor: "#BABABA",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextHeader: {
    ...typography.bold,
    color: "#101010",
    fontSize: 16,
    marginTop: 10,
  },
  uploadTextDesc: {
    fontSize: 13,
    color: "#555",
    marginTop: 5,
    ...typography.semibold,
  },
  supportedFilesText: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
    textAlign: "center",
    ...typography.medium,
  },
  chooseFilesText: {
    marginTop: 10,
    ...typography.bold,
    color: "#034833",
  },
  pdfPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: "#034833",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    ...typography.bold,
    fontSize: 16,
  },
  placeholderImage: {
    height: 60,
    width: 60
  },
  selectedImage: {
    height: 150,
    width: 150,
    borderRadius: 10
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  profileImageOutline: {
    width: 120,
    height: 120,
    marginBottom: 10,
    borderRadius: 100, // makes it circular
    borderWidth: 1,
    borderColor: '#034833', // green outline
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
  },
  cameraOutline: {
    backgroundColor: '#fff',
    borderRadius: 100,
    borderColor: '#101010',
    borderWidth: 1,
    padding: 4,
    position: 'absolute',
    right: 3,
    bottom: 3
  },
  userDetailOutline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // light Android shadow
  },

  userName: {
    color: '#101010',
    fontSize: 16,
    textAlign: 'center',
    alignItems: 'center',
    ...typography.bold,
    marginRight: 6,
  },

  userRole: {
    color: '#6C757D',
    fontSize: 14,
    ...typography.medium,
    marginRight: 6,
  },

  userEmail: {
    color: '#101010',
    fontSize: 14,
    ...typography.semibold,
    marginRight: 6,
    flexShrink: 1,
  },

  userPhone: {
    color: '#101010',
    fontSize: 14,
    ...typography.semibold,
    marginRight: 6,
    flexShrink: 1,
  },

  userStatus: {
    fontSize: 10,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    ...typography.bold,
    color: '#034833',
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whyHeading: {
    marginBottom: 10,
    fontSize: 18,
    color: '#034833',
    ...typography.bold,
  },
  studioList: {
    paddingBottom: 5,
  },
  whyCard: {
    borderRadius: 14,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  whyIconImage: {
    width: 90,
    height: 90,
  },
  whyTextContent: {
    flex: 1,
    marginLeft: 20,
  },
  whyTitle: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 6,
    ...typography.bold,
  },
  whySubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
    ...typography.semibold,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  editIconOutline: {
    padding: 5,
    backgroundColor: '#034833',
    borderWidth: 1,
    borderRadius: 100
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
    color: '#101010',
    fontSize: 15,
    marginBottom: 6,
    ...typography.medium,
  },

  infoValue: {
    color: '#101010',
    fontSize: 15,
    ...typography.semibold,
  },
  logoutBtn: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 6,
    ...typography.bold,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    borderColor: COLORS.bg,
    borderWidth: 1,
    padding: 8,
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
    ...typography.semibold,
    color: COLORS.text.secondary,
    marginLeft: 6,
  },
  toggleButtonTextActive: {
    color: COLORS.background,
    ...typography.bold,
  },
  required: {
    color: '#DC3545'
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    ...typography.semibold,
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
    ...typography.bold,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#101010',
    ...typography.bold,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    color: '#101010',
    borderRadius: 10,
    ...typography.bold,
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
  statusContainer: {
    backgroundColor: "#F4F7FA",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    margin: 16,
    borderWidth: 1,
    borderColor: "#DDE3EB",
  },
  statusTitle: {
    marginTop: 10,
    fontSize: 17,
    ...typography.bold,
    color: "#101010",
  },
  statusMessage: {
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    ...typography.semibold,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#034833",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    ...typography.medium,
  },
  toggleEditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: "center",
  },

  editMode: {
    backgroundColor: "#034833", // Edit profile button (Green)
  },

  viewMode: {
    backgroundColor: "#FE9A55", // View profile button (Orange)
  },

  toggleEditButtonText: {
    color: "#FFFFFF",
    marginLeft: 6,
    fontSize: 16,
    ...typography.semibold,
  },

});

export default ProfileScreen;
