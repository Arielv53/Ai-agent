import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNotifications } from "../../hooks/useNotifications";

type FeedTopBarProps = {
  userId: number;
};

export default function FeedTopBar({ userId }: FeedTopBarProps) {
  const { unreadCount } = useNotifications(userId);

  return (
    <View style={styles.topBar}>
      {/* 🔍 Search */}
      <TouchableOpacity
        style={styles.iconButton}
      //  onPress={() => router.push("/(tabs)/Feed/search")}
      >
        <Ionicons name="search-outline" size={26} color="#fff" />
      </TouchableOpacity>

      {/* 🔔 Notifications */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push("/notifications")}
      >
        <Ionicons name="notifications-outline" size={26} color="#fff" />

        {/* 🔴 Unread badge */}
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: "#020d16ff",
  },
  iconButton: {
    padding: 6,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
