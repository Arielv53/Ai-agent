// Profile/Settings/components/EditProfile.tsx
import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function EditProfile() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Profile (placeholder)</Text>
    </SafeAreaView> // We'll implement the actual edit UI later
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2a33",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontSize: 18 },
});
