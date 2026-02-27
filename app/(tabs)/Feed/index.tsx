import { API_BASE } from "@/constants/config";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import FeedFab from "./components/FeedFab";
import FeedList from "./components/FeedList";
import FeedLoader from "./components/FeedLoader";
import FeedTopBar from "./components/FeedTopBar/FeedTopBar";

export interface PublicCatch {
  id: number;
  species: string;
  image_url: string;
  date_caught: string;
  location?: string;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  like_count?: number;
  comment_count?: number;
  liked?: boolean;
}

export default function FeedHome() {
  const [catches, setCatches] = useState<PublicCatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchPublicCatches = async () => {
    try {
      const res = await fetch(`${API_BASE}/public-catches`);
      const data = await res.json();
      setCatches(
        data.map((item: PublicCatch) => ({
          ...item,
          liked: false,
        })),
      );
    } catch (err) {
      console.error("Error fetching public catches:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPublicCatches();
      setLoading(false);
    };

    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPublicCatches();
    setRefreshing(false);
  };

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
          : item,
      ),
    );

    try {
      const target = catches.find((c) => c.id === catchId);
      await fetch(
        `${API_BASE}/catches/${catchId}/${target?.liked ? "unlike" : "like"}`,
        {
          method: target?.liked ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1 }),
        },
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  if (loading) return <FeedLoader />;

  return (
    <View style={styles.container}>
      <FeedTopBar userId={1} />

      <FeedList
        catches={catches}
        scrollY={scrollY}
        onLikeToggle={handleLikeToggle}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <FeedFab scrollY={scrollY} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020d16",
  },
});
