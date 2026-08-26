import { API_BASE } from "@/constants/config";
import { LURE_IMAGES } from "@/constants/lureImages";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MostUsedLure() {
  const { user } = useAuth();

  const [bait, setBait] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const normalizedBait = bait?.trim().toLowerCase();

  const lureImage = normalizedBait
    ? Object.entries(LURE_IMAGES).find(
        ([name]) =>
          name.toLowerCase() === normalizedBait
      )?.[1]
    : null;

  useEffect(() => {
    if (user) {
      fetchMostUsedBait();
    }
  }, [user]);

  const fetchMostUsedBait = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `${API_BASE}/stats/most-used-bait`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      );

      const data = await res.json();

      console.log("MOST USED BAIT:", data);

      setBait(data.bait);
      setCount(data.count);
    } catch (err) {
      console.error("Most used bait error:", err);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Lure of the Month
        </Text>

        <View style={styles.iconBadge}>
          <Text style={styles.icon}>🎣</Text>
        </View>
      </View>

      {/* Lure image */}
      <View style={styles.imageContainer}>
        {lureImage ? (
          <Image
            source={lureImage}
            style={styles.lureImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>
              🎣
            </Text>

            <Text style={styles.placeholderText}>
              No lure yet
            </Text>
          </View>
        )}
      </View>

      {/* Statistic */}
      <View style={styles.statRow}>
        <Text style={styles.count}>
          {count}
        </Text>

        <Text style={styles.catchLabel}>
          {count === 1 ? "catch" : "catches"}
        </Text>
      </View>

      <Text style={styles.lureName}>
        {bait || "Unknown lure"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexBasis: 0,
    minHeight: 204,
    backgroundColor: "#03141d",
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: "#093b58",
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    color: "#e5eaed",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
  },

  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#062d46",
    borderWidth: 1,
    borderColor: "#0a5d87",
    marginBottom: 2,
  },

  icon: {
    fontSize: 16,
  },

  imageContainer: {
    height: 105,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  lureImage: {
    width: "100%",
    height: "100%",
  },

  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderIcon: {
    fontSize: 36,
  },

  placeholderText: {
    color: "#71808a",
    fontSize: 10,
    marginTop: 2,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 1,
  },

  count: {
    color: "#28aaf2",
    fontSize: 23,
    fontWeight: "800",
  },

  catchLabel: {
    color: "#a8b2b8",
    fontSize: 11,
    marginLeft: 5,
  },

  lureName: {
    color: "#8e9aa1",
    fontSize: 11,
    textAlign: "center",
    marginTop: 1,
  },
});