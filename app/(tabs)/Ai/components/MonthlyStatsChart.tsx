import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

type MonthlyData = {
  month: string;
  species: {
    [key: string]: number;
  };
};

// Temporary data until backend is finished
const mockData: MonthlyData[] = [
  { month: "J", species: { "Striped Bass": 2, Bluefish: 5, Fluke: 1 } },
  { month: "F", species: { "Striped Bass": 1, Bluefish: 2 } },
  { month: "M", species: { "Striped Bass": 4, Fluke: 2 } },
  { month: "A", species: { "Striped Bass": 8, Bluefish: 4 } },
  { month: "M", species: { "Striped Bass": 10, Bluefish: 7, Fluke: 3 } },
  { month: "J", species: { "Striped Bass": 12, Bluefish: 8, Fluke: 2 } },
  { month: "J", species: { "Striped Bass": 9, Bluefish: 6 } },
  { month: "A", species: { "Striped Bass": 11, Bluefish: 9, Fluke: 2 } },
  { month: "S", species: { "Striped Bass": 10, Bluefish: 5, Fluke: 1 } },
  { month: "O", species: { "Striped Bass": 8, Bluefish: 7, Fluke: 3 } },
  { month: "N", species: { "Striped Bass": 5, Bluefish: 2 } },
  { month: "D", species: { "Striped Bass": 3, Bluefish: 2 } },
];

const COLORS = {
  "Striped Bass": "#ff4f81",
  Bluefish: "#29b6f6",
  Fluke: "#ff9800",
  Other: "#8a8a8a",
};

export default function MonthlyStatsChart() {
  const [stats] = useState(mockData);

  const chartData = useMemo(() => {
    return stats.map((month) => ({
      stacks: [
        {
          value: month.species["Bluefish"] || 0,
          color: COLORS.Bluefish,
        },
        {
          value: month.species["Striped Bass"] || 0,
          color: COLORS["Striped Bass"],
        },
        {
          value: month.species["Fluke"] || 0,
          color: COLORS.Fluke,
        },
      ],
      label: month.month,
    }));
  }, [stats]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Catches by Month</Text>

      <BarChart
        data={chartData}
        barWidth={22}
        spacing={18}
        xAxisColor="#2b3b48"
        yAxisColor="#2b3b48"
        noOfSections={4}
        maxValue={25}
        yAxisTextStyle={{ color: "#9ee7ff" }}
        xAxisLabelTextStyle={{ color: "#9ee7ff" }}
        rulesColor="#31414d"
        rulesType="dashed"
        isAnimated
      />

      <View style={styles.legend}>
        <Legend color={COLORS.Bluefish} label="Bluefish" />
        <Legend color={COLORS["Striped Bass"]} label="Striped Bass" />
        <Legend color={COLORS.Fluke} label="Fluke" />
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