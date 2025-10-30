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

interface EquipmentSelectionModalProps {
  visible: boolean;
  equipment: Equipment[];
  loading: boolean;
  selectedEquipment: Equipment[];
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

  const handleQuantityChange = (equipmentId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [equipmentId]: Math.max(0, quantity)
    }));
  };

  const handleAddEquipment = (item: Equipment) => {
    const quantity = quantities[item.id] || 1;
    if (quantity > 0 && quantity <= item.available_quantity) {
      onSelectEquipment(item, quantity);
      setQuantities(prev => ({ ...prev, [item.id]: 0 }));
    }
  };

  const isEquipmentSelected = (equipmentId: string) => {
    return selectedEquipment.some(eq => eq.id === equipmentId);
  };

  const getSelectedQuantity = (equipmentId: string) => {
    const selected = selectedEquipment.find(eq => eq.id === equipmentId);
    return selected?.selectedQuantity || 0;
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
                          <Text style={styles.availableText}>
                            Available: {item.available_quantity}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.quantityContainer}>
                        <View style={styles.quantityInput}>
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, (quantities[item.id] || 1) - 1)}
                            style={styles.quantityButton}
                          >
                            <Icon name="remove" size={20} color={COLORS.text.primary} />
                          </TouchableOpacity>
                          <TextInput
                            style={styles.quantityText}
                            value={String(quantities[item.id] || 1)}
                            onChangeText={(text) => handleQuantityChange(item.id, parseInt(text) || 0)}
                            keyboardType="numeric"
                            textAlign="center"
                          />
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
                            style={styles.quantityButton}
                          >
                            <Icon name="add" size={20} color={COLORS.text.primary} />
                          </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity
                          onPress={() => handleAddEquipment(item)}
                          style={[
                            styles.addButton,
                            isEquipmentSelected(item.id) && styles.addButtonDisabled
                          ]}
                          disabled={isEquipmentSelected(item.id)}
                        >
                          <Text style={[
                            styles.addButtonText,
                            isEquipmentSelected(item.id) && styles.addButtonTextDisabled
                          ]}>
                            {isEquipmentSelected(item.id) ? 'Added' : 'Add'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Selected Equipment */}
              {selectedEquipment.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Selected Equipment</Text>
                  {selectedEquipment.map((item) => (
                    <View key={item.id} style={styles.selectedCard}>
                      <View style={styles.selectedInfo}>
                        <Text style={styles.selectedName}>{item.item_name}</Text>
                        <Text style={styles.selectedDetails}>
                          Quantity: {item.selectedQuantity} × ₹{item.rental_price_hourly}/hour
                        </Text>
                        <Text style={styles.selectedTotal}>
                          Total: ₹{(item.rental_price_hourly * (item.selectedQuantity || 0))}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => onRemoveEquipment(item.id)}
                        style={styles.removeButton}
                      >
                        <Icon name="delete" size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>
                      Total Equipment Cost: ₹{getTotalCost()}/hour
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onClose} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
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
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.background,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.black,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
});

export default EquipmentSelectionModal;