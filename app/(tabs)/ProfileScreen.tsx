import React from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from "react-native";


const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 48) / 2; // two columns, with padding

// Temporary mock data (replace with your real catch data)
const mockFishData = [
  { id: "1", uri: "https://placekitten.com/400/400" },
  { id: "2", uri: "https://placekitten.com/401/401" },
  { id: "3", uri: "https://placekitten.com/402/402" },
  { id: "4", uri: "https://placekitten.com/403/403" },
];

export default function ProfileScreen() {
  const userName = "Ariel Vargas"; // later replace with dynamic user name

  return (
    <View style={styles.container}>
      {/* User Name */}
      <Text style={styles.header}>{userName}</Text>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Your Catches</Text>

      {/* Grid of Fish Photos */}
      <FlatList
        data={mockFishData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.image} />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Analytics Placeholder */}
      <View style={styles.analyticsContainer}>
        <Text style={styles.analyticsTitle}>Your Fishing Stats</Text>
        <Text>Total Catches: {userStats.total}</Text>
        <Text>Most Common Species: {userStats.topSpecies}</Text>
        <Text>Average Size: {userStats.avgSize} in</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 24,
    marginBottom: 12,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    marginBottom: 12,
  },
  analyticsContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f4f4f4",
  },
  analyticsTitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
});
