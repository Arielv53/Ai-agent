import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NewsfeedScreen() {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicCatches = async () => {
      try {
        const response = await fetch("http://YOUR_SERVER_URL/api/public-catches");
        const data = await response.json();
        setCatches(data);
      } catch (error) {
        console.error("Error fetching public catches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0077b6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Catches</Text>

      {catches.length === 0 ? (
        <Text style={styles.emptyText}>No public catches yet.</Text>
      ) : (
        <FlatList
          data={catches}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text style={styles.speciesText}>{item.species}</Text>
              <Text style={styles.userText}>by {item.user_name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    width: "48%",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 12,
  },
  speciesText: {
    fontWeight: "500",
    marginTop: 6,
  },
  userText: {
    color: "#888",
    fontSize: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    fontStyle: "italic",
    marginTop: 20,
  },
});
