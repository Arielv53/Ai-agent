import OnboardingSwipe from "@/components/OnboardingSwipe";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OnboardingWaves from "@/components/OnboardingWaves";

type Icon = React.ComponentProps<typeof Ionicons>["name"];
type Field = { icon: Icon; label: string; value: string; wide?: boolean };
const DETAILS: Field[] = [
  { icon: "resize-outline", label: "Length (inches)", value: "28" },
  { icon: "scale-outline", label: "Weight (lbs)", value: "12.4" },
  { icon: "boat-outline", label: "Method", value: "Trolling", wide: true },
];
const WEATHER: Field[] = [
  { icon: "thermometer-outline", label: "Water Temp (°F)", value: "68" },
  { icon: "sunny-outline", label: "Air Temp (°F)", value: "72" },
  { icon: "moon-outline", label: "Moon Phase", value: "Waning Gibbous" },
  { icon: "flag-outline", label: "Wind Speed (mph)", value: "8" },
];

export default function SetupScreen() {
  const insets = useSafeAreaInsets();
  return <OnboardingSwipe page={1}><View style={[styles.container, { paddingTop: insets.top }]}>
    <OnboardingWaves />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Log Your{"\n"}<Text style={styles.accent}>Key Details</Text></Text>
      <Text style={styles.subtitle}>Capture the important info for every catch — from species and lure to weather, location and more.</Text>
      <View style={styles.mockPhone} accessible accessibilityLabel="Example Add Catch form showing a striped bass, measurements, trolling method, and weather conditions.">
        <View style={styles.mockHeader}><Ionicons name="chevron-back" color="#91dfff" size={15}/><Text style={styles.mockHeading}>Add Catch</Text><Ionicons name="fish-outline" color="#19baff" size={16}/></View>
        <View style={styles.photoRow}>
          <Image source={require("../../assets/species/striped_bass.png")} style={styles.photo} resizeMode="contain" />
          <View style={styles.species}><Text style={styles.speciesLabel}>Species</Text><Text style={styles.speciesText}>Striped Bass</Text></View>
        </View>
        <MiniCard icon="fish-outline" title="Catch Details" fields={DETAILS}/>
        <MiniCard icon="partly-sunny-outline" title="Weather Conditions" fields={WEATHER}/>
      </View>
    </ScrollView>
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <View style={styles.dots} accessibilityLabel="Onboarding step 2 of 4">{[0,1,2,3].map(i => <View key={i} style={[styles.dot, i === 1 && styles.dotActive]}/>)}</View>

    </View>
  </View></OnboardingSwipe>;
}
function MiniCard({ icon, title, fields }: { icon: Icon; title: string; fields: Field[] }) {
  return <View style={styles.card}>
    <View style={styles.cardTitle}><Ionicons name={icon} color="#18baff" size={14}/><Text style={styles.cardTitleText}>{title}</Text><Ionicons name="chevron-forward" color="#63c6ee" size={13}/></View>
    <View style={styles.valueGrid}>{fields.map(field => <View key={field.label} style={[styles.field, field.wide && styles.wide]}>
      <Ionicons name={field.icon} size={17} color="#55caff" />
      <View style={styles.fieldText}><Text style={styles.fieldLabel}>{field.label}</Text><Text style={styles.fieldValue}>{field.value}</Text></View>
    </View>)}</View>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b13" },
  content: { paddingHorizontal: 27, paddingTop: 26, paddingBottom: 30 },
  title: { color: "#fff", fontSize: 29, fontWeight: "800", lineHeight: 31, letterSpacing: -0.5 },
  accent: { color: "#14b9ff" },
  subtitle: { color: "#a6c0d0", fontSize: 13, lineHeight: 19, marginTop: 12 },
  mockPhone: { marginTop: 30, borderWidth: 1, borderColor: "#0878b4", borderRadius: 19, backgroundColor: "#031322", padding: 12,
    transform: [{ rotate: "-5deg" }], shadowColor: "#00aef5", shadowOpacity: 0.35, shadowRadius: 18, elevation: 8 },
  mockHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#124059" },
  mockHeading: { color: "#e9f9ff", fontSize: 12, fontWeight: "700" },
  photoRow: { flexDirection: "row", gap: 8, marginVertical: 10 },
  photo: { height: 68, width: "48%", backgroundColor: "#0a273b", borderRadius: 7 },
  species: { flex: 1, borderWidth: 1, borderColor: "#104362", backgroundColor: "#041c2d", borderRadius: 7, justifyContent: "center", padding: 9 },
  speciesLabel: { color: "#789faf", fontSize: 8, marginBottom: 4 },
  speciesText: { color: "#d4f3ff", fontSize: 11, fontWeight: "600" },
  card: { borderWidth: 1, borderColor: "#07527d", borderRadius: 8, padding: 8, marginTop: 8 },
  cardTitle: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitleText: { color: "#d8f5ff", fontSize: 10, fontWeight: "700", flex: 1 },
  valueGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  field: { width: "48%", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#06233a", borderWidth: 1, borderColor: "#0c3c58", padding: 7, borderRadius: 5, minHeight: 42 },
  wide: { width: "100%" },
  fieldText: { flex: 1 },
  fieldLabel: { color: "#76badb", fontSize: 7 },
  fieldValue: { color: "#e4f6ff", fontSize: 9, marginTop: 3 },
  footer: { paddingHorizontal: 27, paddingTop: 12 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 7, marginBottom: 17 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#27627e" },
  dotActive: { backgroundColor: "#18baff", width: 7, height: 7 },
  cta: { height: 48, borderRadius: 11, backgroundColor: "#119ff0", flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
