import { invalidateFeed } from "@/app/(tabs)/Feed/_hooks/feedCache";
import FeedPostCard from "@/app/(tabs)/Feed/components/FeedPostCard";
import type { PublicCatch } from "@/app/(tabs)/Feed/types";
import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import {
  useCallback,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DailyCatchesScreen() {
  const {
    date,
  } = useLocalSearchParams<{
    date: string;
  }>();
  const {
    token,
    loading: authLoading,
  } = useAuth();
  const [catches, setCatches] = useState<PublicCatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const activeRequest = useRef<AbortController | null>(null);
  const pendingLikes = useRef(new Set<number>());

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      activeRequest.current = controller;
      pendingLikes.current.clear();
      setCatches([]);
      setError(null);
      setLoading(true);

      if (authLoading) {
        return () => controller.abort();
      }

      if (!token || !date) {
        setError("Unable to load catches for this day.");
        setLoading(false);
        return () => controller.abort();
      }

      void (async () => {
        try {
          const response = await fetch(
            `${API_BASE}/catches/date/${encodeURIComponent(date)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Unable to load catches for this day.");
          }

          const data: PublicCatch[] = await response.json();

          if (!controller.signal.aborted) {
            setCatches(data);
          }
        } catch (requestError) {
          if (!controller.signal.aborted) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Unable to load catches for this day.",
            );
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      })();

      return () => controller.abort();
      // Retry intentionally invalidates the previous request.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      attempt,
      authLoading,
      date,
      token,
    ]),
  );

  const toggleLike = async (catchId: number) => {
    const controller = activeRequest.current;
    const current = catches.find((catchItem) => catchItem.id === catchId);

    if (
      !current
      || !token
      || !controller
      || controller.signal.aborted
      || pendingLikes.current.has(catchId)
    ) {
      return;
    }

    pendingLikes.current.add(catchId);
    const wasLiked = Boolean(current.liked);
    const previousCatches = catches;

    setCatches((items) => items.map((catchItem) => (
      catchItem.id === catchId
        ? {
            ...catchItem,
            liked: !wasLiked,
            likes_count: Math.max(
              0,
              (catchItem.likes_count ?? 0) + (wasLiked ? -1 : 1),
            ),
          }
        : catchItem
    )));

    try {
      const response = await fetch(
        `${API_BASE}/catches/${catchId}/${wasLiked ? "unlike" : "like"}`,
        {
          method: wasLiked ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error("Unable to update like");
      }

      invalidateFeed();
    } catch {
      if (!controller.signal.aborted) {
        setCatches(previousCatches);
      }
    } finally {
      pendingLikes.current.delete(catchId);
    }
  };

  const returnToStats = () => {
    router.replace("/(tabs)/Ai");
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: formatDate(date),
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#020d16",
          },
          headerTintColor: "#ffffff",
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Return to Stats"
              onPress={returnToStats}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color="#ffffff"
              />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#7cddf5"
          />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.message}>
            {error}
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setAttempt((value) => value + 1)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={catches}
          keyExtractor={(catchItem) => String(catchItem.id)}
          renderItem={({ item }) => (
            <FeedPostCard
              post={item}
              onLikeToggle={(catchId) => void toggleLike(catchId)}
            />
          )}
          ListHeaderComponent={(
            <Text style={styles.summary}>
              {catches.length} {catches.length === 1 ? "catch" : "catches"}
            </Text>
          )}
          ListEmptyComponent={(
            <Text style={styles.message}>
              No catches logged on this day.
            </Text>
          )}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

function formatDate(date?: string) {
  if (!date) {
    return "Catches";
  }

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return "Catches";
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020d16",
  },
  content: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  summary: {
    color: "#91a8b6",
    fontSize: 12,
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  message: {
    color: "#b6c6d2",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    padding: 16,
  },
  retryText: {
    color: "#7cddf5",
    fontWeight: "600",
  },
});
