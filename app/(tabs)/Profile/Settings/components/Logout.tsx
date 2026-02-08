// Profile/Settings/components/Logout.tsx
import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function Logout() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Logout (placeholder)</Text>
    </SafeAreaView> // later: confirm dialog, sign out logic
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
