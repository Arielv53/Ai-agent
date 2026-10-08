import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export type SearchUser = {
  id: number;
  username: string;
  profile_photo: string | null;
};

export function useUserSearch(query: string) {
  const { token, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const term = query.trim();

  useEffect(() => {
    const controller = new AbortController();
    setUsers([]);
    setError(null);
    setLoading(false);
    if (authLoading || !token || !term) return () => controller.abort();

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(term)}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 422
            ? "Please sign in again to search users."
            : "Unable to search users. Please try again.");
        }
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Unable to load search results.");
        if (!controller.signal.aborted) setUsers(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to search users.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, token, authLoading, attempt]);

  return { users, loading: loading || authLoading, error, signedIn: !!token,
    retry: () => setAttempt((value) => value + 1) };
}
