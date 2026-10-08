import { API_BASE } from "@/constants/config";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { Alert } from "react-native";
import { readFeed, subscribeFeed, writeFeed } from "./feedCache";
import type { PublicCatch } from "../types";

const STALE_AFTER = 30_000;

export function useFeed(token: string | null) {
  const getSnapshot = useCallback(() => readFeed(token), [token]);
  const cache = useSyncExternalStore(subscribeFeed, getSnapshot, getSnapshot);
  const [loading, setLoading] = useState(!cache.updatedAt && !cache.items.length);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);
  const pendingLikes = useRef(new Set<number>());
  const mounted = useRef(false);
  const failedPage = useRef(false);

  const load = useCallback(async (more = false, manual = false) => {
    if (active.current || pendingLikes.current.size) return;
    const start = readFeed(token);
    if (more && !start.nextCursor) return;
    const controller = new AbortController();
    active.current = controller;
    setError(null);
    failedPage.current = more;
    setLoadingMore(more);
    setRefreshing(manual);
    setLoading(!start.items.length && !more);
    try {
      const cursor = more ? `&cursor=${encodeURIComponent(start.nextCursor!)}` : "";
      const response = await fetch(`${API_BASE}/feed?limit=20${cursor}`, {
        signal: controller.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Unable to load feed. Tap to retry.");
      const data = await response.json();
      if (!Array.isArray(data.items)) throw new Error("Unable to load feed. Tap to retry.");
      if (controller.signal.aborted) return;
      writeFeed(token, (current) => {
        if (current.revision !== start.revision) return current;
        const items: PublicCatch[] = more
          ? [...current.items, ...data.items.filter((item: PublicCatch) =>
              !current.items.some((existing) => existing.id === item.id))]
          : data.items;
        return { ...current, items, nextCursor: data.next_cursor, updatedAt: more ? current.updatedAt : Date.now() };
      });
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load feed.");
    } finally {
      if (active.current === controller) {
        active.current = null;
        if (mounted.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    mounted.current = true;
    setRefreshing(false);
    setLoadingMore(false);
    const current = readFeed(token);
    if (Date.now() - current.updatedAt >= STALE_AFTER) void load();
    return () => {
      mounted.current = false;
      active.current?.abort();
      active.current = null;
    };
  }, [load, token]));

  const onLikeToggle = useCallback(async (catchId: number) => {
    if (!token) {
      Alert.alert("Sign in required", "Sign in to like a catch.");
      return;
    }
    const target = readFeed(token).items.find((item) => item.id === catchId);
    if (!target || pendingLikes.current.has(catchId)) return;
    pendingLikes.current.add(catchId);
    writeFeed(token, (current) => ({
      ...current, revision: current.revision + 1,
      items: current.items.map((item) => item.id === catchId ? {
        ...item, liked: !target.liked,
        likes_count: Math.max(0, (target.likes_count ?? 0) + (target.liked ? -1 : 1)),
      } : item),
    }));
    try {
      const response = await fetch(`${API_BASE}/catches/${catchId}/${target.liked ? "unlike" : "like"}`, {
        method: target.liked ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Like failed");
    } catch {
      writeFeed(token, (current) => ({
        ...current, revision: current.revision + 1,
        items: current.items.map((item) => item.id === catchId ? {
          ...item, liked: target.liked, likes_count: target.likes_count,
        } : item),
      }));
      if (mounted.current) Alert.alert("Unable to update like", "Please try again or sign in again.");
    } finally {
      pendingLikes.current.delete(catchId);
    }
  }, [token]);

  return {
    catches: cache.items, loading, refreshing, loadingMore, error, onLikeToggle,
    onRefresh: useCallback(() => { void load(false, true); }, [load]),
    onLoadMore: useCallback(() => { if (!error) void load(true); }, [load, error]),
    retry: useCallback(() => { void load(failedPage.current); }, [load]),
  };
}
