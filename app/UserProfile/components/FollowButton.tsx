import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  isFollowing: boolean;
  loading: boolean;
  onPress: () => void;
};

export default function FollowButton({ isFollowing, loading, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, isFollowing && styles.followingButton]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={isFollowing ? "Unfollow user" : "Follow user"}
      accessibilityState={{ disabled: loading, selected: isFollowing }}
    >
      <Text style={styles.text}>{loading ? "..." : isFollowing ? "Following" : "Follow"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 68,
    height: 29,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: "#18aef0",
    alignItems: "center",
    justifyContent: "center",
  },
  followingButton: {
    backgroundColor: "#08283d",
    borderWidth: 1,
    borderColor: "#1688b8",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
});
