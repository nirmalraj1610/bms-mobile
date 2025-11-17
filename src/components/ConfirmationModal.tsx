import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { typography } from "../constants/typography";

const ConfirmationModal = ({
    Visible = false,
    onClose = () => {},
    onSubmit = () => {},
}) => {
    return (
        <Modal
            visible={Visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>

                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderText}>Logout</Text>
                    </View>

                    {/* Content */}
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Are you sure you want to log out?
                        </Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.okButton]}
                            onPress={onSubmit}
                        >
                            <Text style={styles.okText}>Logout</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalBox: {
        backgroundColor: "#fff",
        width: "80%",
        borderRadius: 16,
        padding: 0,
        overflow: "hidden",
        elevation: 8,
    },

    /* Header */
    modalHeader: {
        paddingVertical: 15,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
        backgroundColor: "#F9F9F9",
    },
    modalHeaderText: {
        fontSize: 18,
        color: "#101010",
        ...typography.bold,
    },

    /* Content */
    modalContent: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },

    modalTitle: {
        fontSize: 14,
        color: "#6C757D",
        textAlign: "center",
        ...typography.semibold,
    },

    /* Footer */
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        backgroundColor: "#F9F9F9",
    },

    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },

    cancelButton: {
        backgroundColor: "#DC3545",
        marginRight: 8,
    },
    okButton: {
        backgroundColor: "#034833",
        marginLeft: 8,
    },

    cancelText: {
        color: "#FFFFFF",
        ...typography.bold
    },
    okText: {
        color: "#fff",
        ...typography.bold
    },
});

export default ConfirmationModal;
