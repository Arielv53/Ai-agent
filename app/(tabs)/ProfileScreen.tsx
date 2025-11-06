import { API_BASE } from "@/constants/config";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";

const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 48) / 3; // ✅ 3 columns instead of 2

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [catches, setCatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = 1; // TODO: replace with logged-in user ID (from context/auth)
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/users/${userId}/profile`);
        const profileData = await profileRes.json();
        setUser(profileData);

        const catchesRes = await fetch(`${API_BASE}/users/${userId}/catches`);
        const catchesData = await catchesRes.json();
        setCatches(catchesData);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f5b20b" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "#fff" }}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🆕 Cover Photo Section */}
      <View style={styles.coverContainer}>
        <Image
          source={{
            uri: user.cover_photo || "https://placekitten.com/800/400",
          }}
          style={styles.coverPhoto}
        />
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: user.profile_photo || "https://placekitten.com/300/300",
            }}
            style={styles.profilePhoto}
          />
        </View>
      </View>

      {/* 🆕 User Info */}
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.username}>@{user.username}</Text>

      {/* 🆕 Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.catches}</Text>
          <Text style={styles.statLabel}>Catches</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* 🆕 Catch Grid */}
      <FlatList
        data={catches}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0b", // 🆕 dark modern theme
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    justifyContent: "center",
    alignItems: "center",
  },
  coverContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
  },
  profileImageContainer: {
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "#464545ff",
    borderRadius: 100,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
    marginTop: 60,
  },
  username: {
    textAlign: "center",
    color: "#9a9a9a",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  statLabel: {
    color: "#aaa",
    fontSize: 13,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 6,
    marginBottom: 8,
  },
});
