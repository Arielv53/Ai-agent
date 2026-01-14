import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  isFollowing: boolean;
  loading: boolean;
  onPress: () => void;
};

export default function FollowButton({
  isFollowing,
  loading,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFollowing && styles.followingButton,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.text}>
        {isFollowing ? "Following" : "Follow"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: "#2563eb",
  },
  followingButton: {
    backgroundColor: "#374151",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});