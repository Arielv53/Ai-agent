import React from "react";
import { Animated, RefreshControl } from "react-native";
import { PublicCatch } from "../index";
import FeedPostCard from "./FeedPostCard";

interface Props {
  catches: PublicCatch[];
  scrollY: Animated.Value;
  onLikeToggle: (id: number) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function FeedList({ catches, scrollY, onLikeToggle, refreshing, onRefresh }: Props) {
  return (
    <Animated.FlatList
      data={catches}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <FeedPostCard post={item} onLikeToggle={onLikeToggle} />
      )}
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