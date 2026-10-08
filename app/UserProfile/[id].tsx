import { API_BASE } from "@/constants/config";
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = 1;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${id}/profile?viewer_id=${currentUserId}`);
        if (!res.ok) throw new Error("Profile request failed");
        setUser(await res.json());
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProfile();
  }, [id]);

  if (loading) return <ProfileLoading />;
  if (!user) return <ProfileError />;
  const showUnavailable = (action: string) => Alert.alert(`${action} user`, `This will let you ${action.toLowerCase()} ${user.username} once the moderation endpoint is connected.`);

  return <View style={styles.screen}>
    <Stack.Screen options={{ headerShown: false }} />
    <ProfileHeader user={user} onBack={() => router.back()} onBlock={() => showUnavailable("Block")} onReport={() => showUnavailable("Report")} />
    <ProfileStats user={user} />
    <View style={styles.gridSection}><UserCatchGrid userId={user.id} username={user.username} /></View>
  </View>;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:"#020b13"},gridSection:{flex:1}});
