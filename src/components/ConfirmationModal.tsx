import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const ConfirmationModal = ({
    Visible = false,
    onClose = () => { },
    onSubmit = () => { },
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
                    <Text style={styles.modalTitle}>Are you sure you want to log out?</Text>

                    <View style={styles.modalActions}>
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
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 16,
        padding: 24,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#DC3545',
        marginRight: 8,
    },
    okButton: {
        backgroundColor: '#034833',
        marginLeft: 8,
    },
    cancelText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    okText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default ConfirmationModal;