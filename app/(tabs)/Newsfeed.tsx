import { API_BASE } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons"; // ✅ NEW: icons for likes/comments placeholders
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
  user_avatar?: string; 
  like_count?: number; 
  comment_count?: number; 
  liked?: boolean;
}

export default function Newsfeed() {
  const [catches, setCatches] = useState<PublicCatch[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchPublicCatches = async () => {
      try {
        const response = await fetch(`${API_BASE}/public-catches`);
        const data = await response.json();
        const initialized = data.map((item: PublicCatch) => ({
          ...item,
          liked: false,
        }));
        setCatches(initialized);
      } catch (error) {
        console.error("Error fetching public catches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicCatches();
  }, []);

  // 🆕 Handles liking/unliking with optimistic UI update
  const handleLikeToggle = async (catchId: number) => {
    setCatches((prev) =>
      prev.map((item) =>
        item.id === catchId
          ? {
              ...item,
              liked: !item.liked,
              like_count: item.liked
                ? (item.like_count || 1) - 1
                : (item.like_count || 0) + 1,
            }
          : item
      )
    );

    try {
      const target = catches.find((c) => c.id === catchId);
      const userId = 1; // ⚠️ Replace this with logged-in user's ID later

      await fetch(`${API_BASE}/catches/${catchId}/${target?.liked ? "unlike" : "like"}`, {
        method: target?.liked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0077b6" />
      </View>
    );
  }

  const fabOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0.4, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => console.log("Search pressed")} style={styles.iconButton}>
          <Ionicons name="search-outline" size={26} color="#fff" /> 
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("Notifications pressed")} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={26} color="#fff" /> 
        </TouchableOpacity>
      </View>

      {catches.length === 0 ? (
        <Text style={styles.emptyText}>No public catches yet.</Text>
      ) : (
        <Animated.FlatList
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
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLikeToggle(item.id)}
                >
                  <Ionicons
                    name={item.liked ? "heart" : "heart-outline"}
                    size={20}
                    color={item.liked ? "#ff4b5c" : "#868585ff"}
                  />
                  <Text style={styles.actionText}>
                    {item.like_count || 0} Likes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#868585ff" />
                  <Text style={styles.actionText}>
                    {item.comment_count || 0} Comments
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      )}

      {/* Floating + button in bottom-right, like Twitter */}
      <Animated.View style={[styles.fabContainer, { opacity: fabOpacity }] }>
        <TouchableOpacity
          onPress={() => router.push("/addCatch")}
          style={styles.fab}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#22292bff", // ✅ NEW: softer background for feed
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between", // one left, one right
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: "#000", // 🖤 gives it a sleek header look
  },
  iconButton: {
    padding: 6,
  },
  postCard: {
    backgroundColor: "#141414ff",
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
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "#fff",
  },
});
