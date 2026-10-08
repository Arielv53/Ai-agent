import OnboardingSwipe from "@/components/OnboardingSwipe";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LaunchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <OnboardingSwipe page={3}><ImageBackground source={require("../../assets/onboarding/striped-bass.png")} style={styles.image}>
    <LinearGradient colors={["rgba(2,11,19,.6)", "rgba(2,11,19,.05)", "#020b13", "#020b13"]}
      locations={[0, 0.42, 0.78, 1]} style={StyleSheet.absoluteFill} />
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 30, paddingBottom: Math.max(insets.bottom, 24) }]}>
      <Text style={styles.title}>Catch More.{"\n"}<Text style={styles.accent}>Remember More.</Text></Text>
      <Text style={styles.subtitle}>{"Your next great catch is just a log away.\nLet’s get started."}</Text>
      <View style={styles.photoSpace} />
      <View style={styles.features}>
        <Feature icon="fish-outline" text={"Track\nCatches"} />
        <Feature icon="calendar-outline" text={"Save\nKey Details"} />
        <Feature icon="bar-chart-outline" text={"Build\nYour Stats"} last />
      </View>
      <View style={styles.dots} accessibilityLabel="Onboarding step 4 of 4">
        {[0,1,2,3].map(i => <View key={i} style={[styles.dot,i===3 && styles.dotActive]} />)}
      </View>
      <TouchableOpacity accessibilityRole="button" style={styles.cta} onPress={() => router.replace("/(onboarding)/auth?mode=signup")}>
        <Text style={styles.ctaText}>Get Started</Text><Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  </ImageBackground></OnboardingSwipe>;
}
function Feature({ icon, text, last = false }: { icon: React.ComponentProps<typeof Ionicons>["name"]; text: string; last?: boolean }) {
  return <View style={[styles.feature, !last && styles.separator]}>
    <Ionicons name={icon} size={25} color="#17b8ff" /><Text style={styles.featureText}>{text}</Text>
  </View>;
}
const styles = StyleSheet.create({
  image: { flex: 1, backgroundColor: "#020b13" },
  container: { flexGrow: 1, paddingHorizontal: 26 },
  title: { color: "#fff", fontSize: 29, fontWeight: "800", lineHeight: 32, letterSpacing: -0.5 },
  accent: { color: "#14b9ff" },
  subtitle: { color: "#c0d8e4", fontSize: 13, lineHeight: 19, marginTop: 12 },
  photoSpace: { flex: 1, minHeight: 270 },
  features: { flexDirection: "row", marginBottom: 30, paddingVertical: 10 },
  feature: { flex: 1, alignItems: "center", paddingHorizontal: 6 },
  separator: { borderRightWidth: 1, borderRightColor: "#14516d" },
  featureText: { color: "#e6f6fb", fontSize: 11, fontWeight: "600", textAlign: "center", lineHeight: 15, marginTop: 9 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 7, marginBottom: 17 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#27627e" },
  dotActive: { backgroundColor: "#18baff", width: 7, height: 7 },
  cta: { height: 48, borderRadius: 11, backgroundColor: "#119ff0", flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
