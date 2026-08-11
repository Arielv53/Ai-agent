import { API_BASE } from "@/constants/config";
import { LURE_IMAGES } from "@/constants/lureImages";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";


export default function MostUsedLure() {
  const { user } = useAuth();

  const [bait, setBait] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

    // NEW - normalize the backend value before looking up the image
    const normalizedBait = bait?.trim().toLowerCase();

    const lureImage = normalizedBait
    ? Object.entries(LURE_IMAGES).find(
        ([name]) => name.toLowerCase() === normalizedBait
        )?.[1]
    : null;

  useEffect(() => {
    if (user) {
      fetchMostUsedBait();
    }
  }, [user]);

  const fetchMostUsedBait = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `${API_BASE}/stats/most-used-bait`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      );

      const data = await res.json();

      console.log("MOST USED BAIT:", data);

      setBait(data.bait);
      setCount(data.count);
    } catch (err) {
      console.error("Most used bait error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Lure of the Month
      </Text>

      <View style={styles.imageContainer}>
        {lureImage ? (
          <Image
            source={lureImage}
            style={styles.lureImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>
              🎣
            </Text>

            <Text style={styles.placeholderText}>
              Image coming soon
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.catchCount}>
        {count} {count === 1 ? "catch" : "caught"} this month
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#020d16",
    borderRadius: 20,
    padding: 12,
    width: "40%",
    marginBottom: 20,
    marginRight: 15,
    borderWidth: 0.5,
    borderColor: "#00c8ff7d",
  },

  title: {
    color: "#ffffffc6",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 10,
  },

  imageContainer: {
    width: "100%",
    height: 100,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0a1a25",
  },

  lureImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderIcon: {
    fontSize: 40,
    marginBottom: 6,
  },

  placeholderText: {
    color: "#9ee7ff",
    fontSize: 12,
    textAlign: "center",
  },

  catchCount: {
    color: "#9ee7ff",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});