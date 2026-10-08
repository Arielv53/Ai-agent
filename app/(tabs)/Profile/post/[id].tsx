import { invalidateFeed } from "@/app/(tabs)/Feed/_hooks/feedCache";
import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FeedPostCard from "../../Feed/components/FeedPostCard";
import type { PublicCatch } from "../../Feed";

export default function ProfilePostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user, loading: authLoading } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deletePending = useRef(false);
  const [post, setPost] = useState<PublicCatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(false);
  const active = useRef<AbortController | null>(null);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    active.current = controller;
    pending.current = false;
    setPost(null);
    setLoading(true);
    setError(null);
    if (authLoading) return () => controller.abort();
    void (async () => {
      try {
        const response = await fetch(`${API_BASE}/catches/${encodeURIComponent(id)}/post`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: controller.signal,
        });
        if (!response.ok) throw new Error(response.status === 404 ? "This post is unavailable." : "Unable to load this post.");
        const data = await response.json();
        if (!controller.signal.aborted) setPost(data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load this post.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
    // Explicit retry should reload even when the route and account have not changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, authLoading, attempt]));

  const toggleLike = async () => {
    if (!token) {
      Alert.alert("Sign in required", "Sign in to like a catch.");
      return;
    }
    const controller = active.current;
    if (!post || pending.current || !controller || controller.signal.aborted) return;
    pending.current = true;
    const previous = post;
    setPost({ ...post, liked: !post.liked,
      likes_count: Math.max(0, (post.likes_count ?? 0) + (post.liked ? -1 : 1)) });
    try {
      const response = await fetch(`${API_BASE}/catches/${post.id}/${post.liked ? "unlike" : "like"}`, {
        method: post.liked ? "DELETE" : "POST", headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Like failed");
      invalidateFeed();
    } catch {
      if (!controller.signal.aborted) {
        setPost(previous);
        Alert.alert("Unable to update like", "Please try again or sign in again.");
      }
    } finally {
      if (!controller.signal.aborted) pending.current = false;
    }
  };

  const deletePost = async () => {
    if (!post || !token || post.user_id !== user?.id || deletePending.current) return;
    deletePending.current = true;
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/catches/${post.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Delete failed");
      invalidateFeed();
      setMenuVisible(false);
      router.back();
    } catch {
      Alert.alert("Unable to delete post", "Please try again.");
    } finally {
      deletePending.current = false;
      setDeleting(false);
    }
  };

  const confirmDelete = () => Alert.alert("Delete this post?", "This permanently deletes the catch, its comments and likes.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => void deletePost() },
  ]);

  return <View style={styles.container}>
    <Stack.Screen options={{ headerShown: true, title: "", headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#020d16" }, headerTintColor: "#fff",
      headerShadowVisible: false, headerBackButtonDisplayMode: "minimal" }} />
    {loading ? <View style={styles.center}><ActivityIndicator size="large" color="#7cddf5" /></View>
      : error || !post ? <View style={styles.center}>
        <Text style={styles.message}>{error || "This post is unavailable."}</Text>
        <TouchableOpacity onPress={() => setAttempt((value) => value + 1)} accessibilityRole="button" style={styles.retry}>
          <Text style={styles.link}>Try again</Text>
        </TouchableOpacity>
      </View> : <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}>
        <FeedPostCard post={post} onLikeToggle={toggleLike}
          onOptionsPress={post.user_id === user?.id ? () => setMenuVisible(true) : undefined} />
      </ScrollView>}
    <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => !deleting && setMenuVisible(false)}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => !deleting && setMenuVisible(false)} accessibilityLabel="Close post options" />
        <View style={styles.menu}>
          <TouchableOpacity disabled={deleting} style={styles.menuButton} onPress={() => {
            setMenuVisible(false);
            router.push({ pathname: "/addCatch", params: { editId: id } });
          }}><Text style={styles.link}>Edit</Text></TouchableOpacity>
          <TouchableOpacity disabled={deleting} style={styles.menuButton} onPress={confirmDelete}>
            <Text style={styles.deleteText}>{deleting ? "Deleting…" : "Delete"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020d16" },
  content: { paddingTop: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  message: { color: "#b6c6d2", textAlign: "center" },
  retry: { padding: 16 },
  link: { color: "#7cddf5", fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 32 },
  menu: { backgroundColor: "#0b2435", borderRadius: 16, overflow: "hidden" },
  menuButton: { padding: 20, alignItems: "center" },
  deleteText: { color: "#ff8d8d", fontWeight: "600" },
});
