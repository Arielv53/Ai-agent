import { useAuth } from "@/contexts/AuthContext";
import { useLocalSearchParams } from "expo-router/build/hooks";
import React, { useMemo } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useProfileData } from "./_hooks/useProfileData";
import CatchGrid from "./components/CatchGrid";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";

export default function Profile() {
  const params = useLocalSearchParams();
  const { user: authUser, logout } = useAuth();
  const userIdFromRoute = params.userId ? Number(params.userId) : undefined;
  const userId = useMemo(
    () => userIdFromRoute || authUser?.id,
    [userIdFromRoute, authUser],
  );
  const { user, catches, loading } = useProfileData(userId!);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#f5b20b" />
          </View>
        ) : user ? (
          <>
            <ProfileHeader user={user} />
            <ProfileStats user={user} />
            <CatchGrid catches={catches} />
          </>
        ) : (
          <View style={styles.center}>
            <Text style={styles.notFoundText}>User not found</Text>
            <Text style={{ color: "yellow", fontSize: 30 }}>
              PROFILE SCREEN DEBUG
            </Text>

            {/* ✅ NEW: DEV logout button INSIDE this view */}
            <TouchableOpacity
              style={styles.logoutButtonInline}
              onPress={logout}
            >
              <Text style={styles.logoutText}>DEV LOGOUT</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0b" },
  content: { flex: 1},
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFoundText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
  logoutButtonInline: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "red",
    borderRadius: 8,
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    justifyContent: "center",
    alignItems: "center",
  },
});
