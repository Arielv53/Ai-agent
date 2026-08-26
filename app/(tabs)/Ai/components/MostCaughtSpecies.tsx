import { API_BASE } from "@/constants/config";
import { SPECIES_IMAGES } from "@/constants/specieImages";
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

  const currentMonth = new Date().toLocaleString("en-US", {
    month: "short",
  });

  const currentMonthData = monthlyStats.find(
    (month) => month.month === currentMonth
  );

  const speciesEntries = currentMonthData
    ? Object.entries(currentMonthData.species)
    : [];

  const mostCaught = speciesEntries.reduce<
    [string, number] | null
  >((highest, current) => {
    if (!highest || current[1] > highest[1]) {
      return current;
    }

    return highest;
  }, null);

  if (!mostCaught) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Most Caught
            {"\n"}
            This Month
          </Text>

          <View style={styles.iconBadge}>
            <Text style={styles.icon}>🐟</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🐟</Text>

          <Text style={styles.emptyTitle}>
            No catches yet
          </Text>
        </View>
      </View>
    );
  }

  const [species, count] = mostCaught;

  const speciesImage = SPECIES_IMAGES[species];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Most Caught
          {"\n"}
          This Month
        </Text>

        <View style={styles.iconBadge}>
          <Text style={styles.icon}>🐟</Text>
        </View>
      </View>

      {/* Fish image */}
      <View style={styles.imageContainer}>
        {speciesImage ? (
          <Image
            source={speciesImage}
            style={styles.speciesImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.placeholderIcon}>
            🐟
          </Text>
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

      <Text style={styles.speciesName}>
        {species}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 204,
    backgroundColor: "#03141d",
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: "#073d37",
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    color: "#e5eaed",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },

  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#043329",
    borderWidth: 1,
    borderColor: "#0b624d",
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

  speciesImage: {
    width: "100%",
    height: "100%",
  },

  placeholderIcon: {
    fontSize: 42,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 1,
  },

  count: {
    color: "#27e889",
    fontSize: 23,
    fontWeight: "800",
  },

  catchLabel: {
    color: "#a8b2b8",
    fontSize: 11,
    marginLeft: 5,
  },

  speciesName: {
    color: "#8e9aa1",
    fontSize: 11,
    textAlign: "center",
    marginTop: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    fontSize: 34,
  },

  emptyTitle: {
    color: "#ffffff",
    fontSize: 13,
    marginTop: 5,
  },
});