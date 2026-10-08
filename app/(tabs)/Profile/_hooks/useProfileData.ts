import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useState } from "react";

import { useFocusEffect } from "expo-router";

export function useProfileData(userId?: number) {
  const { token } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [catches, setCatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const fetchProfileData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/users/${userId}/profile`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!profileRes.ok) throw new Error("Unable to load profile");
        const profileData = await profileRes.json();
        if (controller.signal.aborted) return;
        setUser(profileData);

        const catchesRes = await fetch(`${API_BASE}/users/${userId}/catches`, { signal: controller.signal });
        const catchesData = await catchesRes.json();
        if (!controller.signal.aborted) setCatches(catchesData);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchProfileData();
    return () => controller.abort();
  }, [userId, token]));

  return { user, catches, loading };
}
