import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileHeader({ user }: { user: any }) {
  const fullName = [user.first_name?.trim(), user.last_name?.trim()].filter(Boolean).join(" ");
  const displayName = fullName || user.name || user.username || "Angler";
  const location = [user.city?.trim(), user.country?.trim()].filter(Boolean).join(", ");
  return <View style={styles.header}>
    <ImageBackground source={user.cover_photo ? { uri: user.cover_photo } : require("../../../../assets/stats/stats-banner.jpg")} style={styles.coverPhoto} imageStyle={styles.coverImage}>
      <View style={styles.coverShade}/>
      <TouchableOpacity style={styles.settingsButton} onPress={() => router.push("/Profile/Settings")} accessibilityLabel="Open settings"><Ionicons name="settings-outline" size={22} color="#c9f2ff"/></TouchableOpacity>
    </ImageBackground>
    <View style={styles.profileRow}>
      <View style={styles.profileRing}>
        {user.profile_photo ? <Image source={{ uri: user.profile_photo }} style={styles.profilePhoto}/> : <Ionicons name="person" size={42} color="#73ceef"/>}
      </View>
      <View style={styles.identity}>
        <Text style={styles.name}>{displayName}</Text>
        {!!user.username && <Text style={styles.username}>@{user.username}</Text>}
        {!!location && <View style={styles.locationRow}><Ionicons name="location" size={13} color="#23c1ff"/><Text style={styles.location}>{location}</Text></View>}
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  header: {
    minHeight: 200,
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "#041729",
    borderWidth: 1,
    borderColor: "#075a83",
  },
  coverPhoto: {
    height: 105,
    width: "100%",
  },
  coverImage: {
    resizeMode: "cover",
  },
  coverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,18,31,.24)",
  },
  settingsButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: "rgba(2,22,38,.78)",
    borderWidth: 1,
    borderColor: "#0b6f99",
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    marginHorizontal: 16,
    marginTop: -26,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  profileRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: "#1dbdff",
    backgroundColor: "#092c43",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
  },
  identity: {
    marginLeft: 14,
    flex: 1,
    paddingTop: 32,
  },
  username: {
    color: "#8fb6c9",
    fontSize: 13,
    marginTop: 3,
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  location: {
    flexShrink: 1,
    color: "#bdd9e6",
    fontSize: 12,
  },
});
