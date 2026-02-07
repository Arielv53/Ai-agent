import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import CatchGrid from "./components/CatchGrid";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import { useProfileData } from "./hooks/useProfileData";

export default function Profile() {
  const userId = 1; // replace with auth later
  const { user, catches, loading } = useProfileData(userId);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f5b20b" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "#fff" }}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileHeader user={user} />
      <ProfileStats user={user} />
      <CatchGrid catches={catches} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0b" },
  loaderContainer: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    justifyContent: "center",
    alignItems: "center",
  },
});
