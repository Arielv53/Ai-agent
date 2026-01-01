import { API_BASE } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

type UserProfile = {
  id: number;
  username: string;
  profile_photo?: string;
  level: number;
  prestige: number;
};

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${id}/profile`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>User not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: user.username,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#020d16" },
          headerTitleStyle: { color: "#fff" },
        }}
      />

      <View style={styles.container}>
        {user.profile_photo ? (
          <Image
            source={{ uri: user.profile_photo }}
            style={styles.avatar}
          />
        ) : (
          <Ionicons name="person-circle" size={120} color="#6b7280" />
        )}

        <Text style={styles.username}>{user.username}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>Level {user.level}</Text>
          <Text style={styles.metaText}>Prestige {user.prestige}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 40,
    backgroundColor: "#020d16",
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020d16",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    gap: 16,
  },
  metaText: {
    color: "#9ca3af",
  },
  error: {
    color: "#ef4444",
  },
});