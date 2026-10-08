import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Snapshot = { total_catches: number; unique_species: number; previous_catches: number;
  change: number; change_percent: number | null };

export default function QuickInsights() {
  const { token, loading: authLoading } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setSnapshot(null); setError(false); setLoading(authLoading || !!token);
    if (authLoading || !token) return () => controller.abort();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/stats/monthly-snapshot`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (!response.ok) throw new Error("Snapshot unavailable");
        const data = await response.json();
        if (!controller.signal.aborted) setSnapshot(data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
    // Explicit retry invalidates the previous request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading, attempt]));

  const change = snapshot?.change ?? 0;
  return <View style={styles.card}>
    <Text style={styles.title}>Quick Insights This Month</Text>
    {loading ? <ActivityIndicator color="#26b5ee" style={styles.status} />
      : error ? <TouchableOpacity onPress={() => setAttempt((value) => value + 1)} accessibilityRole="button">
        <Text style={styles.message}>Unable to load insights. Tap to retry.</Text>
      </TouchableOpacity> : !snapshot ? <Text style={styles.message}>Sign in to see your monthly insights.</Text>
      : <>
        <View style={styles.grid}>
          <Metric label="Total catches" value={String(snapshot.total_catches)} icon="fish-outline" color="#27e889"
            tone="green" note="Logged this month" />
          <Metric label="Species caught" value={String(snapshot.unique_species)} icon="layers-outline" color="#26b5ee"
            tone="blue" note="Unique species" />
          <Metric label="vs. last month" value={`${change > 0 ? "+" : ""}${change}`} color="#f5a900" tone="orange"
            icon={change > 0 ? "trending-up-outline" : change < 0 ? "trending-down-outline" : "remove-outline"}
            note={snapshot.change_percent === null ? "No catches last month"
              : `${snapshot.change_percent > 0 ? "+" : ""}${snapshot.change_percent}% in catches`} />
        </View>
        <Text style={styles.footnote}>Month to date compared with all of last month.</Text>
      </>}
  </View>;
}

function Metric({ label, value, note, icon, color, tone }: { label: string; value: string; note: string;
  icon: React.ComponentProps<typeof Ionicons>["name"]; color: string; tone: "green" | "blue" | "orange" }) {
  return <View style={[styles.metric, styles[tone]]}>
    <View style={styles.metricTop}><Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.value, { color }]}>{value}</Text></View>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.note}>{note}</Text>
  </View>;
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 12, padding: 13, backgroundColor: "#03141f",
    borderRadius: 15, borderWidth: 1, borderColor: "#0a3548" },
  title: { color: "#e5eaed", fontSize: 13, fontWeight: "700", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: { flexBasis: 90, flexGrow: 1, padding: 10, backgroundColor: "#061e2b", borderRadius: 11,
    borderWidth: 1, borderColor: "#0b3042" },
  green: { backgroundColor: "#06231e", borderColor: "#0b4232" },
  blue: { backgroundColor: "#061b29", borderColor: "#0b3042" },
  orange: { backgroundColor: "#1c1e16", borderColor: "#40351a" },
  metricTop: { flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" },
  value: { fontSize: 23, fontWeight: "700" },
  label: { color: "#d8e5ed", fontSize: 11, marginTop: 8 },
  note: { color: "#8e9fa9", fontSize: 10, marginTop: 5, lineHeight: 15 },
  footnote: { color: "#8e9fa9", fontSize: 10, marginTop: 10 },
  message: { color: "#90a9b7", fontSize: 13, lineHeight: 20 },
  status: { marginVertical: 16 },
});
