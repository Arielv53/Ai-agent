import React, { useCallback } from "react";
import { ActivityIndicator, Animated, RefreshControl, Text, TouchableOpacity } from "react-native";
import { PublicCatch } from "../types";
import FeedPostCard from "./FeedPostCard";

interface Props {
  catches: PublicCatch[];
  scrollY: Animated.Value;
  onLikeToggle: (id: number) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  loadingMore: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function FeedList({ catches, scrollY, onLikeToggle, refreshing, onRefresh, onLoadMore, loadingMore, error, onRetry }: Props) {
  const renderItem = useCallback(({ item }: { item: PublicCatch }) => (
    <FeedPostCard post={item} onLikeToggle={onLikeToggle} />
  ), [onLikeToggle]);
  return (
    <Animated.FlatList
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      data={catches}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={7}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={error ? (
        <TouchableOpacity onPress={onRetry} accessibilityRole="button" style={{ padding: 16 }}>
          <Text style={{ color: "#ffb4ab", textAlign: "center" }}>{error}</Text>
        </TouchableOpacity>
      ) : loadingMore ? <ActivityIndicator color="#00c8ff" style={{ padding: 16 }} /> : null}
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00c8ff"
            colors={["#00c8ff"]}
            progressBackgroundColor="#020d16"
        />
     }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    />
  );
}
