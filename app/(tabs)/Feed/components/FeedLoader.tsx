import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function FeedLoader() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {[1, 2, 3].map((_, idx) => (
        <View key={idx} style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Animated.View style={[styles.avatar, { opacity }]} />
            <View style={styles.headerText}>
              <Animated.View style={[styles.lineShort, { opacity }]} />
              <Animated.View style={[styles.lineTiny, { opacity }]} />
            </View>
          </View>

          {/* Image placeholder */}
          <Animated.View style={[styles.image, { opacity }]} />

          {/* Caption */}
          <View style={styles.caption}>
            <Animated.View style={[styles.lineMedium, { opacity }]} />
            <Animated.View style={[styles.lineShort, { opacity }]} />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Animated.View style={[styles.actionPill, { opacity }]} />
            <Animated.View style={[styles.actionPill, { opacity }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020d16",
    paddingTop: 8,
  },

  card: {
    backgroundColor: "#03121e",
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 14,
    overflow: "hidden",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0a1c2b",
    marginRight: 10,
  },

  headerText: {
    flex: 1,
  },

  image: {
    width: "100%",
    height: 260,
    backgroundColor: "#0a1c2b",
  },

  caption: {
    padding: 12,
  },

  lineShort: {
    width: "40%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0a1c2b",
    marginBottom: 6,
  },

  lineMedium: {
    width: "60%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0a1c2b",
    marginBottom: 6,
  },

  lineTiny: {
    width: "25%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0a1c2b",
  },

  actions: {
    flexDirection: "row",
    padding: 10,
    gap: 12,
  },

  actionPill: {
    flex: 1,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0a1c2b",
  },
});
