import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileStats({ user }: { user: any }) {
  return (
    <View style={styles.statsRow}>
      <Stat number={user.catches} label="Catches" />
      <Stat number={user.followers} label="Followers" />
      <Stat number={user.following} label="Following" />
    </View>
  );
}

function Stat({ number, label }: { number: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  statBox: { alignItems: "center" },
  statNumber: { color: "#fff", fontSize: 18, fontWeight: "600" },
  statLabel: { color: "#aaa", fontSize: 13 },
});
