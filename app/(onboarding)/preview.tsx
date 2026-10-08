import OnboardingSwipe from "@/components/OnboardingSwipe";
import OnboardingWaves from "@/components/OnboardingWaves";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Illustrative onboarding data, not the signed-in user's statistics.
const HEIGHTS = [24, 43, 32, 61, 38, 72, 48, 67, 37, 59, 46, 77];

export default function PreviewScreen() {
  const insets = useSafeAreaInsets();
  return (
    <OnboardingSwipe page={2}><View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingWaves />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>See Your{"\n"}<Text style={styles.accent}>Progress</Text></Text>
        <Text style={styles.subtitle}>Look back at your catch history, find patterns, and see what’s working — so you can keep improving with every trip.</Text>

        <View style={styles.preview} accessible accessibilityLabel="Example Stats dashboard: 48 total catches, top species Striped Bass, most used lure Swimbait, and a monthly catches chart.">
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Stats</Text>
            <Ionicons name="open-outline" size={20} color="#15baff" />
          </View>
          <View style={styles.metrics}>
            <Metric icon="fish-outline" label="Total Catches" value="48" />
            <Metric icon="trophy-outline" label="Top Species" value="Striped Bass" />
            <Metric icon="rocket-outline" label="Most Used Lure" value="Swimbait" />
          </View>
          <View style={styles.chart}>
            <View style={styles.chartHeader}><Text style={styles.chartTitle}>Monthly Catches</Text><View style={styles.period}><Text style={styles.periodText}>This Year</Text><Ionicons name="chevron-down" size={8} color="#8ab7ce" /></View></View>
            <View style={styles.bars}>
              {MONTHS.map((month, index) => (
                <View key={month} style={styles.column}>
                  <View style={styles.barSpace}><View style={[styles.bar, { height: `${HEIGHTS[index]}%` }]} /></View>
                  <Text style={styles.month}>{month}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.speciesRow}>
            <Image source={require("../../assets/species/striped_bass.png")} resizeMode="contain" style={styles.fishBadge} />
            <View style={styles.speciesCopy}>
              <Text style={styles.speciesLabel}>Most Caught Species</Text>
              <Text style={styles.speciesName}>Striped Bass</Text>
              <Text style={styles.speciesLabel}>18 catches</Text>
              <View style={styles.shareTrack}><View style={styles.shareFill} /></View>
            </View>
            <Text style={styles.percentage}>38%</Text>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.dots} accessibilityLabel="Onboarding step 3 of 4">
          {[0, 1, 2, 3].map((dot) => <View key={dot} style={[styles.dot, dot === 2 && styles.activeDot]} />)}
        </View>

      </View>
    </View></OnboardingSwipe>
  );
}

function Metric({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; value: string }) {
  return <View style={styles.metric}>
    <Ionicons name={icon} size={19} color="#16baff" />
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b13" },
  content: { paddingHorizontal: 27, paddingTop: 30, paddingBottom: 28 },
  title: { color: "#fff", fontSize: 29, lineHeight: 31, fontWeight: "800", letterSpacing: -0.5 },
  accent: { color: "#14b9ff" },
  subtitle: { color: "#a6c0d0", fontSize: 13, lineHeight: 19, marginTop: 16 },
  preview: { marginTop: 30, padding: 12, borderWidth: 1, borderColor: "#0878a6", borderRadius: 19,
    backgroundColor: "#031527", transform: [{ rotate: "-2deg" }], shadowColor: "#00b9ef",
    shadowOpacity: 0.22, shadowRadius: 20, shadowOffset: { width: 0, height: 0 }, elevation: 5 },
  previewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 11 },
  previewTitle: { color: "#f4fbff", fontSize: 21, fontWeight: "800" },
  metrics: { flexDirection: "row", gap: 6 },
  metric: { flex: 1, borderWidth: 1, borderColor: "#125171", borderRadius: 7,
    paddingVertical: 12, paddingHorizontal: 3, alignItems: "center", justifyContent: "center" },
  metricLabel: { color: "#81a9bd", fontSize: 8, textAlign: "center", marginTop: 5 },
  metricValue: { color: "#edfaff", fontSize: 9, fontWeight: "700", textAlign: "center", marginTop: 3 },
  chart: { borderWidth: 1, borderColor: "#125171", borderRadius: 8, marginTop: 9, padding: 9 },
  chartHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  period: { flexDirection: "row", alignItems: "center", gap: 3, padding: 4, borderRadius: 4, borderWidth: 1, borderColor: "#123950" },
  periodText: { color: "#8ab7ce", fontSize: 7 },
  shareTrack: { height: 4, backgroundColor: "#103b54", borderRadius: 2, marginTop: 5 },
  shareFill: { width: "38%", height: "100%", backgroundColor: "#11b9f3", borderRadius: 2 },
  chartTitle: { color: "#e6f7ff", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  bars: { flexDirection: "row", height: 130, gap: 4, marginTop: 5 },
  column: { flex: 1, alignItems: "center" },
  barSpace: { flex: 1, width: "100%", justifyContent: "flex-end", alignItems: "center" },
  bar: { width: "65%", maxWidth: 9, backgroundColor: "#13b4e8", borderRadius: 2 },
  month: { color: "#80a4b8", fontSize: 6, marginTop: 3 },
  speciesRow: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1,
    borderColor: "#125171", borderRadius: 8, marginTop: 9, padding: 8 },
  fishBadge: { width: 58, height: 43, borderRadius: 5, backgroundColor: "#0b3850", alignItems: "center", justifyContent: "center" },
  speciesCopy: { flex: 1 },
  speciesLabel: { color: "#81a9bd", fontSize: 8 },
  speciesName: { color: "#edfaff", fontSize: 10, fontWeight: "700", marginTop: 3 },
  percentage: { color: "#1bc5fa", fontSize: 12, fontWeight: "800" },
  footer: { paddingHorizontal: 27, paddingTop: 12 },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, marginBottom: 17 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#245c75" },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#18baff" },
  cta: { minHeight: 48, borderRadius: 11, backgroundColor: "#119ff0", flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 12 },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
