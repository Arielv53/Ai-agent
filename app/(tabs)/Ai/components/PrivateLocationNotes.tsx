import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type LocationNote = {
  catch_id: number;
  date_caught: string;
  location: string | null;
  species: string | null;
  bait: string | null;
  lure: string | null;
  note: string;
};

export default function PrivateLocationNotes() {
  const {
    token,
    user,
    loading: authLoading,
  } = useAuth();

  const [notes, setNotes] = useState<LocationNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const isPremium = Boolean(user?.is_premium);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();

      setNotes([]);
      setError(false);
      setLoading(authLoading || Boolean(token && isPremium));

      if (authLoading || !token || !isPremium) {
        return () => controller.abort();
      }

      void (async () => {
        try {
          const response = await fetch(
            `${API_BASE}/stats/private-location-notes`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Private notes unavailable");
          }

          const data = await response.json();

          if (!controller.signal.aborted) {
            setNotes(Array.isArray(data.notes) ? data.notes : []);
          }
        } catch {
          if (!controller.signal.aborted) {
            setError(true);
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
      token,
      authLoading,
      isPremium,
      attempt,
    ]),
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.lockBadge}>
          <Ionicons
            name="lock-closed"
            size={17}
            color="#f5b20b"
          />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>
            Private Location Notes
          </Text>

          <Text style={styles.subtitle}>
            Recent observations from your catches
          </Text>
        </View>

        <View style={styles.premiumBadge}>
          <Ionicons
            name="diamond-outline"
            size={11}
            color="#f5b20b"
          />

          <Text style={styles.premiumText}>
            PREMIUM
          </Text>
        </View>
      </View>

      {!isPremium ? (
        <View style={styles.lockedState}>
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#f5b20b"
          />

          <View style={styles.lockedCopy}>
            <Text style={styles.lockedTitle}>
              Keep your spot knowledge organized
            </Text>

            <Text style={styles.lockedDescription}>
              Premium brings your private notes, species, dates, and tackle together by location.
            </Text>
          </View>
        </View>
      ) : loading ? (
        <ActivityIndicator
          color="#f5b20b"
          style={styles.status}
        />
      ) : error ? (
        <TouchableOpacity
          onPress={() => setAttempt((value) => value + 1)}
          accessibilityRole="button"
        >
          <Text style={styles.message}>
            Unable to load private notes. Tap to retry.
          </Text>
        </TouchableOpacity>
      ) : notes.length === 0 ? (
        <Text style={styles.message}>
          Add a private note to a catch and it will appear here with its location and tackle.
        </Text>
      ) : (
        <View style={styles.notes}>
          {notes.map((note) => (
            <NoteRow
              key={note.catch_id}
              note={note}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function NoteRow({
  note,
}: {
  note: LocationNote;
}) {
  const tackle = note.lure || note.bait || "No tackle logged";

  return (
    <View style={styles.note}>
      <View style={styles.noteTopRow}>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color="#27e889"
          />

          <Text
            style={styles.location}
            numberOfLines={1}
          >
            {note.location || "Location not logged"}
          </Text>
        </View>

        <Text style={styles.date}>
          {formatDate(note.date_caught)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text
          style={styles.meta}
          numberOfLines={1}
        >
          {note.species || "Species not logged"}
        </Text>

        <View style={styles.dot} />

        <Text
          style={styles.meta}
          numberOfLines={1}
        >
          {tackle}
        </Text>
      </View>

      <Text
        style={styles.noteText}
        numberOfLines={2}
      >
        {note.note}
      </Text>
    </View>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: "#12170f",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#4f421b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#292313",
    borderWidth: 1,
    borderColor: "#66501a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  heading: {
    flex: 1,
  },
  title: {
    color: "#f0eee7",
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9e9a87",
    fontSize: 10,
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#292313",
    borderWidth: 1,
    borderColor: "#66501a",
  },
  premiumText: {
    color: "#f5b20b",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  lockedState: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 13,
    borderRadius: 11,
    backgroundColor: "#1d2118",
  },
  lockedCopy: {
    flex: 1,
    marginLeft: 11,
  },
  lockedTitle: {
    color: "#eee9d9",
    fontSize: 12,
    fontWeight: "700",
  },
  lockedDescription: {
    color: "#9e9a87",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  notes: {
    gap: 8,
    marginTop: 13,
  },
  note: {
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#1b2118",
    borderWidth: 1,
    borderColor: "#38371f",
  },
  noteTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  locationRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  location: {
    flex: 1,
    color: "#27e889",
    fontSize: 12,
    fontWeight: "700",
  },
  date: {
    color: "#aaa58f",
    fontSize: 9,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  meta: {
    color: "#d8d4c5",
    fontSize: 10,
    flexShrink: 1,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#756f58",
    marginHorizontal: 7,
  },
  noteText: {
    color: "#a9a48f",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },
  status: {
    marginVertical: 24,
  },
  message: {
    color: "#aaa58f",
    fontSize: 12,
    lineHeight: 19,
    paddingVertical: 18,
  },
});
