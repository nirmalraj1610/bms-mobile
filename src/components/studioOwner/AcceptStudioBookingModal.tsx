import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS } from "../../constants";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useState } from "react";
import { useDispatch } from "react-redux";
import { doAcceptBooking } from "../../features/bookings/bookingsSlice";
import imagePaths from "../../constants/imagePaths";
import { typography } from "../../constants/typography";
import { showError, showSuccess } from "../../utils/helperFunctions";

const AcceptStudioBookingModal = ({ visible = false, onClose = () => { }, booking = {} }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);


  const onCloseModal = () => {
    setLoading(false);
    onClose();

  }

  // --- accept booking API ---
  const handleConfirmAccept = async () => {
    setLoading(true);
    let payload = { booking_id: booking?.id }
    console.log('final payload for accept booking', payload);

    try {
      const response = await dispatch(doAcceptBooking(payload)).unwrap();
      console.log('accept response', response);
      showSuccess('Booking accepted successfully.');
      onCloseModal();
    } catch (err: any) {
      showError('Unable to accept booking. Please try again.');
      Alert.alert('accept failed', err?.message || 'Unable to accept booking.');
    }
    finally {
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
            <Text style={styles.modalTitle}>Accept Booking</Text>
            <TouchableOpacity onPress={onCloseModal}>
              <Icon name="close" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 8 }}>
            <View style={styles.cardContent}>
              <Image source={imagePaths.StudioPlaceHolderImage} resizeMode="cover" style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.bookingId}>
                  Booking ID: <Text style={{ ...typography.bold,}}>{booking?.id}</Text>
                </Text>
                <Text style={styles.name}>{booking?.customer?.full_name}</Text>
                <Text style={styles.date}>Date: <Text style={{ ...typography.bold,}}>{booking?.booking_date}</Text></Text>
                <Text style={styles.time}>Booking type: <Text style={{ ...typography.bold,}}>{booking?.booking_type}</Text></Text>
                <Text style={styles.time}>Start time: <Text style={{ ...typography.bold,}}>{booking?.start_time}</Text></Text>
                <Text style={styles.time}>End time: <Text style={{ ...typography.bold,}}>{booking?.end_time}</Text></Text>
                <Text style={styles.price}>₹{booking?.total_amount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButtonModal} onPress={onCloseModal}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && { opacity: 0.6 }]}
              onPress={handleConfirmAccept}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>{loading ? 'Accepting...' : 'Accept'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default AcceptStudioBookingModal;

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
  cardContent: {
    flexDirection: 'row',
  },
  image: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookingId: {
    fontSize: 12,
    color: '#2F2F2F',
    ...typography.semibold,
  },
  date: {
    fontSize: 12,
    color: '#2F2F2F',
    ...typography.semibold,
  },
  name: {
    fontSize: 16,
    color: '#034833',
    marginTop: 2,
    ...typography.extrabold,
  },
  studio: {
    fontSize: 12,
    color: '#2F2F2F',
    ...typography.semibold,
  },
  time: {
    fontSize: 12,
    color: '#2F2F2F',
    marginTop: 2,
    ...typography.semibold,
  },
  price: {
    fontSize: 16,
    color: '#FF6B35',
    marginTop: 2,
    ...typography.bold,
  },
});