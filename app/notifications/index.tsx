import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NotificationItem from "./NotificationItem";

type NotificationType = "like" | "comment" | "follow";

interface Notification {
  id: number;
  type: NotificationType;
  catch_id?: number;
  actor_id: number;
  actor_username: string;
  actor_avatar_url?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setNotifications([]);
    setError(null);
    if (authLoading || !token) {
      setLoading(authLoading);
      return () => controller.abort();
    }
    const loadNotifications = async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const res = await fetch(`${API_BASE}/notifications`, {
          headers, signal: controller.signal,
        });
        if (!res.ok) throw new Error("Unable to load notifications. Please try again or sign in again.");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid notification response.");
        if (controller.signal.aborted) return;
        setNotifications(data);
        const marked = await fetch(`${API_BASE}/notifications/mark-read`, {
          method: "POST", headers, signal: controller.signal,
        });
        if (!marked.ok) throw new Error("Notifications loaded, but could not be marked as read.");
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to load notifications.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadNotifications();
    return () => controller.abort();
  }, [token, authLoading]));

  const renderItem = ({ item }: { item: Notification }) => {


  return (
    <NotificationItem
      notification={item}
      onPress={() => {
        if (item.type === "follow") {
          router.push(`/UserProfile/${item.actor_id}`);
        } else if (item.catch_id) {
          router.push(`/catch/${item.catch_id}`);
        }
      }}
    />
  );
};



  return (
    <>
      {/* 🆕 Custom header */}
      <Stack.Screen
        options={{
          title: "Notifications",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#020d16" },
          headerTitleStyle: { color: "#fff", fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 5 }}
            >
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {loading && <ActivityIndicator color="#fff" />}
        {error && <Text style={styles.empty}>{error}</Text>}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            !loading && !error ? (
              <Text style={styles.empty}>{token ? "No notifications yet" : "Sign in to see your notifications"}</Text>
            ) : null
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020d16",
    padding: 12,
  },
  card: {
    backgroundColor: "#03121e",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  text: {
    color: "#fff",
    fontSize: 14,
  },
  time: {
    color: "#9aa4ad",
    fontSize: 12,
    marginTop: 6,
  },
  empty: {
    color: "#9aa4ad",
    textAlign: "center",
    marginTop: 40,
  },
});
