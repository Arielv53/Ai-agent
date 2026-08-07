import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const COLORS = {
  "Striped Bass": "#ff4f81",
  Bluefish: "#29b6f6",
  Fluke: "#ff9800",
  Other: "#8a8a8a",
};

type MonthlyData = {
  month: string;
  species: {
    [key: string]: number;
  };
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
    console.log("API_BASE:", API_BASE);
    console.log(
    "Calling:",
    `${API_BASE}/stats/monthly-statistics`
    );
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

    console.log("MONTHLY STATS RAW RESPONSE:", raw);

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

    console.log("Stats:", stats);
    console.log("Chart Data:", chartData);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Catches by Month</Text>
      console.log("chartData:", chartData);

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