import { API_BASE } from "@/constants/config";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Notification {
  id: number;
  type: "like" | "comment";
  catch_id?: number;
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

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.card}>
      <Text style={styles.text}>
        {item.type === "like"
          ? "Someone liked your catch 🎣"
          : "Someone commented on your catch 💬"}
      </Text>
      <Text style={styles.time}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
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
