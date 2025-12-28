import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

export default function FeedFab({ scrollY }: { scrollY: Animated.Value }) {
  const router = useRouter();

  const opacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0.4, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={[styles.fabContainer, { opacity }]}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/addCatch")}
      >
        <Ionicons name="add" size={30} color="#00c8ff96" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
    fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    borderWidth: 2,
    borderColor: "#00c8ff93",
  },
});