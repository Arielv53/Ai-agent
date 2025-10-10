import { API_BASE } from "@/constants/config";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Catch {
  id: number;
  image_url: string;
  species: string;
  date_caught: string;
  water_temp: number;
  air_temp: number;
  moon_phase: string;
  tide: string;
  size: string;
  bait_used: string;
}

interface CatchDetailsProps {
  catchId: number;
  onClose: () => void;
}

export default function CatchDetails({ catchId, onClose }: CatchDetailsProps) {
  const [catchData, setCatchData] = useState<Catch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCatch = async () => {
      try {
        const res = await fetch(`${API_BASE}/catches/${catchId}`);
        if (!res.ok) throw new Error("Failed to load catch");
        const data = await res.json();
        setCatchData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatch();
  }, [catchId]);

  if (loading) return <ActivityIndicator size="large" color="orange" />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!catchData) return <Text>No data found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{catchData.species}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
  <TouchableOpacity onPress={onClose}>
    <Text style={{ color: "white", fontSize: 18 }}>←</Text>
  </TouchableOpacity>
  <Text style={{ flex: 1, textAlign: "center", fontSize: 22, fontWeight: "bold" }}>
    Catch Details
  </Text>
</View>


      {catchData.image_url ? (
        <Image
          source={{ uri: catchData.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.detailsBox}>
        <View style={styles.detailItem}>
            <Text style={styles.label}>Species:</Text>
            <Text style={styles.value}>{catchData.species}</Text>
        </View>

        <View style={styles.detailItem}>
            <Text style={styles.label}>Size:</Text>
            <Text style={styles.value}>{catchData.size}</Text>
        </View>

        <View style={styles.detailItem}>
            <Text style={styles.label}>Bait Used:</Text>
            <Text style={styles.value}>{catchData.bait_used}</Text>
        </View>

        <View style={styles.detailItem}>
            <Text style={styles.label}>Tide:</Text>
            <Text style={styles.value}>{catchData.tide}</Text>
        </View>

        <View style={styles.detailItem}>
            <Text style={styles.label}>Moon Phase:</Text>
            <Text style={styles.value}>{catchData.moon_phase}</Text>
        </View>

        <View style={styles.detailItem}>
            <Text style={styles.label}>Date Caught:</Text>
            <Text style={styles.value}>{new Date(catchData.date_caught).toLocaleDateString()}</Text>
        </View>

        <View style={styles.detailItem}>
            <Text style={styles.label}>🌡️ Water Temp:</Text>
            <Text style={styles.value}>{catchData.water_temp ? `${catchData.water_temp}°F` : "N/A"}</Text>
        </View>
      
        <View style={styles.detailItem}>
            <Text style={styles.label}>☀️ Air Temp:</Text>
            <Text style={styles.value}>{catchData.air_temp ? `${catchData.air_temp}°F` : "N/A"}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  image: { width: "100%", height: 250, borderRadius: 10, marginBottom: 16 },
  
  // Wraps all detail rows
  detailsBox: {
    flexDirection: "row",          // side-by-side columns
    flexWrap: "wrap",              // allows wrapping to next line
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },

  // Each label/value pair
  detailItem: {
    width: "48%",                  // two columns per row
    marginBottom: 12,
  },

  label: { fontWeight: "600", color: "white", letterSpacing: 0.5 },
  value: { color: "white" },

  error: { color: "red", textAlign: "center" },
});

