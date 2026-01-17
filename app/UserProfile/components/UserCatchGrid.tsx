import { API_BASE } from "@/constants/config";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Catch = {
  id: number;
  image_url: string;
};

type Props = {
  userId: number;
  username: string;
};

const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 48) / 3; // 3 columns

export default function UserCatchGrid({ userId, username }: Props) {
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatches = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${userId}/catches`);
        const data = await res.json();
        setCatches(data);
      } catch (err) {
        console.error("Failed to load user catches", err);
      } finally {
        setLoading(false);
      }
    };

    loadCatches();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (catches.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          {username} hasn’t posted a catch yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <FlatList
      data={catches}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#111827", // nice skeleton bg
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  loading: {
    marginTop: 24,
  },
  emptyState: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#e8e6e6",
    marginTop: 25,
  },
});