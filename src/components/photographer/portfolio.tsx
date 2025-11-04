import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../constants";


// --- Main Component ---
export const PortfolioComponent = () => {
    const [selectedFile, setSelectedFile] = useState('');
    const [addPortfolio, setAddPortfolio] = useState({
        portfolioTitle: "",
        portfoliocategory: "",
        portfolioDesc: "",
        featured: false,
    });
    const [activeTab, setActiveTab] = useState("portfolio"); // 'portfolio' or 'Add Portfolio'

    // --- Data for the Studio Cards ---
    const serviceData = [
        {
            id: '1',
            title: 'wedding',
            category: 'Wedding Photography',
            desc: 'we can give the best wedding photo service',
            featured: true,
            image: 'https://fotocentreindia.com/wp-content/uploads/2020/01/Ulanzi-MT-08-Extendable-Mini-Tripod-Online-Buy-Mumbai-India-4.jpg' // Placeholder image
        },
        {
            id: '2',
            title: 'Pre-wedding',
            category: 'Engagement & Pre-wedding Shoots',
            desc: 'Professional Engagement & Pre-wedding photography',
            featured: false,
            image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQffoQTJWbabG47mNsJsEE8PUiVEPx-XPvbwFklqWMiJ2u5wPPubzud4oS-JJKtCwS4SfBcq1gHG1JZorjn-hLc059j9dT-uIrtWMNJwUkZDRUnbViSxJWI'
        },
        {
            id: '3',
            title: 'Birthday',
            category: 'Birthday Parties',
            desc: 'Birthday coverage with 2 photographers and drone shots',
            featured: true,
            image: 'https://atlas-content-cdn.pixelsquid.com/assets_v2/275/2750427660483040505/jpeg-600/G03.jpg'
        },
        {
            id: '4',
            title: 'Corporate',
            category: 'Corporate Events',
            desc: 'Gneral meetings and Corporate events',
            featured: false,
            image: 'https://3.imimg.com/data3/VH/BQ/GLADMIN-119035/photo-studio-equipment-250x250.jpg'
        },
    ];

    const onEditPortfolioPress = (item: any) => {
        setActiveTab("Add Portfolio");
        setSelectedFile(item?.image ? { uri: item?.image } : '')
        setAddPortfolio({
            portfolioTitle: item?.title ? item?.title : '',
            portfoliocategory: item?.category ? item?.category : '',
            portfolioDesc: item?.desc ? item?.desc : '',
            featured: item?.featured ? item?.featured : '',
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
        setAddPortfolio({
            portfolioTitle: "",
            portfoliocategory: "",
            portfolioDesc: "",
            featured: false,
        })

        // move to list add portfolio tab

        setActiveTab("portfolio");

    }

    // --- Render Item Function for FlatList ---
    const renderStudioCard = ({ item }: any) => {

        return (
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    {/* Studio Image */}
                    <View>
                        <Image
                            // Using a placeholder that simulates the image's structure
                            source={{ uri: item.image }}
                            resizeMode="cover"
                            style={styles.cardImage}
                        />
                        {/* Status Badge */}
                        {item.featured && <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Featured</Text>
                        </View>}
                    </View>

                    {/* Text Info */}
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.studioName}>{item.title}</Text>
                        <Text style={styles.studioDesc}>{item.desc}</Text>
                        <Text style={styles.avaliable}>Category : <Text style={{ ...styles.avaliable, fontWeight: '600' }}> {item.category}</Text></Text>

                        {/* Edit Button (Bordered)  */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity onPress={() => onEditPortfolioPress(item)} style={styles.viewButton}>
                                <Text style={styles.viewButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.viewButton, backgroundColor: '#DC3545' }}>
                                <Text style={styles.viewButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={{ marginBottom: 360 }}>

            {/* Tabs */}
            <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    activeTab === "portfolio" && styles.toggleButtonActive
                                ]}
                                onPress={() => setActiveTab("portfolio")}
                            >
                                <Icon
                                    name="emoji-events"
                                    size={16}
                                    color={activeTab === "portfolio" ? COLORS.background : COLORS.text.secondary}
                                />
                                <Text style={[
                                    styles.toggleButtonText,
                                    activeTab === "portfolio" && styles.toggleButtonTextActive
                                ]}>
                                    Portfolio
                                </Text>
                            </TouchableOpacity>
            
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    activeTab === "Add Portfolio" && styles.toggleButtonActive
                                ]}
                                onPress={() => setActiveTab("Add Portfolio")}
                            >
                                <Icon
                                    name="add-circle-outline"
                                    size={16}
                                    color={activeTab === "Add Portfolio" ? COLORS.background : COLORS.text.secondary}
                                />
                                <Text style={[
                                    styles.toggleButtonText,
                                    activeTab === "Add Portfolio" && styles.toggleButtonTextActive
                                ]}>
                                    Add Portfolio
                                </Text>
                            </TouchableOpacity>
                        </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                {activeTab === "portfolio" ? <>

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
                        <Text style={styles.labelText} >Portfolio Title<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., Wedding"
                            value={addPortfolio.portfolioTitle}
                            onChangeText={(text) =>
                                setAddPortfolio({ ...addPortfolio, portfolioTitle: text })
                            }
                        />
                        <Text style={styles.labelText} >Portfolio Image<Text style={styles.required}> *</Text></Text>
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
                                <Text style={styles.uploadTextHeader}>Upload Portfolio Image</Text>
                                <Text style={styles.uploadTextDesc}>Click to browse your image</Text>
                                <Text style={styles.supportedFilesText}>
                                    Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
                                </Text>
                                <Text style={styles.chooseFilesText}>Choose File</Text>
                            </TouchableOpacity>}

                        <Text style={styles.labelText} >Category<Text style={styles.required}> *</Text></Text>

                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., Wedding Photography"
                            multiline
                            value={addPortfolio.portfoliocategory}
                            onChangeText={(text) =>
                                setAddPortfolio({ ...addPortfolio, portfoliocategory: text })
                            }
                        />
                        <Text style={styles.labelText} >Description</Text>

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholderTextColor={'#898787'}
                            placeholder="e.g., We can give the best wedding photography and best price..."
                            multiline
                            value={addPortfolio.portfolioDesc}
                            onChangeText={(text) =>
                                setAddPortfolio({ ...addPortfolio, portfolioDesc: text })
                            }
                        />
                        <Text style={styles.labelText} >Featured</Text>

                        <TouchableOpacity
                            style={styles.checkboxWrapper}
                            activeOpacity={0.8}
                            onPress={() =>
                                setAddPortfolio({
                                    ...addPortfolio,
                                    featured: !addPortfolio.featured,
                                })
                            }
                        >
                            <Icon
                                name={addPortfolio.featured ? "check-box" : "check-box-outline-blank"}
                                size={24}
                                color={addPortfolio.featured ? "#1B4332" : "#777"}
                            />
                            <Text style={styles.checkboxLabel}>Mark as Featured</Text>
                        </TouchableOpacity>

                        {/* Save button section  */}
                        <TouchableOpacity onPress={createEquipment} style={styles.createButton}>
                            <Text style={styles.createButtonText}>Save Portfolio</Text>
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
        width: 120,
        height: 140,
        borderRadius: 10,
        resizeMode: 'contain',
        borderWidth: 1,
        borderColor: '#00000026',
    },
    statusBadge: {
        position: 'absolute',
        backgroundColor: '#034833',
        top: 10,
        right: 10,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    studioName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#034833'
    },
    studioDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    avaliable: {
        fontSize: 14,
        color: '#101010',
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
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1B4332',
    },
    viewButtonText: {
        fontWeight: '600',
        fontSize: 13,
        color: '#FFFFFF'
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
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
    checkboxWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkboxLabel: {
        marginLeft: 8,
        color: "#101010",
        fontSize: 15,
        fontWeight: "500",
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
});