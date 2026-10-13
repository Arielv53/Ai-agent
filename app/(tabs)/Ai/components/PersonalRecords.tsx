import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  ComponentProps,
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MeasurementRecord = {
  catch_id: number;
  species: string | null;
  value: number;
  unit: string;
};

type SpeciesRecord = {
  catch_id: number;
  species: string;
  date_caught: string;
};

type PersonalRecordsResponse = {
  heaviest: MeasurementRecord | null;
  longest: MeasurementRecord | null;
  newest_species: SpeciesRecord | null;
};

export default function PersonalRecords() {
  const {
    token,
    loading: authLoading,
  } = useAuth();

  const [records, setRecords] = useState<PersonalRecordsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();

      setRecords(null);
      setError(false);
      setLoading(authLoading || Boolean(token));

      if (authLoading || !token) {
        return () => controller.abort();
      }

      void (async () => {
        try {
          const response = await fetch(
            `${API_BASE}/stats/personal-records`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Personal records unavailable");
          }

          const data = await response.json();

          if (!controller.signal.aborted) {
            setRecords(data);
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
      attempt,
    ]),
  );

  const hasRecords = Boolean(
    records?.heaviest ||
    records?.longest ||
    records?.newest_species,
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>
            Personal Records
          </Text>

          <Text style={styles.subtitle}>
            Your best catches so far
          </Text>
        </View>

        <View style={styles.badge}>
          <Ionicons
            name="trophy-outline"
            size={18}
            color="#f5b20b"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          color="#26b5ee"
          style={styles.status}
        />
      ) : error ? (
        <TouchableOpacity
          onPress={() => setAttempt((value) => value + 1)}
          accessibilityRole="button"
        >
          <Text style={styles.message}>
            Unable to load records. Tap to retry.
          </Text>
        </TouchableOpacity>
      ) : !hasRecords ? (
        <Text style={styles.message}>
          Add catch measurements and species to start building your records.
        </Text>
      ) : (
        <View style={styles.grid}>
          <RecordTile
            icon="scale-outline"
            label="Heaviest"
            value={formatMeasurement(records?.heaviest)}
            detail={records?.heaviest?.species || "No weight logged"}
            color="#27e889"
          />

          <RecordTile
            icon="resize-outline"
            label="Longest"
            value={formatMeasurement(records?.longest)}
            detail={records?.longest?.species || "No length logged"}
            color="#26b5ee"
          />

          <RecordTile
            icon="sparkles-outline"
            label="Newest Species"
            value={records?.newest_species?.species || "—"}
            detail={
              records?.newest_species
                ? formatDate(records.newest_species.date_caught)
                : "No species logged"
            }
            color="#f5b20b"
          />
        </View>
      )}
    </View>
  );
}

function RecordTile({
  icon,
  label,
  value,
  detail,
  color,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <View style={styles.record}>
      <Ionicons
        name={icon}
        size={18}
        color={color}
      />

      <Text style={styles.recordLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.recordValue,
          {
            color,
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Text
        style={styles.recordDetail}
        numberOfLines={1}
      >
        {detail}
      </Text>
    </View>
  );
}

function formatMeasurement(record: MeasurementRecord | null | undefined) {
  if (!record) {
    return "—";
  }

  return `${Number(record.value.toFixed(1))} ${record.unit}`;
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
    backgroundColor: "#03141f",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#0a3548",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },
  heading: {
    flex: 1,
  },
  title: {
    color: "#e5eaed",
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    color: "#8e9fa9",
    fontSize: 10,
    marginTop: 4,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#292313",
    borderWidth: 1,
    borderColor: "#66501a",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    gap: 8,
  },
  record: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: 11,
    backgroundColor: "#061e2b",
    borderWidth: 1,
    borderColor: "#0b3042",
  },
  recordLabel: {
    color: "#90a9b7",
    fontSize: 10,
    marginTop: 7,
  },
  recordValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 5,
  },
  recordDetail: {
    color: "#8e9fa9",
    fontSize: 9,
    marginTop: 5,
  },
  status: {
    marginVertical: 18,
  },
  message: {
    color: "#90a9b7",
    fontSize: 12,
    lineHeight: 19,
    paddingVertical: 12,
  },
});
