import { API_BASE } from "@/constants/config";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function MonthlyPrediction() {
  const [forecast, setForecast] = useState("");
  const [displayed, setDisplayed] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = 1;

  const typingSpeed = 20;

  async function getMonthlyForecast(userId: number) {
    try {
      const response = await fetch(`${API_BASE}/ai/monthly_forecast?user_id=${userId}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Forecast API Error:", response.status, errorText);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching monthly forecast:", error);
      return null;
    }
  }

  // Fetch forecast on load
  useEffect(() => {
    (async () => {
      setLoading(true);

      const result = await getMonthlyForecast(userId);  // <-- Now calling the fetch function here

      const text = result?.forecast_text || "No prediction available.";
      setForecast(text);
      setDisplayed(""); // reset typing animation
      setLoading(false);
    })();
  }, [userId]);
  

  // typewriter animation
  useEffect(() => {
    if (!forecast) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < forecast.length) {
        setDisplayed((prev) => prev + forecast.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [forecast]);

  if (loading) {
    return (
      <View style={styles.cardWrapper}>
        <Text style={styles.sectionTitle}>Monthly Predictions</Text>
        <ActivityIndicator color="#9ee7ff" />
      </View>
    );
  }

  return (
    <View style={styles.cardWrapper}>
      <Text style={styles.sectionTitle}>Monthly Prediction</Text>
        <Text style={styles.text}>{displayed}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#031523", // UPDATED – dark card background
    borderRadius: 20,           // UPDATED – more rounded like example
    padding: 20,                // UPDATED
    marginHorizontal: 16,
    marginTop: 30,
    borderWidth: 1,             // NEW – glowing border
    borderColor: "rgba(0, 200, 255, 0.25)", // NEW
    shadowColor: "#00c8ff",     // NEW – neon glow shadow
    shadowOpacity: 0.3,         // NEW
    shadowRadius: 20,           // NEW
    shadowOffset: { height: 0, width: 0 },
  },
  sectionTitle: {
    fontSize: 20,               // UPDATED
    fontWeight: "700",
    marginBottom: 12,
    color: "#e6faff",           // NEW – light text
    letterSpacing: 0.5,
  //  fontFamily: "Inter-Regular",
  },
  text: {
    color: "#d7f8ff",
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.4,
  //  fontFamily: "Inter-Regular",
  },
});
