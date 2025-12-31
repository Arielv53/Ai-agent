import { API_BASE } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NotificationItem from "./NotificationItem";

interface Notification {
  id: number;
  type: "like" | "comment";
  catch_id?: number;
  actor_id: number;
  actor_username: string;
  actor_avatar_url?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userId = 1; // replace with auth later

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        /* 1. Fetch notifications for this user */
        const res = await fetch(
          `${API_BASE}/notifications?user_id=${userId}`
        );
        const data = await res.json();
        setNotifications(data);

        /* 2. Mark all notifications as read ON OPEN */
        await fetch(`${API_BASE}/notifications/mark-read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();
  }, []);

  const renderItem = ({ item }: { item: Notification }) => {
  return (
    <NotificationItem
      notification={item}
      onPress={() => {
        if (!item.catch_id) return;
        router.push(`/catch/${item.catch_id}`);
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
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet</Text>
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
