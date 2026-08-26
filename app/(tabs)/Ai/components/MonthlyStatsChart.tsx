import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
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
    const [selectedPeriod, setSelectedPeriod] = useState("This Year");
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);
    const { user } = useAuth();

    const periods = [
      "This Year",
      "Last Year",
      "All Time",
    ];

  // UPDATED
useEffect(() => {
  if (user) {
    fetchMonthlyStats();
  }
}, [user, selectedPeriod]);

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
        period:
          selectedPeriod === "This Year"
            ? "this_year"
            : selectedPeriod === "Last Year"
            ? "last_year"
            : "all_time",
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
// Build legend from the same top 3/color mapping used by the chart.
// Also calculate the total catches for each legend category.
const legendData = useMemo(() => {
  const { topSpecies, colorMap } = speciesColorMap;

  const topLegend = topSpecies.map((species) => {
    const total = stats.reduce((sum, month) => {
      return sum + (month.species[species] || 0);
    }, 0);

    return {
      label: species,
      color: colorMap[species],
      count: total,
    };
  });

  const otherCount = stats.reduce((total, month) => {
    return (
      total +
      Object.entries(month.species)
        .filter(([species]) => !topSpecies.includes(species))
        .reduce((sum, [, count]) => sum + count, 0)
    );
  }, 0);

  return [
    ...topLegend,
    {
      label: "Other",
      color: OTHER_COLOR,
      count: otherCount,
    },
  ];
}, [speciesColorMap, stats]);

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
      <View style={styles.chartHeader}>
  <Text style={styles.title}>
    Catches by Month
  </Text>

  <View>
    <Pressable
      style={styles.periodButton}
      onPress={() =>
        setShowPeriodMenu((visible) => !visible)
      }
    >
      <Text style={styles.periodText}>
        {selectedPeriod}
      </Text>

      <Text style={styles.chevron}>
        {showPeriodMenu ? "⌃" : "⌄"}
      </Text>
    </Pressable>

    {showPeriodMenu && (
      <View style={styles.periodMenu}>
        {periods.map((period) => (
          <Pressable
            key={period}
            style={[
              styles.periodOption,
              selectedPeriod === period &&
                styles.selectedPeriodOption,
            ]}
            onPress={() => {
              setSelectedPeriod(period);
              setShowPeriodMenu(false);
            }}
          >
            <Text
              style={[
                styles.periodOptionText,
                selectedPeriod === period &&
                  styles.selectedPeriodText,
              ]}
            >
              {period}
            </Text>
          </Pressable>
        ))}
      </View>
    )}
  </View>
</View>

      <BarChart
        stackData={stackData}
        width={screenWidth - 100}
        barWidth={15}
        spacing={10}
        maxValue={chartMaxValue}
        xAxisColor="#2b3b48"
        yAxisColor="#2b3b48"
        noOfSections={4}
        yAxisTextStyle={{ color: "#9ee7ff", fontSize: 11  }}
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
            count={item.count}
          />
        ))}
      </View>
    </View>
  );
}

function Legend({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={styles.legendHeader}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: color,
            },
          ]}
        />

        <Text
          style={styles.legendText}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>

      <Text style={styles.legendCount}>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#020d16",
    borderRadius: 15,
    padding: 13,
    marginHorizontal: 16,
    borderWidth: .5,
    borderColor: "#00c8ff57",
    overflow: "visible",
  },

  title: {
    color: "#ffffffbc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  legend: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#071923",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#122c39",
  paddingVertical: 4,
  paddingHorizontal: 3,
  marginTop: 11,
},

legendItem: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},

legendHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  maxWidth: "100%",
},

dot: {
  width: 7,
  height: 7,
  borderRadius: 4,
  marginRight: 4,
},

legendText: {
  color: "#b9c3c9",
  fontSize: 8,
  fontWeight: "600",
},

legendCount: {
  color: "#ffffff",
  fontSize: 10,
  fontWeight: "700",
  marginTop: 3,
},
chartHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
},

periodButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 82,
  height: 30,
  paddingHorizontal: 9,
  borderRadius: 8,
  backgroundColor: "#071923",
  borderWidth: 1,
  borderColor: "#173441",
},

periodText: {
  color: "#aebbc2",
  fontSize: 10,
  fontWeight: "600",
},

chevron: {
  color: "#71838d",
  fontSize: 13,
  marginLeft: 5,
  marginTop: -2,
},

periodMenu: {
  position: "absolute",
  top: 34,
  right: 0,
  width: 105,
  backgroundColor: "#071923",
  borderRadius: 9,
  borderWidth: 1,
  borderColor: "#173441",
  paddingVertical: 4,
  zIndex: 100,
  elevation: 5,
},

periodOption: {
  paddingVertical: 8,
  paddingHorizontal: 10,
},

selectedPeriodOption: {
  backgroundColor: "#0b2734",
},

periodOptionText: {
  color: "#8d9ca4",
  fontSize: 10,
},

selectedPeriodText: {
  color: "#ffffff",
  fontWeight: "600",
},
});