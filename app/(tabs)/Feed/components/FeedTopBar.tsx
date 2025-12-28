import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function FeedTopBar() {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="search-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="notifications-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    topBar: {
    flexDirection: "row",
    justifyContent: "space-between", // one left, one right
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: "#020d16ff", // 🖤 gives it a sleek header look
  },
  iconButton: {
    padding: 6,
  },
});