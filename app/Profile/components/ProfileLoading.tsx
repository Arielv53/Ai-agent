import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function ProfileLoading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function ProfileError() {
  return (
    <View style={styles.center}>
      <Text style={styles.error}>User not found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020d16",
  },
  error: {
    color: "#ef4444",
  },
});