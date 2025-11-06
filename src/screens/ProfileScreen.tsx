import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { typography } from '../constants/typography';
import { Picker } from "@react-native-picker/picker";
import { updateProfile, updateProfileImage } from "../features/profile/profileSlice";
import { useDispatch } from "react-redux";
import { getUserProfile } from "../lib/api";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { clearToken, clearUserData } from "../lib/http";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

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
  const [fullProfileData, setFullProfileData] = useState()
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    description: "",
  });

  const [locations, setLocations] = useState([
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Pune",
  ]);

  // VERIFICATION STATES
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // --- API Call to Fetch Profile ---
  useEffect(() => {
    if(isFocused)
    {
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
    } finally {
      setLoading(false);
    }
  };

  const onLogoutPress = async () => {
    try {
      await clearToken();
      await clearUserData();
      fetchProfile();
    } catch {
      return null;
    }
  }

  // --- Save Changes to API ---
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: any = {
        full_name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,

        address: { city: profile.location },
        bio: profile.description,
      };
      await dispatch(updateProfile(payload));
    } catch (err: any) {
    } finally {
      setLoading(false);
      setIsEditing(false)
    }
  };

  const handleDocumentPick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setSelectedFile(result.assets[0]);
    }
  };

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
      console.log('✅ Profile updated successfully:', response);

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
    } catch (error) {
      console.error('❌ Error updating profile:', error);
    }
  }
};



  return (
    <>
      {/* Loading */}
      {loading ?
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#034833" />
          <Text style={styles.loadingText}>Loading....</Text>
        </View> :

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
                          ? { uri: fullProfileData.customer_profiles.profile_image_url }
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
                <View style={styles.userDetailOutline}>
                  <Text style={styles.userName}>{fullProfileData?.full_name}</Text> <Text style={styles.userRole}>( {fullProfileData?.customer_profiles?.user_type} )</Text>
                  {/* <Text style={styles.userStatus}>{fullProfileData?.kyc_status == "pending" ? "❌" : "✅" }</Text> */}
                </View>
                <TouchableOpacity onPress={onLogoutPress} style={styles.logoutBtn}>
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>
                {/* <View style={styles.userDetailOutline}>
                          <Text style={styles.userEmail}>{fullProfileData?.email}</Text> <Text style={styles.userStatus}>{fullProfileData?.email_verified ? "✅" : "❌" }</Text>
                          </View>
                          <View style={styles.userDetailOutline}>
                          <Text style={styles.userPhone}>+91 {fullProfileData?.phone}</Text> <Text style={styles.userStatus}>{fullProfileData?.phone_verified ? "✅" : "❌" }</Text>
                          </View> */}
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
                      <TouchableOpacity style={styles.editIconOutline} onPress={() => setIsEditing(!isEditing)}>
                        <Icon
                          name={isEditing ? "save" : "edit"}
                          size={22}
                          color="#FFFFFF"
                        />

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
                        <Text style={styles.labelText} >First Name</Text>
                        <TextInput
                          style={styles.input}
                          placeholderTextColor={'#898787'}
                          placeholder="First Name"
                          value={profile.firstName}
                          onChangeText={(text) =>
                            setProfile({ ...profile, firstName: text })
                          }
                        />
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

                        <Text style={styles.labelText} >Phone Number</Text>

                        <TextInput
                          style={styles.input}
                          placeholderTextColor={'#898787'}
                          placeholder="Phone Number"
                          keyboardType="phone-pad"
                          value={profile.phone}
                          onChangeText={(text) =>
                            setProfile({ ...profile, phone: text })
                          }
                        />

                        {/* Dropdown */}
                        <Text style={styles.labelText} >Location</Text>
                        <View style={styles.pickerWrapper}>
                          <Picker
                            selectedValue={profile.location} // Must match one of Picker.Item values
                            onValueChange={(value) => setProfile({ ...profile, location: value })}
                            dropdownIconColor="#034833" // Color of the arrow
                            style={{ color: '#101010' }} // Color of the selected text
                          >
                            <Picker.Item label="Choose location" value="" />
                            {locations.map((loc, index) => (
                              <Picker.Item key={index} label={loc} value={loc} />
                            ))}
                          </Picker>
                        </View>

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

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                          <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </ScrollView>
              )}

              {/* VERIFICATION TAB */}
              {activeTab === "verification" && !loading && (
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                  <Text style={styles.labelText} >Select Document Type</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedDocType} // Must match one of Picker.Item values
                      onValueChange={(value) => setSelectedDocType(value)}
                      dropdownIconColor="#034833" // Color of the arrow
                      style={{ color: '#101010' }} // Color of the selected text
                    >
                      <Picker.Item label="Choose document type" value="" />
                      <Picker.Item label="Aadhar Card" value="aadhar" />
                      <Picker.Item label="Voter ID" value="voter" />
                      <Picker.Item label="PAN Card" value="pan" />
                      <Picker.Item label="Passport" value="passport" />
                      <Picker.Item label="Driving Licence" value="licence" />
                    </Picker>
                  </View>

                  <Text style={styles.labelText} >Select a Document</Text>

                  {/* <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
                    <Image
                      source={selectedFile ? { uri: selectedFile?.uri } : require('../assets/images/camera.png')}
                      style={selectedFile ? styles.selectedImage : styles.placeholderImage}
                      resizeMode={selectedFile ? "cover" : 'contain'}
                    />
                    <Text style={styles.uploadText}>
                      {selectedFile ? selectedFile.fileName : "Select Document"}
                    </Text>
                  </TouchableOpacity> */}
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
                      <Text style={styles.uploadTextHeader}>Upload Document Image</Text>
                      <Text style={styles.uploadTextDesc}>Click to browse your image</Text>
                      <Text style={styles.supportedFilesText}>
                        Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
                      </Text>
                      <Text style={styles.chooseFilesText}>Choose File</Text>
                    </TouchableOpacity>}

                  <TouchableOpacity style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Submit for Verification</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View> :
            <View style={styles.logoutUserContainer}>

              <View style={styles.tempButtonsContainer}>

                <TouchableOpacity style={styles.tempButton} onPress={navigateToLogin}>
                  <Text style={styles.tempButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.tempButton, styles.signUpButton]} onPress={navigateToSignUp}>
                  <Text style={[styles.tempButtonText, styles.signUpButtonText]}>SignUp</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        </>}
    </>
  );
};

