import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { UserProfile } from "../types";

type Props = {
  user: UserProfile;
};

export default function ProfileHeader({ user }: Props) {
  return (
    <View style={styles.container}>
      {user.profile_photo ? (
        <Image source={{ uri: user.profile_photo }} style={styles.avatar} />
      ) : (
        <Ionicons name="person-circle" size={120} color="#6b7280" />
      )}

      <Text style={styles.username}>{user.username}</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.catch_count ?? 0}</Text>
          <Text style={styles.statLabel}>Catches</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.followers_count ?? 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.following_count ?? 0}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaText}>Level {user.level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
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
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 18,
  },
  statNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    gap: 16,
  },
  metaText: {
    color: "#9ca3af",
  },
});