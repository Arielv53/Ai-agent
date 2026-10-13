import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  ComponentProps,
  ReactNode,
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

type PatternValue = {
  value: string;
  count: number;
};

type HistoricalPatterns = {
  data_points: number;
  pattern: {
    tide: PatternValue | null;
    tackle: PatternValue | null;
    tackle_type: string | null;
    method: PatternValue | null;
    water_temperature: string | null;
  };
  season: {
    peak_month: string;
    months_until: number;
    catch_count: number;
    share: number;
  } | null;
};

export default function PremiumPatternCards() {
  const {
    token,
    user,
    loading: authLoading,
  } = useAuth();

  const [data, setData] = useState<HistoricalPatterns | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const isPremium = Boolean(user?.is_premium);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();

      setData(null);
      setError(false);
      setLoading(authLoading || Boolean(token && isPremium));

      if (authLoading || !token || !isPremium) {
        return () => controller.abort();
      }

      void (async () => {
        try {
          const response = await fetch(
            `${API_BASE}/stats/historical-patterns`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Historical patterns unavailable");
          }

          const body = await response.json();

          if (!controller.signal.aborted) {
            setData(body);
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
    <>
      <View style={styles.card}>
        <PremiumHeader
          title="Your Best Historical Pattern"
          subtitle="The details repeated most across your catches"
          icon="analytics-outline"
        />

        <CardBody
          isPremium={isPremium}
          loading={loading}
          error={error}
          onRetry={() => setAttempt((value) => value + 1)}
        >
          {!data?.data_points ? (
            <Text style={styles.message}>
              Log catch conditions to uncover your first historical pattern.
            </Text>
          ) : (
            <View style={styles.patternGrid}>
              <PatternDetail
                icon="water-outline"
                label="Tide"
                value={data.pattern.tide?.value}
              />

              <PatternDetail
                icon="color-wand-outline"
                label={data.pattern.tackle_type || "Tackle"}
                value={data.pattern.tackle?.value}
              />

              <PatternDetail
                icon="fish-outline"
                label="Method"
                value={data.pattern.method?.value}
              />

              <PatternDetail
                icon="thermometer-outline"
                label="Water Range"
                value={data.pattern.water_temperature}
              />
            </View>
          )}
        </CardBody>
      </View>

      <View style={styles.card}>
        <PremiumHeader
          title="Season Ahead"
          subtitle="Based on your strongest historical month"
          icon="calendar-outline"
        />

        <CardBody
          isPremium={isPremium}
          loading={loading}
          error={error}
          onRetry={() => setAttempt((value) => value + 1)}
        >
          {!data?.season ? (
            <Text style={styles.message}>
              Log catches across the year to reveal your strongest season.
            </Text>
          ) : (
            <View style={styles.seasonContent}>
              <View style={styles.seasonIcon}>
                <Ionicons
                  name="calendar"
                  size={23}
                  color="#27e889"
                />
              </View>

              <View style={styles.seasonCopy}>
                <Text style={styles.seasonTitle}>
                  {data.season.months_until === 0
                    ? `${data.season.peak_month} is your strongest month`
                    : `Your strongest month returns in ${data.season.months_until} ${data.season.months_until === 1 ? "month" : "months"}`}
                </Text>

                <Text style={styles.seasonDescription}>
                  {data.season.peak_month} accounts for {data.season.share}% of your logged catches.
                </Text>

                <View style={styles.timeline}>
                  <View
                    style={[
                      styles.timelineFill,
                      {
                        width: `${Math.max(8, 100 - data.season.months_until * 8)}%`,
                      },
                    ]}
                  />

                  <View style={styles.timelineMarker} />
                </View>
              </View>
            </View>
          )}
        </CardBody>
      </View>
    </>
  );
}

function PremiumHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#f5b20b"
        />
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.premiumBadge}>
        <Ionicons
          name="diamond-outline"
          size={10}
          color="#f5b20b"
        />

        <Text style={styles.premiumText}>
          PREMIUM
        </Text>
      </View>
    </View>
  );
}

function CardBody({
  isPremium,
  loading,
  error,
  onRetry,
  children,
}: {
  isPremium: boolean;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (!isPremium) {
    return (
      <View style={styles.lockedState}>
        <Ionicons
          name="lock-closed-outline"
          size={21}
          color="#f5b20b"
        />

        <Text style={styles.lockedText}>
          Unlock this insight with BiteBook Premium.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <ActivityIndicator
        color="#f5b20b"
        style={styles.status}
      />
    );
  }

  if (error) {
    return (
      <TouchableOpacity
        onPress={onRetry}
        accessibilityRole="button"
      >
        <Text style={styles.message}>
          Unable to load this insight. Tap to retry.
        </Text>
      </TouchableOpacity>
    );
  }

  return children;
}

function PatternDetail({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string | null | undefined;
}) {
  return (
    <View style={styles.patternDetail}>
      <Ionicons
        name={icon}
        size={19}
        color="#26b5ee"
      />

      <Text style={styles.patternLabel}>
        {label}
      </Text>

      <Text
        style={styles.patternValue}
        numberOfLines={1}
      >
        {value || "Not enough data"}
      </Text>
    </View>
  );
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
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292313",
    borderWidth: 1,
    borderColor: "#66501a",
    marginRight: 10,
  },
  heading: {
    flex: 1,
    minWidth: 0,
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
    marginLeft: 6,
  },
  premiumText: {
    color: "#f5b20b",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  patternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 13,
  },
  patternDetail: {
    flexBasis: "46%",
    flexGrow: 1,
    minWidth: 0,
    padding: 11,
    borderRadius: 10,
    backgroundColor: "#1b2118",
    borderWidth: 1,
    borderColor: "#38371f",
  },
  patternLabel: {
    color: "#aaa58f",
    fontSize: 9,
    marginTop: 7,
  },
  patternValue: {
    color: "#eee9d9",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  seasonContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  seasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#082a21",
    borderWidth: 1,
    borderColor: "#126147",
  },
  seasonCopy: {
    flex: 1,
    marginLeft: 12,
  },
  seasonTitle: {
    color: "#eee9d9",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  seasonDescription: {
    color: "#aaa58f",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },
  timeline: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#303427",
    marginTop: 12,
  },
  timelineFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#27e889",
  },
  timelineMarker: {
    position: "absolute",
    right: 0,
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f5b20b",
    borderWidth: 2,
    borderColor: "#5f4d16",
  },
  lockedState: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 13,
    borderRadius: 10,
    backgroundColor: "#1d2118",
  },
  lockedText: {
    flex: 1,
    color: "#aaa58f",
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 10,
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
