import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNotifications } from "../../_hooks/useNotifications";

export default function FeedTopBar() {
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.topBar}>
      {/* 🔍 Search */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push("./search", { relativeToDirectory: true })}
        accessibilityRole="button"
        accessibilityLabel="Search users"
      >
        <Ionicons name="search-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/spot-groups" as never)}
          accessibilityRole="button"
          accessibilityLabel="Open premium spot groups"
        >
          <Ionicons name="people-circle-outline" size={28} color="#fff" />
          <View style={styles.premiumDot}>
            <Ionicons name="star" size={7} color="#07121b" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/notifications")}
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
        >
          <Ionicons name="notifications-outline" size={26} color="#fff" />

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
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
    marginTop: 23,
  },
  iconButton: {
    padding: 6,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  premiumDot: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#f4b942",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#020d16",
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
