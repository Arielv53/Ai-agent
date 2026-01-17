import { API_BASE } from "@/constants/config";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import FollowButton from "./components/FollowButton";
import ProfileHeader from "./components/ProfileHeader";
import { ProfileError, ProfileLoading } from "./components/ProfileLoading";
import UserCatchGrid from "./components/UserCatchGrid";
import { UserProfile } from "./types";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // TODO: replace with auth user id
  const CURRENT_USER_ID = 1;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/users/${id}/profile?viewer_id=${CURRENT_USER_ID}`
        );
        const data = await res.json();
        setUser(data);
        setIsFollowing(data.is_following);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProfile();
  }, [id]);

  const toggleFollow = async () => {
    if (!user) return;

    setFollowLoading(true);
    try {
      const endpoint = isFollowing ? "/unfollow" : "/follow";
      await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_id: CURRENT_USER_ID,
          following_id: user.id,
        }),
      });

      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <ProfileLoading />;
  if (!user) return <ProfileError />;

  return (
    <>
      <Stack.Screen
        options={{
          title: user.username,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#020d16" },
          headerTitleStyle: { color: "#fff" },
        }}
      />

      <View style={styles.screen}>

      {/* 🔹 Header Section */}
      <View style={styles.headerSection}>
        <ProfileHeader user={user} />

        {user.id !== CURRENT_USER_ID && (
          <FollowButton
            isFollowing={isFollowing}
            loading={followLoading}
            onPress={toggleFollow}
          />
        )}
      </View>

      {/* 🔹 Grid Section */}
      <View style={styles.gridSection}>
        <UserCatchGrid userId={user.id} username={user.username} />
      </View>

    </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020d16", // overall base
  },
  headerSection: {
    backgroundColor: "#020d16", // darker top (like Fishbrain)
    paddingBottom: 16,
  },
  gridSection: {
    flex: 1,
    backgroundColor: "#2a384c", // slightly lighter blue
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
});