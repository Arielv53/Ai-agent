import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SpotGroup } from "../types";

type Props = {
  group: SpotGroup;
  joining: boolean;
  onOpen: () => void;
  onJoin: () => void;
};

export default function SpotGroupCard({
  group,
  joining,
  onOpen,
  onJoin,
}: Props) {
  const preview =
    group.latest_message?.content ||
    group.description ||
    "Join the conversation and share a local report.";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={group.is_joined ? onOpen : onJoin}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`${group.name}, ${group.member_count} members`}
    >
      <View style={styles.spotIcon}>
        <Ionicons name="location" size={25} color="#18baff" />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{group.name}</Text>
        <Text style={styles.meta}>
          {group.city} · {group.member_count} {group.member_count === 1 ? "member" : "members"}
        </Text>
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
      </View>

      <View style={styles.actionColumn}>
        {joining ? (
          <ActivityIndicator color="#18baff" />
        ) : group.is_joined ? (
          <View style={styles.joinedPill}>
            <Ionicons name="checkmark" size={14} color="#3ee3a1" />
            <Text style={styles.joinedText}>Joined</Text>
          </View>
        ) : (
          <View style={styles.joinPill}>
            <Text style={styles.joinText}>Join</Text>
          </View>
        )}

        <Ionicons name="chevron-forward" size={20} color="#7293a5" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 75,
    backgroundColor: "#041a2d",
    borderWidth: 1,
    borderColor: "#075a83",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  spotIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#082b43",
    borderWidth: 1,
    borderColor: "#0876a5",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  meta: {
    color: "#76a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  preview: {
    color: "#acc6d2",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 9,
  },
  actionColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 75,
  },
  joinedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#1f9d70",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  joinedText: {
    color: "#3ee3a1",
    fontSize: 11,
    fontWeight: "700",
  },
  joinPill: {
    borderRadius: 14,
    backgroundColor: "#18baff",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  joinText: {
    color: "#02111b",
    fontSize: 12,
    fontWeight: "800",
  },
});
