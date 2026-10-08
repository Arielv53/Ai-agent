import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Leader = { name: string; count: number };
type Location = { name: string; count: number; share: number; species: Leader[];
  bait: Leader[]; method: Leader[]; days_fished: number };
type Summary = { total_catches: number; locations: Location[] };

export default function MostProductiveLocation() {
  const { token, loading: authLoading } = useAuth();
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setData(null); setError(false); setLoading(authLoading || !!token);
    if (authLoading || !token) return () => controller.abort();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/stats/productive-locations`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (!response.ok) throw new Error("Location summary unavailable");
        const summary = await response.json();
        if (!controller.signal.aborted) setData(summary);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
    // Retry intentionally reloads the summary without changing the account.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading, attempt]));

  return <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.heading}>
        <Text style={styles.title}>Most Productive Location This Month</Text>
        <Text style={styles.subtitle}>Based on your logged catches</Text>
      </View>
      <View style={styles.badge}><Ionicons name="location-outline" size={19} color="#26b5ee" /></View>
    </View>
    {loading ? <ActivityIndicator color="#26b5ee" style={styles.status} />
      : error ? <TouchableOpacity onPress={() => setAttempt((value) => value + 1)} accessibilityRole="button">
        <Text style={styles.statusText}>Unable to load locations. Tap to retry.</Text>
      </TouchableOpacity>
      : !data?.locations.length ? <Text style={styles.statusText}>{!token ? "Sign in to see your top locations."
        : data?.total_catches ? "Add a location to this month’s catches to discover your top spot."
        : "Log a catch with a location to discover your top spot this month."}</Text>
      : data.locations.map((location) => <View key={location.name} style={styles.location}>
        {data.locations.length > 1 && <Text style={styles.tie}>TIED FOR TOP LOCATION</Text>}
        <View style={styles.summary}>
          <View style={styles.locationIcon}><Ionicons name="location" size={27} color="#27e889" /></View>
          <View style={styles.heading}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.count}><Text style={styles.countNumber}>{location.count}</Text> {location.count === 1 ? "catch" : "catches"}
              <Text style={styles.share}> · {location.share}% of this month’s catches</Text></Text>
          </View>
        </View>
        <View style={styles.track}><View style={[styles.progress, { width: `${location.share}%` }]} /></View>
        <View style={styles.detailGrid}>
          <Detail label={"Most caught species"} icon="fish-outline" values={location.species} />
          <Detail label="Top bait or lure" icon="color-wand-outline" values={location.bait} />
          <Detail label="Top method" icon="water-outline" values={location.method} />
        </View>
      </View>)}
  </View>;
}

function Detail({ label, icon, values }: { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; values: Leader[] }) {
  if (!values.length) return null;
  return <View style={styles.detail}>
    <Text style={styles.detailLabel}>{label}</Text>
    {values.map((value) => <View key={value.name}>
      <Text style={styles.detailValue}>{value.name}</Text>
      <Text style={styles.subtitle}>{value.count} {value.count === 1 ? "catch" : "catches"}{values.length > 1 ? " · tied" : ""}</Text>
    </View>)}
    <Ionicons name={icon} size={15} color="#26b5ee" style={styles.detailIcon} />
  </View>;
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 15, padding: 14,
    backgroundColor: "#03141f", borderWidth: 1, borderColor: "#0a3548" },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  heading: { flex: 1 },
  title: { color: "#e5eaed", fontSize: 13, fontWeight: "700", lineHeight: 19 },
  subtitle: { color: "#8e9fa9", fontSize: 11, marginTop: 6 },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#082d45", alignItems: "center", justifyContent: "center" },
  location: { marginTop: 16 },
  summary: { flexDirection: "row", alignItems: "center", gap: 12 },
  locationIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#052b25", borderWidth: 1,
    borderColor: "#096346", alignItems: "center", justifyContent: "center" },
  locationName: { color: "#27e889", fontWeight: "700", fontSize: 19 },
  count: { color: "#b8c7d0", fontSize: 12, marginTop: 5, lineHeight: 20 },
  countNumber: { color: "#27e889", fontSize: 17, fontWeight: "700" },
  share: { color: "#8e9fa9", fontSize: 11 },
  track: { height: 4, backgroundColor: "#0d2b38", borderRadius: 2, overflow: "hidden", marginVertical: 14 },
  progress: { height: "100%", backgroundColor: "#21b879" },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  detail: { flexBasis: "46%", flexGrow: 1, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 11, backgroundColor: "#061e2b", borderWidth: 1, borderColor: "#0b3042", gap: 3 },
  detailLabel: { color: "#90a9b7", fontSize: 11 },
  detailIcon: { alignSelf: "flex-end", marginTop: "auto" },
  detailValue: { color: "#e5eff5", fontSize: 14, fontWeight: "600", marginTop: 5 },
  tie: { color: "#90a9b7", fontSize: 9, letterSpacing: 1.1, marginBottom: 10 },
  status: { marginVertical: 20 },
  statusText: { color: "#90a9b7", fontSize: 13, lineHeight: 20, marginTop: 16 },
});
