import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FishingLocation } from "./types";

export default function SpotLocationAdminScreen() {
  const { token, user } = useAuth();
  const [locations, setLocations] = useState<FishingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const loadPending = useCallback(async (signal?: AbortSignal) => {
    if (!token || !user?.is_admin) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/admin/spot-locations?status=pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        },
      );
      const body = await response.json().catch(() => ({}));

      if (!response.ok || !Array.isArray(body)) {
        throw new Error(body.error || "Unable to load location requests.");
      }

      setLocations(body);
    } catch (error) {
      if (!signal?.aborted) {
        Alert.alert(
          "Unable to load requests",
          error instanceof Error ? error.message : "Please try again.",
        );
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [token, user?.is_admin]);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void loadPending(controller.signal);

      return () => controller.abort();
    }, [loadPending]),
  );

  const reviewLocation = async (
    location: FishingLocation,
    status: "active" | "rejected",
  ) => {
    if (!token || reviewingId !== null) {
      return;
    }

    setReviewingId(location.id);

    try {
      const response = await fetch(
        `${API_BASE}/admin/spot-locations/${location.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || "Unable to review this location.");
      }

      setLocations((current) =>
        current.filter((item) => item.id !== location.id),
      );
    } catch (error) {
      Alert.alert(
        "Review not saved",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Return to Spot Groups"
        >
          <Ionicons name="chevron-back" size={23} color="#dff6ff" />
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <Text style={styles.title}>Location requests</Text>
          <Text style={styles.subtitle}>ADMIN REVIEW</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {!user?.is_admin ? (
        <View style={styles.centered}>
          <Ionicons name="lock-closed" size={35} color="#7895a4" />
          <Text style={styles.emptyText}>Administrator access is required.</Text>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#18baff" size="large" />
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(location) => String(location.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centeredList}>
              <Ionicons name="checkmark-circle-outline" size={40} color="#3ee3a1" />
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptyText}>No location requests need review.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={21} color="#18baff" />
                </View>
                <View style={styles.locationIdentity}>
                  <Text style={styles.locationName}>{item.name}</Text>
                  <Text style={styles.locationArea}>
                    {[item.city, item.country].filter(Boolean).join(", ") ||
                      "Area not provided"}
                  </Text>
                </View>
              </View>

              <View style={styles.metrics}>
                <Text style={styles.metricText}>
                  {item.catch_count} {item.catch_count === 1 ? "catch" : "catches"}
                </Text>
                <View style={styles.metricDivider} />
                <Text style={styles.metricText}>
                  {item.unique_angler_count} {item.unique_angler_count === 1 ? "angler" : "anglers"}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => void reviewLocation(item, "rejected")}
                  disabled={reviewingId !== null}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => void reviewLocation(item, "active")}
                  disabled={reviewingId !== null}
                >
                  {reviewingId === item.id ? (
                    <ActivityIndicator color="#02111b" size="small" />
                  ) : (
                    <Text style={styles.approveText}>Approve group</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020d16",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 52,
    paddingBottom: 14,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#075a83",
    backgroundColor: "#061c2d",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 38,
  },
  titleGroup: {
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#f4b942",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centeredList: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 13,
  },
  emptyText: {
    color: "#7895a4",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
  },
  card: {
    borderWidth: 1,
    borderColor: "#075a83",
    borderRadius: 15,
    backgroundColor: "#041a2d",
    padding: 15,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#082b43",
    alignItems: "center",
    justifyContent: "center",
  },
  locationIdentity: {
    flex: 1,
  },
  locationName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  locationArea: {
    color: "#789bab",
    fontSize: 12,
    marginTop: 3,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 15,
  },
  metricText: {
    color: "#9fbdcc",
    fontSize: 12,
  },
  metricDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#3e6274",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  rejectButton: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#77434a",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: {
    color: "#ff8585",
    fontWeight: "700",
  },
  approveButton: {
    flex: 1.45,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#18baff",
    alignItems: "center",
    justifyContent: "center",
  },
  approveText: {
    color: "#02111b",
    fontWeight: "800",
  },
});
