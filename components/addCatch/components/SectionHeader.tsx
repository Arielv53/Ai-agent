import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

export default function SectionHeader({
  section,
  title,
  icon,
  openSections,
  toggleSection,
}: {
  openSections: CatchForm["openSections"];
  toggleSection: CatchForm["toggleSection"];
  section: "basic" | "weather" | "details";
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
      activeOpacity={0.75}
    >
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={19} color="#20bfff" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Ionicons
        name={openSections[section] ? "chevron-up" : "chevron-down"}
        size={18}
        color="#66cfff"
      />
    </TouchableOpacity>
  );
}
