import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

export default function ProfileLoader() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1200,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessible
      accessibilityLabel="Loading profile"
      accessibilityState={{ busy: true }}
    >
      <View style={styles.header}>
        <Animated.View style={[styles.placeholder, styles.cover, { opacity }]} />
        <View style={styles.profileRow}>
          <Animated.View style={[styles.placeholder, styles.avatar, { opacity }]} />
          <Animated.View style={[styles.identity, { opacity }]}>
            <View style={[styles.placeholder, styles.name]} />
            <View style={[styles.placeholder, styles.username]} />
            <View style={[styles.placeholder, styles.location]} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.stats}>
        {[0, 1, 2].map((stat) => (
          <Animated.View key={stat} style={[styles.stat, { opacity }]}>
            <View style={[styles.placeholder, styles.statIcon]} />
            <View style={styles.statText}>
              <View style={[styles.placeholder, styles.statNumber]} />
              <View style={[styles.placeholder, styles.statLabel]} />
            </View>
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[styles.grid, { opacity }]}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.gridRow}>
            {[0, 1, 2].map((column) => (
              <View key={column} style={[styles.placeholder, styles.tile]} />
            ))}
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 95,
  },
  placeholder: {
    backgroundColor: "#0a1c2b",
    borderRadius: 6,
  },
  header: {
    minHeight: 200,
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "#041729",
  },
  cover: {
    height: 105,
    borderRadius: 0,
  },
  profileRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -26,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: "#041729",
  },
  identity: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 37,
    gap: 7,
  },
  name: {
    height: 20,
    width: "80%",
  },
  username: {
    height: 12,
    width: "50%",
  },
  location: {
    height: 10,
    width: "65%",
  },
  stats: {
    height: 50,
    flexDirection: "row",
    marginHorizontal: 11,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#031a2d",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 23,
    height: 23,
  },
  statText: {
    gap: 5,
  },
  statNumber: {
    width: 24,
    height: 16,
  },
  statLabel: {
    width: 48,
    height: 8,
  },
  grid: {
    paddingHorizontal: 14,
    paddingTop: 13,
    gap: 8,
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
  },
});