const styles = StyleSheet.create({
  logoutUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 28,
    ...typography.bold,
    color: '#034833',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 30,
  },

  tempButtonsContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },

  tempTitle: {
    fontSize: 16,
    ...typography.semibold,
    color: '#034833',
    marginBottom: 16,
    textAlign: 'center',
  },

  tempButton: {
    backgroundColor: '#034833',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },

  tempButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    ...typography.semibold,
  },

  signUpButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#034833',
  },

  signUpButtonText: {
    color: '#034833',
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#ffffff",
    ...typography.semibold,
  },
  readOnly: {
    backgroundColor: "#f5f5f5",
    color: "#101010",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 12,
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
    color: '#6C757D',
    fontSize: 15,
    ...typography.medium,
    marginBottom: 6,
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
    ...typography.semibold,
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
    ...typography.bold,
    color: "#034833",
  },
  submitButton: {
    backgroundColor: "#034833",
    paddingVertical: 14,
    borderRadius: 10,
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
    width: 115,
    height: 115,
    borderRadius: 55,
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
    paddingVertical: 8,
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
    color: '#6C757D',
    fontSize: 15,
    ...typography.medium,
    marginBottom: 6,
  },

  infoValue: {
    color: '#101010',
    fontSize: 15,
    ...typography.semibold,
  },
  logoutBtn: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    ...typography.semibold,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
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
    ...typography.semibold,
    color: COLORS.text.secondary,
    marginLeft: 6,
  },
  toggleButtonTextActive: {
    color: COLORS.background,
  },
});

export default ProfileScreen;