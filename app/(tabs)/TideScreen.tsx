import { API_BASE } from "@/constants/config";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

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
  const [stationId, setStationId] = useState("8518750"); // default station

  const stations = [
    { id: "8518750", name: "New York, The Battery" },
    { id: "8454000", name: "Bridgeport, CT" },
    { id: "8720218", name: "Mayport, FL" },
    { id: "9414290", name: "San Francisco, CA" },
    { id: "9447130", name: "Seattle, WA" },
  ];

  const fetchTides = async (station: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tides/${station}`);
      const data = await res.json();
      console.log("Tide API response:", data);
      setTides(data);
    } catch (err) {
      console.error("Error fetching tides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTides(stationId);
  }, [stationId]);

  const formatTideTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  };

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const todayTides = tides.filter((t) => t.datetime.startsWith(today));

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      marginBottom: 12,
      overflow: "hidden",
    },
    picker: { height: 50, width: "100%" },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: "#eee",
    },
    time: { fontSize: 14 },
    height: { fontSize: 14, fontWeight: "600" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tides</Text>

      {/* Station Picker */}
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={stationId}
          onValueChange={(value) => setStationId(value)}
          style={styles.picker}
        >
          {stations.map((s) => (
            <Picker.Item key={s.id} label={s.name} value={s.id} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Loading tides...</Text>
        </View>
      ) : (
        <>
          {todayTides.length > 0 && (
            <LineChart
              data={{
                labels: todayTides.map((t) =>
                  new Date(t.datetime).toLocaleTimeString([], { hour: "numeric" })
                ),
                datasets: [{ data: todayTides.map((t) => t.height) }],
              }}
              width={Dimensions.get("window").width - 32}
              height={220}
              yAxisSuffix="ft"
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#f3f3f3",
                backgroundGradientTo: "#e6e6e6",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: "#1e90ff" },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          )}

          <FlatList
            data={tides}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.time}>{formatTideTime(item.datetime)}</Text>
                <Text style={styles.height}>
                  {item.height.toFixed(2)} ft ({item.tide_type === "H" ? "High" : "Low"})
                </Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};
