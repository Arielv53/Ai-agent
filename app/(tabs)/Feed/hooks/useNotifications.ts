import { API_BASE } from "@/constants/config";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useNotifications(userId: number | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notifications/unread-count?user_id=${userId}`); 
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [userId])
  );

  return {
    unreadCount,
    loading,
    refetch: fetchNotifications,
  };
}
