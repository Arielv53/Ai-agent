import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import BiteBookLogo from "./BiteBookLogo";

export default function BiteBookLaunch() {
  const logoScale = useRef(new Animated.Value(0.74)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 52, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]);
    const breathing = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.075, duration: 1250, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1250, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    entrance.start();
    breathing.start();
    return () => { entrance.stop(); breathing.stop(); };
  }, [logoScale, opacity, pulse]);

  return <LinearGradient colors={["#020e18", "#020b13", "#01070d"]} style={styles.container}>
    <Animated.View style={[styles.halo, { opacity, transform: [{ scale: pulse }] }]} />
    <Animated.View style={{ opacity, transform: [{ scale: logoScale }] }}>
      <View style={styles.logoCircle}><BiteBookLogo /></View>
    </Animated.View>
  </LinearGradient>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  halo: { position: "absolute", width: 190, height: 190, borderRadius: 95,
    backgroundColor: "#032131", shadowColor: "#00c8ff", shadowOpacity: 0.3,
    shadowRadius: 26, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  logoCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: .5,
    borderColor: "#0bc2fa78", backgroundColor: "#02121e", alignItems: "center", justifyContent: "center" },
});
