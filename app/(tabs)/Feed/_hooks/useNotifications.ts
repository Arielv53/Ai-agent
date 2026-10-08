import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useNotifications() {
  const { token, loading: authLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setUnreadCount(0);
    setLoading(false);
    if (authLoading || !token) return () => controller.abort();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Notification count failed: ${res.status}`);
        const data = await res.json();
        if (!controller.signal.aborted) setUnreadCount(data.count || 0);
      } catch (err) {
        if (!controller.signal.aborted) console.error("Error fetching notifications:", err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [token, authLoading]));

  return { unreadCount, loading };
}
