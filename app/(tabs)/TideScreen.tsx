import { API_BASE } from "@/constants/config";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

interface Tide {
  id: number;
  station_id: string;
  datetime: string;
  height: number;
  tide_type: string;
}

export default function TidesScreen() {
  const [tides, setTides] = useState<Tide[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcode a station_id for now until we add selection
  const stationId = "8518750"; // example, replace with one from your DB

  useEffect(() => {
    fetch(`${API_BASE}/tides/${stationId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Tide API response:", data);
        setTides(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching tides:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading tides...</Text>
      </View>
    );
  }

  const formatTideTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tide Predictions</Text>
      <FlatList
        data={tides}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.time}>{formatTideTime(item.datetime)}</Text>
            <Text style={styles.height}>
              {item.height.toFixed(2)} ft ({item.tide_type === "H" ? "High" : "Low"})
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  time: {
    fontSize: 14,
  },
  height: {
    fontSize: 14,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
