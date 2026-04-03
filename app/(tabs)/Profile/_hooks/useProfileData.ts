import { API_BASE } from "@/constants/config";
import { useEffect, useState } from "react";

export function useProfileData(userId?: number) {
  const [user, setUser] = useState<any>(null);
  const [catches, setCatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/users/${userId}/profile`);
        const profileData = await profileRes.json();
        setUser(profileData);

        const catchesRes = await fetch(`${API_BASE}/users/${userId}/catches`);
        const catchesData = await catchesRes.json();
        setCatches(catchesData);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  return { user, catches, loading };
}
