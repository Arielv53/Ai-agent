// MostCaughtSpecies.tsx

import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

type MonthlyData = {
  month: string;
  species: {
    [key: string]: number;
  };
};

// Temporary image mapping.
// Add more species here as you add images to the project.
const SPECIES_IMAGES: Record<string, any> = {
  // Example:
  "Striped Bass": require("../../../../assets/species/striped_bass.png"),
  // "Bluefish": require("@/assets/species/bluefish.png"),
  // "Largemouth bass": require("@/assets/species/largemouth-bass.png"),
};

export default function MostCaughtSpecies() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMonthlyStats();
    }
  }, [user]);

  const fetchMonthlyStats = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `${API_BASE}/stats/monthly-statistics`,
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

      if (Array.isArray(data)) {
        setMonthlyStats(data);
      }
    } catch (err) {
      console.error("Most caught species error:", err);
    }
  };

  // Get the current month in the same format
  // returned by the backend: Jan, Feb, Mar, etc.
  const currentMonth = new Date().toLocaleString("en-US", {
    month: "short",
  });

  const currentMonthData = monthlyStats.find(
    (month) => month.month === currentMonth
  );

  const speciesEntries = currentMonthData
    ? Object.entries(currentMonthData.species)
    : [];

  // Find the species with the highest catch count.
  const mostCaught = speciesEntries.reduce<
    [string, number] | null
  >((highest, current) => {
    if (!highest || current[1] > highest[1]) {
      return current;
    }

    return highest;
  }, null);

  // No catches this month
  if (!mostCaught) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Most Caught This Month
        </Text>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🐟</Text>

          <Text style={styles.emptyTitle}>
            No catches yet
          </Text>

          <Text style={styles.emptyText}>
            Log a catch this month to see your most caught species.
          </Text>
        </View>
      </View>
    );
  }

  const [species, count] = mostCaught;

  const speciesImage = SPECIES_IMAGES[species];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Most Caught This Month
      </Text>

      <View style={styles.imageContainer}>
        {speciesImage ? (
          <Image
            source={speciesImage}
            style={styles.speciesImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>
              🐟
            </Text>

            <Text style={styles.placeholderText}>
              Image coming soon
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.catchCount}>
        {count} {count === 1 ? "catch" : "caught"} this month
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#020d16",
    borderRadius: 20,
    padding: 14,
    width: "45%",
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: "#00c8ff7d",
  },

  title: {
    color: "#ffffffbc",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  imageContainer: {
    width: "95%",
    height: 100,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0a1a2515",
  },

  speciesImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },

  placeholderText: {
    color: "#9ee7ff",
    fontSize: 12,
  },
  
  catchCount: {
    color: "#9ee7ff",
    fontSize: 12,
    textAlign: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },

  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },

  emptyText: {
    color: "#ffffff99",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});