import { API_BASE } from "@/constants/config";
import { getSpeciesImage } from "@/constants/specieImages";
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
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Line,
  Polyline,
} from "react-native-svg";

type YearSummary = {
  catches: number;
  species: number;
  average_weight: number | null;
  personal_best: number | null;
};

type MonthlyComparison = {
  month: string;
  current: number;
  previous: number;
};

type SpeciesChange = {
  species: string;
  current: number;
  previous: number;
  change: number;
};

type Review = {
  current_year: number;
  previous_year: number;
  current: YearSummary;
  previous: YearSummary;
  changes: {
    catches: number | null;
    species: number | null;
    average_weight: number | null;
    personal_best: number | null;
  };
  monthly: MonthlyComparison[];
  species_changes: SpeciesChange[];
};

export default function YearOverYearReview() {
  const {
    token,
    user,
    loading: authLoading,
  } = useAuth();

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const isPremium = Boolean(user?.is_premium);
  const currentYear = review?.current_year ?? new Date().getFullYear();
  const previousYear = review?.previous_year ?? currentYear - 1;

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();

      setReview(null);
      setError(false);
      setLoading(authLoading || Boolean(token && isPremium));

      if (authLoading || !token || !isPremium) {
        return () => controller.abort();
      }

      void (async () => {
        try {
          const response = await fetch(
            `${API_BASE}/stats/year-over-year`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Year-over-year review unavailable");
          }

          const body = await response.json();

          if (!controller.signal.aborted) {
            setReview(body);
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
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Year-over-Year Review
        </Text>

        <View style={styles.headerMetaRow}>
          <View style={styles.premiumBadge}>
            <Ionicons
              name="diamond-outline"
              size={9}
              color="#f5b20b"
            />

            <Text style={styles.premiumText}>
              PREMIUM
            </Text>
          </View>

          <View style={styles.periodBadge}>
            <Ionicons
              name="calendar-outline"
              size={11}
              color="#26b5ee"
            />

            <Text style={styles.periodText}>
              {previousYear} vs {currentYear}
            </Text>
          </View>
        </View>
      </View>

      {!isPremium ? (
        <View style={styles.lockedCard}>
          <View style={styles.lockIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={23}
              color="#f5b20b"
            />
          </View>

          <View style={styles.lockedCopy}>
            <Text style={styles.lockedTitle}>
              Compare every season
            </Text>

            <Text style={styles.lockedDescription}>
              Premium compares yearly catches, species, measurements, monthly activity, and your biggest changes.
            </Text>
          </View>
        </View>
      ) : loading ? (
        <View style={styles.statusCard}>
          <ActivityIndicator color="#f5b20b" />
        </View>
      ) : error ? (
        <TouchableOpacity
          onPress={() => setAttempt((value) => value + 1)}
          accessibilityRole="button"
          style={styles.statusCard}
        >
          <Text style={styles.message}>
            Unable to load your yearly review. Tap to retry.
          </Text>
        </TouchableOpacity>
      ) : review ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              At a Glance
            </Text>

            <View style={styles.metricGrid}>
              <Metric
                icon="fish-outline"
                label="Catches"
                value={String(review.current.catches)}
                change={formatChange(review.changes.catches, "%")}
                direction={review.changes.catches}
              />

              <Metric
                icon="layers-outline"
                label="Species"
                value={String(review.current.species)}
                change={formatChange(review.changes.species)}
                direction={review.changes.species}
              />

              <Metric
                icon="scale-outline"
                label="Average Weight"
                value={formatValue(review.current.average_weight, "lb")}
                change={formatChange(review.changes.average_weight, " lb")}
                direction={review.changes.average_weight}
              />

              <Metric
                icon="trophy-outline"
                label="Personal Best"
                value={formatValue(review.current.personal_best, "lb")}
                change={formatChange(review.changes.personal_best, " lb")}
                direction={review.changes.personal_best}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.chartHeader}>
              <Text style={styles.cardTitle}>
                Monthly Comparison
              </Text>

              <View style={styles.legend}>
                <LegendDot
                  color="#28c7ee"
                  label={String(review.current_year)}
                />

                <LegendDot
                  color="#607f93"
                  label={String(review.previous_year)}
                />
              </View>
            </View>

            <ComparisonChart monthly={review.monthly} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Biggest Changes
            </Text>

            {!review.species_changes.length ? (
              <Text style={styles.message}>
                Log species in both years to see what changed.
              </Text>
            ) : (
              <View style={styles.changesList}>
                {review.species_changes.map((item) => (
                  <SpeciesChangeRow
                    key={item.species}
                    item={item}
                  />
                ))}
              </View>
            )}
          </View>

          <InsightCard changes={review.species_changes} />
        </>
      ) : null}
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
  change,
  direction,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  change: string;
  direction: number | null;
}) {
  const negative = direction !== null && direction < 0;

  return (
    <View style={styles.metric}>
      <View style={styles.metricHeading}>
        <Ionicons
          name={icon}
          size={16}
          color="#26b5ee"
        />

        <Text style={styles.metricLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text
        style={[
          styles.metricChange,
          negative && styles.metricChangeNegative,
        ]}
      >
        {change}
      </Text>
    </View>
  );
}

function ComparisonChart({
  monthly,
}: {
  monthly: MonthlyComparison[];
}) {
  const width = 310;
  const height = 140;
  const top = 12;
  const bottom = 105;
  const maximum = Math.max(
    1,
    ...monthly.flatMap((item) => [
      item.current,
      item.previous,
    ]),
  );
  const currentPoints = monthly.map((item, index) => ({
    x: 14 + index * 25.6,
    y: bottom - item.current / maximum * (bottom - top),
  }));
  const previousPoints = monthly.map((item, index) => ({
    x: 14 + index * 25.6,
    y: bottom - item.previous / maximum * (bottom - top),
  }));

  return (
    <View style={styles.chartContainer}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {[35, 70, 105].map((y) => (
          <Line
            key={y}
            x1={10}
            y1={y}
            x2={300}
            y2={y}
            stroke="#173747"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        <Polyline
          points={previousPoints.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke="#607f93"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <Polyline
          points={currentPoints.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke="#28c7ee"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {currentPoints.map((point, index) => (
          <Circle
            key={monthly[index].month}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="#28c7ee"
          />
        ))}
      </Svg>

      <View style={styles.monthLabels}>
        {monthly.map((item) => (
          <Text
            key={item.month}
            style={styles.monthLabel}
          >
            {item.month.slice(0, 1)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text style={styles.legendText}>
        {label}
      </Text>
    </View>
  );
}

function SpeciesChangeRow({
  item,
}: {
  item: SpeciesChange;
}) {
  const image = getSpeciesImage(item.species);
  const negative = item.change < 0;

  return (
    <View style={styles.changeRow}>
      <View style={styles.changeImageContainer}>
        {image ? (
          <Image
            source={image}
            style={styles.changeImage}
            resizeMode="contain"
          />
        ) : (
          <Ionicons
            name="fish-outline"
            size={25}
            color="#26b5ee"
          />
        )}
      </View>

      <View style={styles.changeCopy}>
        <Text style={styles.changeSpecies}>
          {item.species}
        </Text>

        <Text style={styles.changeCounts}>
          {item.previous} → {item.current} catches
        </Text>
      </View>

      <Text
        style={[
          styles.changeAmount,
          negative && styles.changeAmountNegative,
        ]}
      >
        {item.change > 0 ? "+" : ""}{item.change}
      </Text>
    </View>
  );
}

function InsightCard({
  changes,
}: {
  changes: SpeciesChange[];
}) {
  const improvement = changes.find((item) => item.change > 0);

  return (
    <View style={styles.insightCard}>
      <Ionicons
        name="sparkles"
        size={24}
        color="#f5b20b"
      />

      <View style={styles.insightCopy}>
        <Text style={styles.insightTitle}>
          Key Insight
        </Text>

        <Text style={styles.insightText}>
          {improvement
            ? `${improvement.species} shows your largest gain with ${improvement.change} more ${improvement.change === 1 ? "catch" : "catches"}.`
            : "Keep logging catches this year to reveal your strongest improvement."}
        </Text>
      </View>
    </View>
  );
}

function formatValue(value: number | null, unit: string) {
  return value === null
    ? "—"
    : `${Number(value.toFixed(1))} ${unit}`;
}

function formatChange(value: number | null, suffix = "") {
  if (value === null) {
    return "No prior data";
  }

  return `${value > 0 ? "+" : ""}${Number(value.toFixed(1))}${suffix}`;
}

const styles = StyleSheet.create({
  section: {
    marginTop: 4,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#12170f",
    borderWidth: 1,
    borderColor: "#4f421b",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#f0eee7",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "left",
  },
  headerMetaRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    marginLeft: 10,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#292313",
    borderWidth: 1,
    borderColor: "#66501a",
  },
  premiumText: {
    color: "#f5b20b",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  periodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#061e2b",
    borderWidth: 1,
    borderColor: "#0b4057",
  },
  periodText: {
    color: "#dff6ff",
    fontSize: 8,
    fontWeight: "700",
  },
  card: {
    marginBottom: 10,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#1b2118",
    borderWidth: 1,
    borderColor: "#38371f",
  },
  cardTitle: {
    color: "#e5eaed",
    fontSize: 14,
    fontWeight: "700",
  },
  metricGrid: {
    flexDirection: "row",
    gap: 6,
    marginTop: 11,
  },
  metric: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#12170f",
    borderWidth: 1,
    borderColor: "#38371f",
  },
  metricHeading: {
    alignItems: "flex-start",
    gap: 5,
  },
  metricLabel: {
    color: "#90a9b7",
    fontSize: 8,
    lineHeight: 11,
  },
  metricValue: {
    color: "#f0f7fa",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 7,
  },
  metricChange: {
    color: "#27e889",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 4,
  },
  metricChangeNegative: {
    color: "#f5a900",
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legend: {
    flexDirection: "row",
    gap: 9,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    color: "#90a9b7",
    fontSize: 8,
  },
  chartContainer: {
    marginTop: 10,
  },
  monthLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: -22,
  },
  monthLabel: {
    color: "#8e9fa9",
    fontSize: 7,
    width: 15,
    textAlign: "center",
  },
  changesList: {
    marginTop: 8,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#38371f",
  },
  changeImageContainer: {
    width: 52,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  changeImage: {
    width: 50,
    height: 36,
  },
  changeCopy: {
    flex: 1,
    marginLeft: 8,
  },
  changeSpecies: {
    color: "#e5eaed",
    fontSize: 11,
    fontWeight: "700",
  },
  changeCounts: {
    color: "#8e9fa9",
    fontSize: 9,
    marginTop: 3,
  },
  changeAmount: {
    color: "#27e889",
    fontSize: 16,
    fontWeight: "800",
  },
  changeAmountNegative: {
    color: "#f5a900",
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#16190f",
    borderWidth: 1,
    borderColor: "#66501a",
  },
  insightCopy: {
    flex: 1,
    marginLeft: 11,
  },
  insightTitle: {
    color: "#f5b20b",
    fontSize: 11,
    fontWeight: "800",
  },
  insightText: {
    color: "#eee9d9",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  lockedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#12170f",
    borderWidth: 1,
    borderColor: "#4f421b",
  },
  lockIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292313",
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
  statusCard: {
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#12170f",
    borderWidth: 1,
    borderColor: "#4f421b",
  },
  message: {
    color: "#90a9b7",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
