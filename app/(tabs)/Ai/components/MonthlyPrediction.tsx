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
    backgroundColor: "#020d16ff", 
    borderRadius: 20,         
    padding: 15,                
    marginHorizontal: 16,
    marginTop: 23,
    marginBottom: 20,
    borderWidth: .5,       
    borderColor: "#00c8ff6f", 
  },
  sectionTitle: {
    fontSize: 17,          
    fontWeight: "700",
    marginBottom: 5,
    color: "#c5effcd9",      
    letterSpacing: 0.5,
    marginLeft: 4,
  //  fontFamily: "Inter-Regular",
  },
  insightBox: {
    marginTop: 12,
    backgroundColor: "#062336a1", 
    padding: 14,                
    borderRadius: 12,           
    borderWidth: 1,             
    borderColor: "#00c8ff6f", 
  },
  text: {
    color: "#9ee7ff",
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0.4,
  //  fontFamily: "Inter-Regular",
  },
});
