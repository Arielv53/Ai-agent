import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LoggedValue = string | number | null;
interface Catch {
  id: number;
  image_url?: string | null;
  species?: string | null;
  date_caught?: string | null;
  caption?: string | null;
  notes?: string | null;
  location?: string | null;
  length?: LoggedValue;
  weight?: LoggedValue;
  water_temp?: LoggedValue;
  air_temp?: LoggedValue;
  wind_speed?: LoggedValue;
  moon_phase?: string | null;
  tide?: string | null;
  size?: string | null;
  bait_used?: string | null;
  method?: string | null;
}

interface CatchDetailsProps {
  catchId: number;
  onClose?: () => void;
}

function logged(value: LoggedValue | undefined): value is string | number {
  if (typeof value === "number") return Number.isFinite(value);
  return typeof value === "string" && !!value.trim() && value.trim().toLowerCase() !== "n/a";
}

function formatDate(value?: string | null) {
  if (!value?.trim()) return null;
  // Keep a logged calendar date in its original day, independent of time zone.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

type Detail = { label: string; value: LoggedValue | undefined; icon: React.ComponentProps<typeof Ionicons>["name"]; unit?: string };

export default function CatchDetails({ catchId, onClose }: CatchDetailsProps) {
  const { token, loading: authLoading } = useAuth();
  const [catchData, setCatchData] = useState<Catch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setCatchData(null);
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/catches/${catchId}`, { signal: controller.signal, headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error("Unable to load this catch.");
        const data = await res.json();
        if (!controller.signal.aborted) setCatchData(data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load this catch.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [catchId, attempt, token, authLoading]);

  const details: Detail[] = catchData ? [
    { label: "Date caught", value: formatDate(catchData.date_caught), icon: "calendar-outline" },
    { label: "Location", value: catchData.location, icon: "location-outline" },
    { label: "Length", value: catchData.length, icon: "resize-outline", unit: " in" },
    { label: "Weight", value: catchData.weight, icon: "scale-outline", unit: " lbs" },
    { label: "Size", value: catchData.size, icon: "resize-outline" },
    { label: "Bait used", value: catchData.bait_used, icon: "fish-outline" },
    { label: "Method", value: catchData.method, icon: "hand-left-outline" },
    { label: "Tide", value: catchData.tide, icon: "water-outline" },
    { label: "Moon phase", value: catchData.moon_phase, icon: "moon-outline" },
    { label: "Water temperature", value: catchData.water_temp, icon: "thermometer-outline", unit: "°F" },
    { label: "Air temperature", value: catchData.air_temp, icon: "sunny-outline", unit: "°F" },
    { label: "Wind speed", value: catchData.wind_speed, icon: "flag-outline", unit: " mph" },
    { label: "Private notes", value: catchData.notes, icon: "lock-closed-outline" },
    { label: "Caption", value: catchData.caption, icon: "document-text-outline" },
  ] : [];

  return (
    <View style={styles.container}>
      {onClose && <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back to catches">
          <Ionicons name="chevron-back" size={28} color="#7cddf5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catch details</Text>
        <View style={styles.backButton} />
      </View>}
      {loading ? <View style={styles.status}><ActivityIndicator size="large" color="#7cddf5" /></View>
        : error || !catchData ? <View style={styles.status}>
          <Text style={styles.error}>{error || "Catch not found."}</Text>
          <TouchableOpacity onPress={() => setAttempt((value) => value + 1)} style={styles.retry} accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View> : <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          {logged(catchData.image_url) && <Image source={{ uri: catchData.image_url }}
            style={styles.image} resizeMode="cover" accessibilityLabel={logged(catchData.species) ? `Catch photo: ${catchData.species}` : "Catch photo"} />}
          {logged(catchData.species) && <View style={styles.speciesBlock}>
            <Text style={styles.eyebrow}>SPECIES</Text>
            <Text style={styles.species}>{catchData.species}</Text>
          </View>}
          <View style={styles.details}>
            {details.filter((detail) => logged(detail.value)).map((detail) => <View key={detail.label} style={styles.detailCard}>
              <View style={styles.iconBox}><Ionicons name={detail.icon} size={25} color="#7cddf5" /></View>
              <View style={styles.detailText}>
                <Text style={styles.label}>{detail.label.toUpperCase()}</Text>
                <Text style={styles.value}>{typeof detail.value === "string" ? detail.value.trim() : detail.value}{detail.unit}</Text>
              </View>
            </View>)}
          </View>
        </ScrollView>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020d16" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", color: "#f4f7fa", fontSize: 21, fontWeight: "700" },
  scrollContainer: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  image: { width: "100%", aspectRatio: 1.4, borderRadius: 18, backgroundColor: "#0b1c29" },
  speciesBlock: { marginTop: 22, marginBottom: 22 },
  eyebrow: { color: "#9caab7", fontSize: 11, letterSpacing: 2.5, fontWeight: "600", marginBottom: 7 },
  species: { color: "#f4f7fa", fontSize: 32, fontWeight: "700", letterSpacing: -0.7 },
  details: { gap: 12, marginTop: 8 },
  detailCard: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16,
    backgroundColor: "#071925", borderWidth: 1, borderColor: "#163a4c", borderRadius: 18 },
  iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#09202f", borderWidth: 1,
    borderColor: "#1b455b", alignItems: "center", justifyContent: "center" },
  detailText: { flex: 1, gap: 6 },
  label: { color: "#9caab7", fontSize: 10, fontWeight: "600", letterSpacing: 1.7 },
  value: { color: "#f4f7fa", fontSize: 18, lineHeight: 25, fontWeight: "500" },
  status: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  error: { color: "#b6c6d2", textAlign: "center", fontSize: 16 },
  retry: { padding: 16 },
  retryText: { color: "#7cddf5", fontWeight: "600" },
});
