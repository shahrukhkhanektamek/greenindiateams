import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { colors } from '../../styles/colors';

const Select2Multiple = ({ optionsList = [], value = [], onChange }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds(value);
  }, [value]);

  const toggleSelect = (id) => {
    let updated = [];
    if (selectedIds.includes(id)) {
      updated = selectedIds.filter((v) => v !== id);
    } else {
      updated = [...selectedIds, id];
    }
    setSelectedIds(updated);
    onChange(updated); // send only IDs to parent
  };

  return (
    <View>
      {optionsList.map((opt) => (
        <TouchableOpacity
          key={opt._id}
          style={[
            styles.option,
            selectedIds.includes(opt._id) && styles.selectedOption,
          ]}
          onPress={() => toggleSelect(opt._id)}
        >
          <Text
            style={[
              styles.optionText,
              selectedIds.includes(opt._id) && styles.selectedOptionText,
            ]}
          >
            {opt.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  option: {
    padding: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
  },
  selectedOptionText: {
    color: "#fff",
  },
});

export default Select2Multiple;
