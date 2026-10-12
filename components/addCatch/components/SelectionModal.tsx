import React, { useMemo } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

type Props = {
  title: string;
  options: readonly string[];
  visible: boolean;
  onSelect: (option: string) => void;
  onClose: () => void;
};

export default function SelectionModal({
  title,
  options,
  visible,
  onSelect,
  onClose,
}: Props) {
  const groups = useMemo(() => {
    const grouped = new Map<string, string[]>();

    options.forEach((option) => {
      const letter = option.charAt(0).toUpperCase();
      grouped.set(letter, [...(grouped.get(letter) ?? []), option]);
    });

    return [...grouped.entries()];
  }, [options]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, styles.selectionModal]}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView
            style={styles.selectionList}
            showsVerticalScrollIndicator
          >
            {groups.map(([letter, entries]) => (
              <View key={letter}>
                <Text style={styles.selectionLetter}>{letter}</Text>
                {entries.map((option) => (
                  <TouchableOpacity
                    key={option}
                    accessibilityRole="button"
                    onPress={() => onSelect(option)}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={onClose}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
