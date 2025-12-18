import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export default function LevelUpOverlay({ level, onFinish }: { level: number; onFinish: () => void }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(onFinish);
  }, []);

  return (
    <View style={styles.overlay}>
      {/* 🆕 CONFETTI */}
      <ConfettiCannon
        count={80}
        origin={{ x: -10, y: 0 }}
        fadeOut
        explosionSpeed={350}
        fallSpeed={2500}
      />
      
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale }], opacity },
        ]}
      >
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Level Up!</Text>
        <Text style={styles.level}>Level {level}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  card: {
    backgroundColor: "#0b1c2d",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  level: {
    fontSize: 18,
    color: "#7dd3fc",
    marginTop: 4,
  },
});
