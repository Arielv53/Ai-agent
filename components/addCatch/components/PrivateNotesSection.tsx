import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, View } from "react-native";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "notes"
    | "setNotes"
    | "loading"
  >;
};

export default function PrivateNotesSection({ form }: Props) {
  const {
    notes,
    setNotes,
    loading,
  } = form;
  return (
    <>
      <View style={styles.sectionCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Ionicons name="lock-closed-outline" size={18} color="#7cddf5" />
          <Text style={styles.visibilityTitle}>Private notes</Text>
        </View>
        <Text style={styles.visibilityHelp}>Only you can see these notes.</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline maxLength={5000}
          editable={!loading} accessibilityLabel="Private notes" placeholder="What worked? What would you try next time?"
          placeholderTextColor="#83a8bd" style={[styles.captionInput, { minHeight: 60, textAlignVertical: "top", marginTop: 10 }]} />
      </View>
    </>
  );
}
