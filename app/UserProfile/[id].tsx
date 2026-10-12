import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import ProfileStats from "../(tabs)/Profile/components/ProfileStats";
import ProfileHeader from "./components/ProfileHeader";
import { ProfileError, ProfileLoading } from "./components/ProfileLoading";
import UserCatchGrid from "./components/UserCatchGrid";
import { UserProfile } from "./types";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user: currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const selectedUserId = Number(id);

  useEffect(() => {
    if (authLoading || !Number.isInteger(selectedUserId)) return;
    const controller = new AbortController();
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/users/${selectedUserId}/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Profile request failed");
        setUser(await res.json());
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to load profile", err);
        setUser(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadProfile();
    return () => controller.abort();
  }, [authLoading, selectedUserId, token]);

  const toggleFollow = async () => {
    if (!user || !token || followLoading || user.id === currentUser?.id) return;
    const wasFollowing = !!user.is_following;
    setFollowLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${wasFollowing ? "unfollow" : "follow"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ following_id: user.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Unable to update follow status");
      }
      setUser((profile) => profile ? {
        ...profile,
        is_following: !wasFollowing,
        followers_count: Math.max(0, (profile.followers_count ?? 0) + (wasFollowing ? -1 : 1)),
      } : profile);
    } catch (error) {
      Alert.alert("Follow unavailable", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading || authLoading) return <ProfileLoading />;
  if (!user) return <ProfileError />;
  const showUnavailable = (action: string) => Alert.alert(`${action} user`, `This will let you ${action.toLowerCase()} ${user.username} once the moderation endpoint is connected.`);

  return <View style={styles.screen}>
    <Stack.Screen options={{ headerShown: false }} />
    <ProfileHeader user={user} isOwnProfile={user.is_own_profile ?? user.id === currentUser?.id} followLoading={followLoading} onToggleFollow={toggleFollow} onBack={() => router.back()} onBlock={() => showUnavailable("Block")} onReport={() => showUnavailable("Report")} />
    <ProfileStats user={user} />
    <View style={styles.gridSection}><UserCatchGrid userId={user.id} username={user.username} /></View>
  </View>;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:"#020b13"},gridSection:{flex:1}});
