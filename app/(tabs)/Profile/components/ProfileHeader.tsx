import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ProfileHeader({ user }: { user: any }) {
  return (
    <>
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

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.username}>@{user.username}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  coverContainer: { width: "100%", height: 180 },
  coverPhoto: { width: "100%", height: "100%" },
  profileImageContainer: {
    position: "absolute",
    bottom: -50,
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "#464545ff",
    borderRadius: 100,
  },
  profilePhoto: { width: 100, height: 100, borderRadius: 50 },
  name: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
    marginTop: 60,
  },
  username: { textAlign: "center", color: "#9a9a9a", marginBottom: 12 },
});
