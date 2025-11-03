import { API_BASE } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons"; // ✅ NEW: icons for likes/comments placeholders
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PublicCatch {
  id: number;
  species: string;
  image_url: string;
  user_name: string;
  timestamp: string;
  location?: string;
  user_avatar?: string; // ✅ NEW: optional avatar field
}

export default function Newsfeed() {
  const [catches, setCatches] = useState<PublicCatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicCatches = async () => {
      try {
        const response = await fetch(`${API_BASE}/public-catches`);
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
      <Text style={styles.title}>Explore</Text>

      {catches.length === 0 ? (
        <Text style={styles.emptyText}>No public catches yet.</Text>
      ) : (
        <FlatList
          data={catches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              {/* 🧑‍🎣 NEW: User header section */}
              <View style={styles.headerRow}>
                <Image
                  source={{
                    uri:
                      item.user_avatar ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png", // placeholder avatar
                  }}
                  style={styles.avatar}
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.userName}>
                    {item.user_name || "Anonymous"}
                  </Text>
                  <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* 🐟 Image section */}
              <Image source={{ uri: item.image_url }} style={styles.postImage} />

              {/* 📄 Catch info section */}
              <View style={styles.captionContainer}>
                <Text style={styles.speciesText}>{item.species}</Text>
                <Text style={styles.captionText}>
                  {item.location ? `Caught near ${item.location}` : ""}
                </Text>
              </View>

              {/* ❤️💬 NEW: Action row (like/comment placeholders) */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="heart-outline" size={20} color="#333" />
                  <Text style={styles.actionText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#333" />
                  <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    backgroundColor: "#080808ff", // ✅ NEW: softer background for feed
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "left",
    padding: 16,
    color: "#faf6f6ff",
  },
  postCard: {
    backgroundColor: "#262626a1",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  userName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#f0f0f0ff",
  },
  timestamp: {
    color: "#999",
    fontSize: 11,
  },
  postImage: {
    width: "100%",
    height: 300,
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  speciesText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#f9f8f8ff",
  },
  captionText: {
    color: "#cccbcbff",
    fontSize: 13,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#5c5b5bff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#fdfcfcff",
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
