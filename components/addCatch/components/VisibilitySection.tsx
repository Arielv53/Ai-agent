import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "loading"
    | "isPublic"
    | "setIsPublic"
  >;
};

export default function VisibilitySection({ form }: Props) {
  const {
    loading,
    isPublic,
    setIsPublic,
  } = form;
  return (
    <>
      <View style={styles.sectionCard}>
        <Text style={styles.visibilityTitle}>Post visibility</Text>
        <View style={styles.visibilityOptions}>
          {[{ label: "Private", value: false, icon: "lock-closed-outline" as const },
          { label: "Public", value: true, icon: "globe-outline" as const }].map((option) => (
            <TouchableOpacity key={option.label} accessibilityRole="radio"
              accessibilityState={{ checked: isPublic === option.value }}
              disabled={loading} onPress={() => setIsPublic(option.value)}
              style={[styles.visibilityOption, isPublic === option.value && styles.visibilitySelected]}>
              <Ionicons name={option.icon} size={20} color={isPublic === option.value ? "#7cddf5" : "#83a8bd"} />
              <Text style={styles.visibilityLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.visibilityHelp}>{isPublic
          ? "Share this catch on the public feed."
          : "Keep this catch off the public feed."}</Text>
      </View>
    </>
  );
}
