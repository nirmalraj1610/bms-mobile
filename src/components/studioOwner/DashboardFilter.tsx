import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { typography } from "../../constants/typography";

const DashboardFilterPopup = ({
  visible = false,
  options = [{label: 'Test option', value: "Testoption"}],
  selectedValue = null,
  onSelect = (i: any) => { },
  onApply = (i: any) => { },
  onClear = () => { },
  onClose = () => { },
}) => {
  const [tempSelection, setTempSelection] = useState(selectedValue);

  const handleSelect = (option: any) => {
    setTempSelection(option);
    onSelect(option);
    onClose(); // Auto close when option is selected
  };

  const handleApply = () => {
    onApply(tempSelection);
    onClose();
  };

  const handleClear = () => {
    setTempSelection(null);
    onClear();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <View style={styles.headerOutline}>
            <Text style={styles.title}>Select a status</Text>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  tempSelection === item.value && styles.selectedOption,
                ]}
                onPress={() => handleSelect(item.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    tempSelection === item.value && styles.selectedText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 500 }}
          />

          {/* Footer buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default DashboardFilterPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  popupContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  headerOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  title: {
    fontSize: 16,
    color: "#034833",
    marginBottom: 12,
    ...typography.bold,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#034833",
    borderColor: "#034833",
  },
  optionText: {
    fontSize: 14,
    color: "#101010",
    ...typography.semibold,
  },
  selectedText: {
    color: "#fff",
    ...typography.bold,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  clearBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#034833",
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 8,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: "#034833",
    borderRadius: 8,
    paddingVertical: 10,
    marginLeft: 8,
  },
  clearText: {
    color: "#034833",
...typography.bold,
    textAlign: "center",
  },
  applyText: {
    color: "#fff",
...typography.bold,
    textAlign: "center",
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: "#DC3545",
    borderRadius: 8,
    paddingVertical: 6,
    marginRight: 8,
    paddingHorizontal: 12
  },
  closeText: {
    color: "#DC3545",
...typography.bold,
    textAlign: "center",
  },
});
