import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { COLORS } from "../../constants";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useState } from "react";
import { useDispatch } from "react-redux";
import { doCancelBooking } from "../../features/bookings/bookingsSlice";
import { typography } from "../../constants/typography";
import { showError, showSuccess } from "../../utils/helperFunctions";

const CancelStudioBookingModal = ({ visible = false, onClose = () => { }, booking = {} }) => {
  const dispatch = useDispatch();
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);


  const onCloseModal = () => {
    setLoading(false);
    setCancelReason('')
    onClose();

  }

  // --- cancel booking API ---
  const handleConfirmCancel = async () => {
    setLoading(true);
    let payload = { booking_id: booking?.id }
    if (cancelReason.trim()) {
      payload = { ...payload, cancellation_reason: cancelReason.trim() }
    }
    
    try {
     const response =  await dispatch(doCancelBooking(payload)).unwrap(); 
      showSuccess('Booking cancelled successfully.');    
      onCloseModal();
    } catch (err: any) {
      showError('Unable to cancel booking. Please try again.');
      Alert.alert('Cancel failed', err?.message || 'Unable to cancel booking.');
    }
    finally{
      setLoading(false);
    }
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCloseModal}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <TouchableOpacity onPress={onCloseModal}>
              <Icon name="close" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 8 }}>
            <Text style={styles.modalLabel}>Reason for cancellation <Text style={{ ...styles.modalLabel, fontSize: 12 }}>(Optional)</Text></Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Enter cancellation reason"
              placeholderTextColor={COLORS.text.secondary}
              value={cancelReason}
              onChangeText={(text) => setCancelReason(text)}
              multiline
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButtonModal} onPress={onCloseModal}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && { opacity: 0.6 }]}
              onPress={handleConfirmCancel}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>{loading ? 'Cancelling...' : 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default CancelStudioBookingModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    color: COLORS.text.primary,
    ...typography.bold,
  },

  modalLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    ...typography.semibold,
    marginBottom:5
  },
  modalTextInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
    backgroundColor: COLORS.background,
    ...typography.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: '#034833',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    ...typography.bold,
  },
  cancelButtonModal: {
    backgroundColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    ...typography.bold,
    color: '#ff0000ff',
  },
});