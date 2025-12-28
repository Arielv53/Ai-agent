import React from "react";
import { Animated } from "react-native";
import { PublicCatch } from "../index";
import FeedPostCard from "./FeedPostCard";

interface Props {
  catches: PublicCatch[];
  scrollY: Animated.Value;
  onLikeToggle: (id: number) => void;
}

export default function FeedList({ catches, scrollY, onLikeToggle }: Props) {
  return (
    <Animated.FlatList
      data={catches}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <FeedPostCard post={item} onLikeToggle={onLikeToggle} />
      )}
      contentContainerStyle={{ paddingBottom: 80 }}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    />
  );
}