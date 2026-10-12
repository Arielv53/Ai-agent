import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PremiumGate() {
  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <Ionicons name="people" size={40} color="#18baff" />
        <View style={styles.crown}>
          <Ionicons name="star" size={12} color="#07121b" />
        </View>
      </View>

      <Text style={styles.eyebrow}>BITEBOOK PREMIUM</Text>
      <Text style={styles.title}>Local knowledge lives here</Text>
      <Text style={styles.description}>
        Join location-specific fishing groups, trade current conditions, and
        learn from anglers who fish the same water.
      </Text>

      <View style={styles.notice}>
        <Ionicons name="lock-closed" size={17} color="#f4b942" />
        <Text style={styles.noticeText}>
          An active Premium membership is required. Access unlocks
          automatically when your subscription is active.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  iconRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: "#0876a5",
    backgroundColor: "#062239",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  crown: {
    position: "absolute",
    right: -2,
    bottom: 4,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#f4b942",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#020d16",
  },
  eyebrow: {
    color: "#f4b942",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },
  description: {
    color: "#9fbdcc",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#161a19",
    borderWidth: 1,
    borderColor: "#725a20",
    borderRadius: 12,
    padding: 14,
    marginTop: 28,
  },
  noticeText: {
    flex: 1,
    color: "#d6c899",
    fontSize: 13,
    lineHeight: 19,
  },
});
