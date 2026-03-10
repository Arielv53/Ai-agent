// Profile/Settings/components/Logout.tsx
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function Logout() {
  const { logout, loading } = useAuth();

  const confirm = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={confirm}>
          <Text style={styles.text}>Log Out</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2a33",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#e53935",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
  },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
