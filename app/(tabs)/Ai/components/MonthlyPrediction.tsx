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
    if (!forecast) {
      setDisplayed("");
      return;
    }

    const text = forecast;
    let i = 0;

    setDisplayed("");

    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));

      if (i >= text.length) clearInterval(interval);
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [forecast, typingSpeed]);


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
        <View style={styles.insightBox}>
          <Text style={styles.text}>{displayed}</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#031523", // UPDATED – dark card background
    borderRadius: 20,           // UPDATED – more rounded like example
    padding: 15,                // UPDATED
    marginHorizontal: 16,
    marginTop: 40,
    marginBottom: 20,
    borderWidth: 1,             // NEW – glowing border
    borderColor: "rgba(0, 200, 255, 0.1)", // NEW
    shadowColor: "#00c8ff",     // NEW – neon glow shadow
    shadowOpacity: 0.3,         // NEW
    shadowRadius: 20,           // NEW
    shadowOffset: { height: 0, width: 0 },
  },
  sectionTitle: {
    fontSize: 17,               // UPDATED
    fontWeight: "700",
    marginBottom: 8,
    color: "#9ee7ff",           // NEW – light text
    letterSpacing: 0.5,
    marginLeft: 4,
  //  fontFamily: "Inter-Regular",
  },
  insightBox: {
    marginTop: 12,
    backgroundColor: "#062336", // NEW – styled like species buttons
    padding: 14,                // NEW
    borderRadius: 12,           // NEW
    borderWidth: 1,             // NEW
    borderColor: "rgba(0, 200, 255, 0.25)", // NEW
  },
  text: {
    color: "#d7f8ff",
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.4,
  //  fontFamily: "Inter-Regular",
  },
});
