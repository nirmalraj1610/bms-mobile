import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';
import { Equipment } from '../types/api';
import { bookingAddEquipment } from '../lib/api';

interface EquipmentSelectionModalProps {
  visible: boolean;
  equipment: Equipment[];
  loading: boolean;
  selectedEquipment: Equipment[];
  bookingId?: string;

  onClose: () => void;
  onSelectEquipment: (equipment: Equipment, quantity: number) => void;
  onRemoveEquipment: (equipmentId: string) => void;
}

const { width } = Dimensions.get('window');

const EquipmentSelectionModal: React.FC<EquipmentSelectionModalProps> = ({
  visible,
  equipment,
  loading,
  selectedEquipment,
  bookingId,

  onClose,
  onSelectEquipment,
  onRemoveEquipment,
}) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    console.log('🔧 EquipmentSelectionModal props changed:');
    console.log('- visible:', visible);
    console.log('- equipment:', equipment);
    console.log('- loading:', loading);
    console.log('- selectedEquipment:', selectedEquipment);
  }, [visible, equipment, loading, selectedEquipment]);

  const handleQuantityChange = (equipmentId: string, quantity: number, maxQuantity: number) => {
    const validQuantity = Math.max(0, Math.min(quantity, maxQuantity));
    setQuantities(prev => ({
      ...prev,
      [equipmentId]: validQuantity
    }));
  };

  const handleAddEquipment = (item: Equipment) => {
    const quantity = quantities[item.id] || 1;
    if (quantity > 0 && quantity <= item.quantity_available) {
      console.log('✅ Adding equipment:', item.item_name, 'Quantity:', quantity);
      onSelectEquipment(item, quantity);
      // Reset quantity to 1 after adding
      setQuantities(prev => ({ ...prev, [item.id]: 1 }));
    } else {
      console.log('❌ Invalid quantity:', quantity, 'Available:', item.quantity_available);
    }
  };

  const isEquipmentSelected = (equipmentId: string) => {
    return selectedEquipment.some(eq => eq.id === equipmentId);
  };

  const getSelectedQuantity = (equipmentId: string) => {
    const selected = selectedEquipment.find(eq => eq.id === equipmentId);
    return selected?.selectedQuantity || 0;
  };

  const handleOkPress = async () => {
    try {
      console.log('🟦 [EquipmentAdd] Starting OK handler');
      console.log('🟦 [EquipmentAdd] Props snapshot:', {
        bookingId,
        selectedEquipmentCount: selectedEquipment.length,
      });

      if (!bookingId) {
        console.log('❌ [EquipmentAdd] Missing bookingId. Aborting.');
        return onClose();
      }

      console.log('🟦 [EquipmentAdd] Preparing payload from selectedEquipment...');
      const equipment_items = selectedEquipment.map((item) => ({
        equipment_id: item.id,
        quantity: item.selectedQuantity || 1,
      }));
      const payload = { booking_id: bookingId, equipment_items };
      console.log('📦 [EquipmentAdd] Payload ready:', payload);

      console.log('📡 [EquipmentAdd] Sending POST /booking-add-equipment');
      const response = await bookingAddEquipment(payload);
      console.log('✅ [EquipmentAdd] API responded successfully');
      console.log('🔍 [EquipmentAdd] Response object:', response);

      console.log('🎉 [EquipmentAdd] Equipment added to booking:', bookingId);
      onClose();
    } catch (error: any) {
      console.log('❌ [EquipmentAdd] API error:', error);
      if (error?.status) console.log('❌ [EquipmentAdd] HTTP status:', error.status);
      if (error?.error) console.log('❌ [EquipmentAdd] Error message:', error.error);
    }
  };

  const getTotalCost = () => {
    return selectedEquipment.reduce((total, eq) => {
      return total + (eq.rental_price_hourly * (eq.selectedQuantity || 0));
    }, 0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Select Equipment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading equipment...</Text>
            </View>
          ) : (
            <>
              {/* Available Equipment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Equipment</Text>
                {equipment.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="build" size={48} color={COLORS.text.secondary} />
                    <Text style={styles.emptyText}>No equipment available</Text>
                  </View>
                ) : (
                  equipment.map((item) => (
                    <View key={item.id} style={styles.equipmentCard}>
                      <View style={styles.equipmentInfo}>
                        <Text style={styles.equipmentName}>{item.item_name}</Text>
                        <Text style={styles.equipmentType}>{item.item_type}</Text>
                        {item.description && (
                          <Text style={styles.equipmentDescription}>{item.description}</Text>
                        )}
                        <View style={styles.priceRow}>
                          <Text style={styles.priceText}>₹{item.rental_price_hourly}/hour</Text>
                        </View>
                        <Text style={styles.availableText}>
                          Available: {item.quantity_available} units
                        </Text>
                      </View>
                      
                      <View style={styles.quantityContainer}>
                        <View style={styles.quantityInput}>
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, (quantities[item.id] || 1) - 1, item.quantity_available)}
                            style={styles.quantityButton}
                          >
                            <Icon name="remove" size={20} color={COLORS.text.primary} />
                          </TouchableOpacity>
                          <TextInput
                            style={styles.quantityText}
                            value={String(quantities[item.id] || 1)}
                            onChangeText={(text) => handleQuantityChange(item.id, parseInt(text) || 0, item.quantity_available)}
                            keyboardType="numeric"
                            textAlign="center"
                          />
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1, item.quantity_available)}
                            style={styles.quantityButton}
                          >
                            <Icon name="add" size={20} color={COLORS.text.primary} />
                          </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity
                          onPress={() => handleAddEquipment(item)}
                          style={styles.addButton}
                        >
                          <Text style={styles.addButtonText}>
                            Add
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

            </>
          )}
        </ScrollView>

        {/* Selected Equipment Summary */}
        {selectedEquipment.length > 0 && (
          <View style={styles.selectedSummary}>
            <Text style={styles.summaryTitle}>Selected Equipment ({selectedEquipment.length} items)</Text>
            <ScrollView style={styles.selectedList} showsVerticalScrollIndicator={false}>
              {selectedEquipment.map((item) => (
                <View key={item.id} style={styles.selectedItem}>
                  <View style={styles.selectedItemInfo}>
                    <Text style={styles.selectedItemName}>{item.item_name}</Text>
                    <Text style={styles.selectedItemDetails}>
                      {item.selectedQuantity} × ₹{item.rental_price_hourly}/hour = ₹{(item.rental_price_hourly * (item.selectedQuantity || 0))}/hour
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemoveEquipment(item.id)}
                    style={styles.removeButton}
                  >
                    <Icon name="cancel" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.totalSection}>
              <Text style={styles.totalText}>
                Total Cost: ₹{selectedEquipment.reduce((total, item) => 
                  total + (item.rental_price_hourly * (item.selectedQuantity || 0)), 0
                )}/hour
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.okButton} onPress={handleOkPress}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  equipmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  equipmentInfo: {
    marginBottom: 12,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  equipmentType: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  equipmentDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  availableText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.text.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.text.secondary,
  },
  addButtonText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: COLORS.background,
  },
  selectedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  selectedDetails: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  selectedTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  removeButton: {
    padding: 8,
  },
  totalContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  totalSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.black,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  selectedSummary: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.black,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: 350,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  selectedList: {
    maxHeight: 250,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor:'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  selectedItemDetails: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  okButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default EquipmentSelectionModal;