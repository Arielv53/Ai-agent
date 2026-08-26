import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function WelcomeBanner() {
  const [displayedGreeting, setDisplayedGreeting] = useState("");

  const username = "Ariel";

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  };

  const greeting = getGreeting();

  useEffect(() => {
    let i = 0;

    setDisplayedGreeting("");

    const interval = setInterval(() => {
      i++;

      setDisplayedGreeting(greeting.slice(0, i));

      if (i >= greeting.length) {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [greeting]);

  return (
    <ImageBackground
      source={require("../../../../assets/stats/stats-banner.jpg")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <LinearGradient
        colors={[
          "rgba(2, 13, 22, 0.98)",
          "rgba(2, 13, 22, 0.94)",
          "rgba(2, 13, 22, 0.52)",
          "rgba(2, 13, 22, 0)",
        ]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.overlay}
      >
        <View>
          <Text style={styles.greeting}>
            {displayedGreeting}
          </Text>

          <Text style={styles.username}>
            {username} 👋
          </Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 78,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#0a3148",
    backgroundColor: "#071722",
  },

  backgroundImage: {
    resizeMode: "cover",
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  greeting: {
    color: "#c4ccd3",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 1,
  },

  username: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});