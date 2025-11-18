import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../constants";
import { useDispatch } from "react-redux";
import { getUserData } from "../../lib/http";
import { createPhotographerPortfolio, getPhotographerPortfolio } from "../../features/photographers/photographersSlice";
import imagePaths from "../../constants/imagePaths";
import PortfolioSkeleton from "../skeletonLoaders/Photographer/PortfolioSkeleton";
import { typography } from "../../constants/typography";
import { showError, showSuccess } from "../../utils/helperFunctions";


// --- Main Component ---
export const PortfolioComponent = () => {
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);
    const [photographerPortfolio, setPhotographerPortfolio] = useState([]);
    const [editPortfolio, setEditPortfolio] = useState(false);
    const [editPortfolioId, setEditPortfolioId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // pull to refresh
    const [refreshing, setRefreshing] = useState(false);

    const [addPortfolio, setAddPortfolio] = useState({
        portfolioTitle: "",
        portfoliocategory: "",
        portfolioDesc: "",
        featured: false,
    });
    const [activeTab, setActiveTab] = useState("Portfolio"); // 'Portfolio' or 'Add Portfolio'

    useEffect(() => {
        if (activeTab === "Portfolio") {
            fetchPhotographerPortfolio();
            clearStateValues();
        }
    }, [activeTab]);

    const fetchPhotographerPortfolio = async () => {
        setIsLoading(true);
        const userData = await getUserData();
        const photographerId = userData?.customer?.customer_profiles?.customer_id

        //             {
        // photographer_id

        try {
            const portfolioData = await dispatch(getPhotographerPortfolio(photographerId)).unwrap(); // ✅ unwrap to get actual data
            console.log('📦 portfolioData from API:', portfolioData?.photographer?.portfolio);

            // response looks like { portfolioData: [ ... ], total: 16 }
            setPhotographerPortfolio(portfolioData?.photographer?.portfolio || []);
        } catch (error) {
            console.log('❌ Failed to load photographer portfolios:', error);
        }
        finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onAddPortfolioPress = () => {
        setActiveTab('Add Portfolio')
    };

    const onRefresh = async () => {
        setRefreshing(true);
        clearStateValues();
        await fetchPhotographerPortfolio();
    }

    const clearStateValues = () => {

        // set initial state value
        setAddPortfolio({
            portfolioTitle: "",
            portfoliocategory: "",
            portfolioDesc: "",
            featured: false,
        })
        setSelectedFile(null);
        setEditPortfolioId('');
        setEditPortfolio(false);
        setActiveTab("Portfolio");
    }

    const onDeletePortfolioPress = (item: any) => {
        Alert.alert('Delete portfolio', 'Portfolio delete feature not implemented')
    }

    const onEditPortfolioPress = (item: any) => {
        setActiveTab("Add Portfolio");
        setEditPortfolio(true);
        setEditPortfolioId(item?.id ? item?.id : '')
        setAddPortfolio({
            portfolioTitle: item?.title ? item?.title : '',
            portfoliocategory: item?.category ? item?.category : '',
            portfolioDesc: item?.description ? item?.description : '',
            featured: item?.featured ? item?.featured : '',
        })

        const formattedImages = item?.image_url ? { uri: item?.image_url } : null
        setSelectedFile(formattedImages);
    }

    const handleDocumentPick = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (!result.didCancel && result.assets && result.assets.length > 0) {
            setSelectedFile(result.assets[0]);
        }
    };

    const createPortfolio = async () => {
        try {
            const formData = new FormData();

            // Append basic text fields
            formData.append('title', addPortfolio.portfolioTitle);
            formData.append('description', addPortfolio.portfolioDesc);
            formData.append('category', addPortfolio.portfoliocategory);
            formData.append('featured', String(addPortfolio.featured)); // booleans → strings in FormData

            // Append image if selected
            if (selectedFile?.uri) {
                formData.append('file', {
                    uri: selectedFile.uri,
                    name: selectedFile.fileName || 'portfolio.jpg',
                    type: selectedFile.type || 'image/jpeg',
                });
            } else if (typeof selectedFile === 'string') {
                // If you’re using a remote URL or base64 instead of file
                formData.append('file', selectedFile);
            }

            let response;

            // ✅ Update flow
            if (editPortfolio && editPortfolioId) {
                showError('Portfolio update feature not implemented');
                Alert.alert('Update portfolio', 'Portfolio update feature not implemented')
                clearStateValues();
            }
            // ✅ Create flow
            else {
                response = await dispatch(createPhotographerPortfolio(formData)).unwrap();
                showSuccess('Portfolio created Successfully!...');
                console.log("✅ Portfolio created Successfully:", response);
                clearStateValues();
            }

        } catch (error) {
            showError('Something went wrong!...');
            console.log("❌ Error creating portfolio:", error);
        }
    };


    // --- Render Item Function for FlatList ---
    const renderStudioCard = ({ item }: any) => {

        return (
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    {/* Studio Image */}
                    <View>
                        <Image
                            // Using a placeholder that simulates the image's structure
                            source={item.image_url ? { uri: item.image_url } : imagePaths.StudioPlaceHolderImage}
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
                        <Text style={styles.avaliable}>Photographer Id : <Text style={{ ...styles.avaliable, ...typography.semibold, }}> {item.photographer_id}</Text></Text>
                        <Text style={styles.studioName}>{item.title}</Text>
                        <Text numberOfLines={3} style={styles.studioDesc}>{item.description}</Text>
                        <Text style={styles.avaliable}>Category : <Text style={{ ...styles.avaliable, ...typography.semibold, }}> {item.category}</Text></Text>

                        {/* Edit Button (Bordered)  */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity onPress={() => onEditPortfolioPress(item)} style={styles.viewButton}>
                                <Text style={styles.viewButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onDeletePortfolioPress(item)} style={{ ...styles.viewButton, backgroundColor: '#DC3545' }}>
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
                        activeTab === "Portfolio" && styles.toggleButtonActive
                    ]}
                    onPress={() => setActiveTab("Portfolio")}
                >
                    <Icon
                        name="emoji-events"
                        size={16}
                        color={activeTab === "Portfolio" ? COLORS.background : COLORS.text.secondary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === "Portfolio" && styles.toggleButtonTextActive
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
                        name={editPortfolio ? "edit" : "add-circle-outline"}
                        size={16}
                        color={activeTab === "Add Portfolio" ? COLORS.background : COLORS.text.secondary}
                    />
                    <Text style={[
                        styles.toggleButtonText,
                        activeTab === "Add Portfolio" && styles.toggleButtonTextActive
                    ]}>
                        {editPortfolio ? "Edit portfolio" : "Add Portfolio"}
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={activeTab === "Portfolio" ?
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#034833"]}      // Android
                    /> : null}
            >
                {activeTab === "Portfolio" ? <>
                    {/* Studio Cards Grid */}
                    {isLoading ? (
                        <View style={{ marginBottom: 60 }} >
                            {[1, 2, 3].map((_, i) => <PortfolioSkeleton key={i} />)}
                        </View>
                    ) : (
                        <FlatList
                            data={photographerPortfolio}
                            keyExtractor={(item) => item.id}
                            renderItem={renderStudioCard}
                            ListEmptyComponent={
                                <View style={styles.noStudioOutline}>
                                    <Icon name="emoji-events" size={60} color="#ccc" style={{ marginBottom: 10 }} />
                                    <Text style={styles.noStudioText}>
                                        Portfolio not found
                                    </Text>
                                    <Text style={styles.addStudioDesc}>
                                        Add new portfolio to show
                                    </Text>
                                    <TouchableOpacity onPress={onAddPortfolioPress} style={styles.addStudioBtn}>
                                        <Icon name="add-circle-outline" size={24} color="#FFFFFF" />
                                        <Text style={styles.addStudioText}>Add portfolio</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
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
                        <TouchableOpacity onPress={createPortfolio} style={styles.createButton}>
                            <Text style={styles.createButtonText}>{editPortfolio ? 'Update portfolio' : 'Add portfolio'}</Text>
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
        paddingBottom: 60,
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
        ...typography.medium,
    },
    studioName: {
        fontSize: 16,
        color: '#034833',
        ...typography.bold,
    },
    studioDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
        ...typography.regular,
    },
    avaliable: {
        fontSize: 12,
        color: '#101010',
        marginTop: 2,
        ...typography.regular,
    },
    labelText: {
        color: '#101010',
        fontSize: 16,
        marginBottom: 6,
        ...typography.semibold,
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
        ...typography.semibold,
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
        fontSize: 12,
        color: '#FFFFFF',
        ...typography.semibold,
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
        marginBottom: 60
    },
    createButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        ...typography.bold,
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
        color: "#101010",
        fontSize: 16,
        marginTop: 10,
        ...typography.bold,
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
        color: "#034833",
        ...typography.bold,
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
        fontSize: 14,
        ...typography.semibold,
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
        ...typography.semibold,
    },
    toggleButtonTextActive: {
        color: COLORS.background,
        ...typography.bold,
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
        ...typography.bold,
    },
    noStudioText: {
        fontSize: 16,
        color: '#666',
        ...typography.bold,
    },
    addStudioDesc: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
        ...typography.semibold,
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
        ...typography.bold,
    },
});