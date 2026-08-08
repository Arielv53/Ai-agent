import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get("window").width;

// Base colors used for the user's top 3 species
const SPECIES_COLORS = [
  "#ff4f81",
  "#29b6f6",
  "#ff9800",
];

const OTHER_COLOR = "#8a8a8a";

type MonthlyData = {
  month: string;
  species: {
    [key: string]: number;
  };
};

type StackData = {
  label: string;
  stacks: {
    value: number;
    color: string;
  }[];
};

export default function MonthlyStatsChart() {
    const [stats, setStats] = useState<MonthlyData[]>([]);
    const { user } = useAuth();

  // UPDATED
useEffect(() => {
  if (user) {
    fetchMonthlyStats();
  }
}, [user]);

const fetchMonthlyStats = async () => {
  if (!user) return;

  try {
    const res = await fetch(`${API_BASE}/stats/monthly-statistics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
      }),
    });

    // NEW - inspect raw response
    const raw = await res.text();

    const data = JSON.parse(raw);

    if (Array.isArray(data)) {
      setStats(data);
    } else {
      console.error("Expected array:", data);
      setStats([]);
    }

  } catch (err) {
    console.error("Monthly stats error:", err);
  }
};

  // NEW: Calculate the user's top 3 species and assign each a color
const speciesColorMap = useMemo(() => {
  const speciesCounts: Record<string, number> = {};

  stats.forEach((month) => {
    Object.entries(month.species).forEach(([species, count]) => {
      speciesCounts[species] =
        (speciesCounts[species] || 0) + count;
    });
  });

  const topSpecies = Object.entries(speciesCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3)
    .map(([species]) => species);

  const colorMap: Record<string, string> = {};

  topSpecies.forEach((species, index) => {
    colorMap[species] = SPECIES_COLORS[index];
  });

  return {
    topSpecies,
    colorMap,
  };
}, [stats]);

  const stackData = useMemo<StackData[]>(() => {
  const { topSpecies, colorMap } = speciesColorMap;

  return stats.map((month) => {
    const topStacks = topSpecies
      .map((species) => {
        const count = month.species[species] || 0;

        if (count === 0) return null;

        return {
          value: count,
          color: colorMap[species],
        };
      })
      .filter((stack): stack is { value: number; color: string } =>
      stack !== null);

    // Everything outside the top 3 goes into Other
    const otherCount = Object.entries(month.species)
      .filter(([species]) => !topSpecies.includes(species))
      .reduce((sum, [, count]) => sum + count, 0);

    if (otherCount > 0) {
      topStacks.push({
        value: otherCount,
        color: OTHER_COLOR,
      });
    }

    return {
      label: month.month,
      stacks:
        topStacks.length > 0
          ? topStacks
          : [
              {
                value: 0,
                color: "transparent",
              },
            ],
    };
  });
}, [stats]);

// NEW: Build legend from the same top 3/color mapping used by the chart
const legendData = useMemo(() => {
  return [
    ...speciesColorMap.topSpecies.map((species) => ({
      label: species,
      color: speciesColorMap.colorMap[species],
    })),
    {
      label: "Other",
      color: OTHER_COLOR,
    },
  ];
}, [speciesColorMap]);

  // NEW: Calculate the largest monthly catch total
const chartMaxValue = useMemo(() => {
  const monthlyTotals = stats.map((month) =>
    Object.values(month.species).reduce(
      (total, count) => total + count,
      0
    )
  );

  const max = Math.max(...monthlyTotals, 0);

  // Give the chart some headroom above the largest bar
  if (max <= 3) return 4;
  if (max <= 5) return 8;
  if (max <= 10) return 12;
  if (max <= 20) return 20;

  return Math.ceil(max / 4) * 4; // Round up to the nearest multiple of 4
}, [stats]);
    

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Catches by Month</Text>

      <BarChart
        stackData={stackData}
        width={screenWidth - 100}
        barWidth={18}
        spacing={10}
        maxValue={chartMaxValue}
        xAxisColor="#2b3b48"
        yAxisColor="#2b3b48"
        noOfSections={4}
        yAxisTextStyle={{ color: "#9ee7ff" }}
        xAxisLabelTextStyle={{
          color: "#9ee7ff",
          fontSize: 11,
        }}
        rulesColor="#31414d"
        rulesType="dashed"
        isAnimated
      />

      <View style={styles.legend}>
        {legendData.map((item) => (
          <Legend
            key={item.label}
            color={item.color}
            label={item.label}
          />
        ))}
      </View>
    </View>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: color,
          },
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#020d16",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: "#00c8ff7d",
  },

  title: {
    color: "#ffffffbc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 25,
  },

  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 6,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  legendText: {
    color: "white",
    fontSize: 14,
  },
});