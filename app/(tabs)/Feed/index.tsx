import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import React, { useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import FeedFab from "./components/FeedFab";
import FeedList from "./components/FeedList";
import FeedLoader from "./components/FeedLoader";
import FeedTopBar from "./components/FeedTopBar/FeedTopBar";
import { useFeed } from "./_hooks/useFeed";
export type { PublicCatch } from "./types";

export default function FeedHome() {
  const { token, loading } = useAuth();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  if (loading) return <FeedLoader />;
  return <FeedSession key={`${token ?? "guest"}:${refresh ?? ""}`} token={token} />;
}

function FeedSession({ token }: { token: string | null }) {
  const feed = useFeed(token);
  const scrollY = useRef(new Animated.Value(0)).current;
  if (feed.loading && !feed.catches.length) return <FeedLoader />;
  return (
    <View style={styles.container}>
      <FeedTopBar />
      <FeedList
        catches={feed.catches}
        scrollY={scrollY}
        onLikeToggle={feed.onLikeToggle}
        refreshing={feed.refreshing}
        onRefresh={feed.onRefresh}
        onLoadMore={feed.onLoadMore}
        loadingMore={feed.loadingMore}
        error={feed.error}
        onRetry={feed.retry}
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
