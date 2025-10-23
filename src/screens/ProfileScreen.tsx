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
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { Picker } from "@react-native-picker/picker";
import { updateProfile } from "../features/profile/profileSlice";
import { useDispatch } from "react-redux";
import { getUserProfile } from "../lib/api";

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

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

  // --- API Call to Fetch Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res: any = await getUserProfile();
        const profileRoot = res?.profile ?? res?.customer ?? res;
        const cp = profileRoot?.customer_profiles ?? {};
        const nameParts = (profileRoot?.full_name ?? "").split(" ");
        setFullProfileData(res);
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

    fetchProfile();
  }, []);


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
      setSelectedProfile(result.assets[0]);
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
                            source={ selectedProfile ? {uri: selectedProfile?.uri} : require('../assets/images/logoo.png')} 
                            style={styles.profileImage}
                            resizeMode="cover"
                          />
                          <View style={styles.cameraOutline}>
                            <Image
                            source={require('../assets/images/camera.png')} 
                            style={styles.camera}
                            resizeMode="contain"
                          />
                          </View>
                          </TouchableOpacity>
                          <View style={styles.userDetailOutline}>
                          <Text style={styles.userName}>{fullProfileData?.full_name}</Text> <Text style={styles.userRole}>( {fullProfileData?.customer_profiles?.user_type} )</Text> <Text style={fullProfileData?.kyc_status == "pending" ? styles.userNotVerified : styles.userVerified}>{fullProfileData?.kyc_status == "pending" ? "Not Verified" : "Verified" }</Text>
                          </View>
                          <View style={styles.userDetailOutline}>
                          <Text style={styles.userEmail}>U{fullProfileData?.email}</Text> <Text style={fullProfileData?.email_verified ? styles.userVerified : styles.userNotVerified}>{fullProfileData?.email_verified ? "Verified" : "Not Verified" }</Text>
                          </View>
                          <View style={styles.userDetailOutline}>
                          <Text style={styles.userPhone}>{fullProfileData?.phone}</Text> <Text style={fullProfileData?.phone_verified ? styles.userVerified : styles.userNotVerified}>{fullProfileData?.phone_verified ? "Verified" : "Not Verified" }</Text>
                          </View>
      </View>     

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "personal" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("personal")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "personal" && styles.activeTabText,
            ]}
          >
            Personal Info
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "verification" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("verification")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "verification" && styles.activeTabText,
            ]}
          >
            Verification
          </Text>
        </TouchableOpacity>
      </View>
      

      {/* PERSONAL INFO TAB */}
      {activeTab === "personal" && !loading && (
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.labelText} >First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={profile.firstName}
            onChangeText={(text) =>
              setProfile({ ...profile, firstName: text })
            }
          />
          <Text style={styles.labelText} >Last Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={profile.lastName}
            onChangeText={(text) =>
              setProfile({ ...profile, lastName: text })
            }
          />
          <Text style={styles.labelText} >Email</Text>

          <TextInput
            style={[styles.input, styles.readOnly]}
            placeholder="Email"
            editable={false}
            value={profile.email}
          />

          <Text style={styles.labelText} >Phone Number</Text>

          <TextInput
            style={styles.input}
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
            placeholder="Tell us about yourself and your photography style..."
            multiline
            placeholderTextColor={'#BABABA'}
            value={profile.description}
            onChangeText={(text) =>
              setProfile({ ...profile, description: text })
            }
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* VERIFICATION TAB */}
      {activeTab === "verification" && !loading && (
        <ScrollView contentContainerStyle={styles.formContainer}>
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

          <Text style={styles.labelText} >{selectedFile ? 'Selected Document' : 'Select Document'}</Text>

          <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
            <Image
                            source={selectedFile ? {uri: selectedFile?.uri} : require('../assets/images/camera.png')} 
                            style={selectedFile ? styles.selectedImage : styles.placeholderImage}
                            resizeMode={selectedFile ? "cover" : 'contain'}
                          />
            <Text style={styles.uploadText}>
              {selectedFile ? selectedFile.fileName : "Select Document"}
            </Text>
          </TouchableOpacity>

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
    </> }
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
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
  },
  activeTabText: {
    color: "#034833",
    fontWeight: "600",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    color: "#101010",
    fontWeight: "bold",
    fontSize: 16,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#BABABA",
    color: '#101010',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#ffffff",
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
    fontWeight: "bold",
    fontSize: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
   labelText: {
    color: '#BABABA',
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  uploadButton: {
    borderWidth: 1,
    width: '100%',
    height: 200,
    borderColor: '#034833',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: "#101010",
    marginTop: 10
  },
  submitButton: {
    backgroundColor: "#034833",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
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
    marginVertical: 20,
  },
  profileImageOutline: {
    width: 120,
    height: 120,
    borderRadius: 60, // makes it circular
    borderWidth: 2,
    borderColor: '#034833', // green outline
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  cameraOutline: {
    backgroundColor: '#fff',
    borderRadius: 100,
    borderColor: '#000',
    borderWidth: 1,
    padding: 5,
    position: 'absolute',
    right: 3,
    bottom: 3
  },
  camera: {
    height: 22,
    width: 22
  },
  userDetailOutline: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 5
  },
     userName: {
    color: '#101010',
    fontSize: 16,
    marginRight: 6,
    fontWeight: "800",
    marginBottom: 5,
  },
  userRole: {
    color: '#101010',
    fontSize: 14,
    marginRight: 6,
    fontWeight: "600",
  },
  userEmail: {
    color: '#101010',
    fontSize: 14,
    marginRight: 6,
    fontWeight: "600",
  },
  userPhone: {
    color: '#101010',
    fontSize: 14,
    marginRight: 6,
    fontWeight: "600",
  },
  userVerified: {
    color: '#FFFFFF',
    fontSize: 12,
    backgroundColor: '#034833',
    padding: 5,
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: "400",
  },
  userNotVerified: {
    color: '#FFFFFF',
    fontSize: 12,
    backgroundColor: '#DC3545',
    padding: 5,
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: "400",
  },
});

export default ProfileScreen;