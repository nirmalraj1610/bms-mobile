import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS } from "../../constants";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useState } from "react";
import { useDispatch } from "react-redux";
import { doAcceptBooking } from "../../features/bookings/bookingsSlice";
import imagePaths from "../../constants/imagePaths";

const AcceptPhotographerBookingModal = ({ visible = false, onClose = () => { }, booking = {} }) => {
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
      onCloseModal();
    } catch (err: any) {
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
                    <Image source={imagePaths.PhotographerPlaceHolderImage} resizeMode="cover" style={styles.image} />

                    <View style={styles.info}>
                        <Text style={styles.bookingId}>
                            Booking ID:<Text style={{ fontWeight: '600' }}> {booking.id}</Text>
                        </Text>
                        <Text style={styles.time}>Booked on :<Text style={{ fontWeight: '600' }}> {booking.booking_date}</Text></Text>
                        <Text style={styles.name}>{booking?.customer?.full_name}</Text>
                        <Text style={styles.studio}>{booking?.service?.service_type} ({booking?.booking_type})</Text>
                        <Text style={styles.time}>{booking?.start_time} - {booking?.end_time}</Text>
                        <Text style={styles.studio}>+91 {booking?.customer?.phone}</Text>
                        <Text style={styles.price}><Text style={{ ...styles.price, color: '#2F2F2F', fontSize: 14 }}>Total price : </Text>₹{booking?.total_amount}</Text>
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

export default AcceptPhotographerBookingModal;

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
    fontWeight: '700',
    color: COLORS.text.primary,
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
    fontWeight: '600',
  },
  cancelButtonModal: {
    backgroundColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff0000ff',
  },
  cardContent: {
    flexDirection: 'row',
  },
  image: {
    width: 120,
    height: 160,
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
  },
  date: {
    fontSize: 12,
    color: '#2F2F2F',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#034833',
    marginTop: 2,
  },
  studio: {
    fontSize: 12,
    color: '#2F2F2F',
  },
  time: {
    fontSize: 12,
    color: '#2F2F2F',
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 2,
  },
});