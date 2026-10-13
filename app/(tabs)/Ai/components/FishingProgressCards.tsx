import { API_BASE } from "@/constants/config";
import { getSpeciesImage } from "@/constants/specieImages";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  ComponentProps,
  useCallback,
  useMemo,
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
import { commonSpecies } from "@/components/addCatch/constants";
import SpeciesPlaybook from "./SpeciesPlaybook";

type SpeciesCount = {
  name: string;
  count: number;
};

type Milestone = {
  type: "new_species" | "personal_best";
  title: string;
  date_caught: string;
};

type ProgressOverview = {
  species: SpeciesCount[];
  tackle_split: {
    lure: number;
    bait: number;
  };
  size_progress: {
    weight: MeasurementProgress;
    length: MeasurementProgress;
  };
  monthly_goal: {
    current: number;
    target: number;
  };
  milestones: Milestone[];
};

type MeasurementProgress = {
  average: number | null;
  change: number | null;
  points: {
    month: string;
    average: number | null;
  }[];
};

export default function FishingProgressCards() {
  const {
    token,
    loading: authLoading,
  } = useAuth();

  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [measurement, setMeasurement] = useState<"weight" | "length">("weight");

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();

      setOverview(null);
      setError(false);
      setLoading(authLoading || Boolean(token));

      if (authLoading || !token) {
        return () => controller.abort();
      }

      void (async () => {
        try {
          const response = await fetch(
            `${API_BASE}/stats/progress-overview`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Progress unavailable");
          }

          const data = await response.json();

          if (!controller.signal.aborted) {
            setOverview(normalizeOverview(data));
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

  const collection = useMemo(
    () => buildCollection(overview?.species || []),
    [overview?.species],
  );

  const caughtCount = collection.filter((item) => item.caught).length;
  const collectionPercent = Math.round(
    caughtCount * 100 / commonSpecies.length,
  );
  const goalCurrent = overview?.monthly_goal.current || 0;
  const goalTarget = overview?.monthly_goal.target || 10;
  const goalPercent = Math.min(
    100,
    Math.round(goalCurrent * 100 / goalTarget),
  );
  const lureCount = overview?.tackle_split.lure || 0;
  const baitCount = overview?.tackle_split.bait || 0;
  const tackleTotal = lureCount + baitCount;
  const lurePercent = tackleTotal
    ? Math.round(lureCount * 100 / tackleTotal)
    : 0;
  const baitPercent = tackleTotal
    ? 100 - lurePercent
    : 0;
  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
  });
  const sizeProgress = overview?.size_progress[measurement];

  return (
    <>
      <View style={styles.card}>
        <CardHeader
          title="Your Species Collection"
          subtitle="See which common species you have logged"
          icon="fish-outline"
        />

        {loading ? (
          <Loading />
        ) : error ? (
          <Retry onPress={() => setAttempt((value) => value + 1)} />
        ) : (
          <>
            <View style={styles.collectionSummary}>
              <Text style={styles.summaryValue}>
                {caughtCount}
                <Text style={styles.summaryTotal}>
                  {` of ${commonSpecies.length}`}
                </Text>
              </Text>

              <Text style={styles.percentText}>
                {collectionPercent}% complete
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${collectionPercent}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.speciesGrid}>
              {collection.slice(0, 6).map((item) => (
                <SpeciesTile
                  key={item.name}
                  item={item}
                />
              ))}
            </View>
          </>
        )}
      </View>

      <SpeciesPlaybook />

      <View style={styles.card}>
        <CardHeader
          title="Bait vs. Lure"
          subtitle="How your logged tackle choices compare"
          icon="git-compare-outline"
        />

        {loading ? (
          <Loading />
        ) : error ? (
          <Retry onPress={() => setAttempt((value) => value + 1)} />
        ) : tackleTotal === 0 ? (
          <Text style={styles.message}>
            Add bait or lure details to your catches to see this comparison.
          </Text>
        ) : (
          <View style={styles.tackleRows}>
            <TackleRow
              icon="fish-outline"
              label="Lures"
              count={lureCount}
              percent={lurePercent}
              color="#28c7ee"
            />

            <TackleRow
              icon="leaf-outline"
              label="Bait"
              count={baitCount}
              percent={baitPercent}
              color="#27e889"
            />
          </View>
        )}
      </View>

      <View style={styles.card}>
        <CardHeader
          title="Monthly Goal"
          subtitle={`Keep building your ${currentMonth} catch history`}
          icon="locate-outline"
        />

        {loading ? (
          <Loading />
        ) : error ? (
          <Retry onPress={() => setAttempt((value) => value + 1)} />
        ) : (
          <View style={styles.goalContent}>
            <GoalRing
              current={goalCurrent}
              target={goalTarget}
              percent={goalPercent}
            />

            <View style={styles.goalCopy}>
              <Text style={styles.goalTitle}>
                {goalCurrent >= goalTarget
                  ? "Monthly goal reached!"
                  : `${goalTarget - goalCurrent} ${goalTarget - goalCurrent === 1 ? "catch" : "catches"} to reach your goal`}
              </Text>

              <Text style={styles.goalDescription}>
                {goalCurrent >= goalTarget
                  ? "Every additional catch extends your progress this month."
                  : "Your catches update this goal automatically."}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <CardHeader
          title="Recent Milestones"
          subtitle="New additions and personal bests"
          icon="trophy-outline"
        />

        {loading ? (
          <Loading />
        ) : error ? (
          <Retry onPress={() => setAttempt((value) => value + 1)} />
        ) : !overview?.milestones.length ? (
          <Text style={styles.message}>
            Log species and measurements to create your first milestones.
          </Text>
        ) : (
          <View style={styles.milestones}>
            {overview.milestones.map((milestone) => (
              <View
                key={`${milestone.type}-${milestone.title}`}
                style={styles.milestone}
              >
                <View style={styles.milestoneIcon}>
                  <Ionicons
                    name={
                      milestone.type === "new_species"
                        ? "fish-outline"
                        : "trophy-outline"
                    }
                    size={18}
                    color="#26b5ee"
                  />
                </View>

                <View style={styles.milestoneCopy}>
                  <Text style={styles.milestoneTitle}>
                    {milestone.title}
                  </Text>

                  <Text style={styles.milestoneDate}>
                    {formatDate(milestone.date_caught)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sizeHeader}>
          <CardHeader
            title="Average Catch Size"
            subtitle="Your measured catches over the last six months"
            icon="trending-up-outline"
          />

          <View style={styles.measurementToggle}>
            <TouchableOpacity
              onPress={() => setMeasurement("weight")}
              accessibilityRole="button"
              style={[
                styles.measurementOption,
                measurement === "weight" && styles.measurementOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.measurementOptionText,
                  measurement === "weight" && styles.measurementOptionTextSelected,
                ]}
              >
                Weight
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMeasurement("length")}
              accessibilityRole="button"
              style={[
                styles.measurementOption,
                measurement === "length" && styles.measurementOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.measurementOptionText,
                  measurement === "length" && styles.measurementOptionTextSelected,
                ]}
              >
                Length
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <Loading />
        ) : error ? (
          <Retry onPress={() => setAttempt((value) => value + 1)} />
        ) : !sizeProgress || sizeProgress.average === null ? (
          <Text style={styles.message}>
            Add {measurement} measurements to see your six-month trend.
          </Text>
        ) : (
          <>
            <View style={styles.averageSummary}>
              <View>
                <Text style={styles.averageValue}>
                  {Number(sizeProgress.average.toFixed(1))}
                  <Text style={styles.averageUnit}>
                    {measurement === "weight" ? " lb" : " in"}
                  </Text>
                </Text>

                <Text style={styles.averageLabel}>
                  six-month average
                </Text>
              </View>

              {sizeProgress.change !== null && (
                <View style={styles.changeBlock}>
                  <Text
                    style={[
                      styles.changeValue,
                      sizeProgress.change < 0 && styles.changeValueDown,
                    ]}
                  >
                    {sizeProgress.change > 0 ? "+" : ""}
                    {Number(sizeProgress.change.toFixed(1))}
                    {measurement === "weight" ? " lb" : " in"}
                  </Text>

                  <Text style={styles.changeLabel}>
                    first to latest month
                  </Text>
                </View>
              )}
            </View>

            <SizeTrendChart
              progress={sizeProgress}
            />
          </>
        )}
      </View>
    </>
  );
}

function SizeTrendChart({
  progress,
}: {
  progress: MeasurementProgress;
}) {
  const width = 300;
  const height = 105;
  const chartTop = 10;
  const chartBottom = 76;
  const values = progress.points
    .map((point) => point.average)
    .filter((value): value is number => value !== null);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const plotted = progress.points
    .map((point, index) => {
      if (point.average === null) {
        return null;
      }

      return {
        x: 17 + index * 53.2,
        y: chartBottom - ((point.average - minimum) / range) * (chartBottom - chartTop),
      };
    })
    .filter((point): point is { x: number; y: number } => point !== null);
  const points = plotted
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <View style={styles.chartContainer}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {[23, 45, 67].map((y) => (
          <Line
            key={y}
            x1={12}
            y1={y}
            x2={288}
            y2={y}
            stroke="#163647"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        {plotted.length > 1 && (
          <Polyline
            points={points}
            fill="none"
            stroke="#28c7ee"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {plotted.map((point) => (
          <Circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="#28c7ee"
            stroke="#b8f1ff"
            strokeWidth={1}
          />
        ))}
      </Svg>

      <View style={styles.chartLabels}>
        {progress.points.map((point) => (
          <Text
            key={point.month}
            style={styles.chartLabel}
          >
            {point.month}
          </Text>
        ))}
      </View>
    </View>
  );
}

function TackleRow({
  icon,
  label,
  count,
  percent,
  color,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  count: number;
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.tackleRow}>
      <View
        style={[
          styles.tackleIcon,
          {
            borderColor: `${color}55`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <View style={styles.tackleContent}>
        <View style={styles.tackleHeading}>
          <Text style={styles.tackleLabel}>
            {label}
          </Text>

          <View style={styles.tackleNumbers}>
            <Text
              style={[
                styles.tacklePercent,
                {
                  color,
                },
              ]}
            >
              {percent}%
            </Text>

            <Text style={styles.tackleCount}>
              {count} {count === 1 ? "catch" : "catches"}
            </Text>
          </View>
        </View>

        <View style={styles.tackleTrack}>
          <View
            style={[
              styles.tackleFill,
              {
                width: `${percent}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function CardHeader({
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
          color="#26b5ee"
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
    </View>
  );
}

function SpeciesTile({
  item,
}: {
  item: CollectionItem;
}) {
  const image = getSpeciesImage(item.name);

  return (
    <View
      style={[
        styles.speciesTile,
        !item.caught && styles.speciesTileLocked,
      ]}
    >
      <View style={styles.speciesImageContainer}>
        {image ? (
          <Image
            source={image}
            style={[
              styles.speciesImage,
              !item.caught && styles.speciesImageLocked,
            ]}
            resizeMode="contain"
          />
        ) : (
          <Ionicons
            name="fish-outline"
            size={28}
            color={item.caught ? "#26b5ee" : "#536775"}
          />
        )}
      </View>

      <Text
        style={styles.speciesName}
        numberOfLines={1}
      >
        {item.name}
      </Text>

      <Text
        style={item.caught ? styles.caught : styles.notLogged}
        numberOfLines={1}
      >
        {item.caught
          ? `${item.count} ${item.count === 1 ? "catch" : "catches"}`
          : "Not logged"}
      </Text>
    </View>
  );
}

function GoalRing({
  current,
  target,
  percent,
}: {
  current: number;
  target: number;
  percent: number;
}) {
  const radius = 39;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.goalRing}>
      <Svg
        width={94}
        height={94}
        viewBox="0 0 94 94"
      >
        <Circle
          cx={47}
          cy={47}
          r={radius}
          stroke="#123447"
          strokeWidth={8}
          fill="none"
        />

        <Circle
          cx={47}
          cy={47}
          r={radius}
          stroke="#28c7ee"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          rotation={-90}
          origin="47, 47"
        />
      </Svg>

      <View style={styles.goalNumbers}>
        <Text style={styles.goalCurrent}>
          {current}
          <Text style={styles.goalTarget}>
            /{target}
          </Text>
        </Text>

        <Text style={styles.goalLabel}>
          CATCHES
        </Text>
      </View>
    </View>
  );
}

function Loading() {
  return (
    <ActivityIndicator
      color="#26b5ee"
      style={styles.status}
    />
  );
}

function Retry({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.message}>
        Unable to load progress. Tap to retry.
      </Text>
    </TouchableOpacity>
  );
}

type CollectionItem = {
  name: string;
  count: number;
  caught: boolean;
};

function normalizeOverview(value: unknown): ProgressOverview {
  const data = isObject(value) ? value : {};
  const monthlyGoal = isObject(data.monthly_goal)
    ? data.monthly_goal
    : {};
  const tackleSplit = isObject(data.tackle_split)
    ? data.tackle_split
    : {};
  const sizeProgress = isObject(data.size_progress)
    ? data.size_progress
    : {};

  return {
    species: Array.isArray(data.species)
      ? data.species.filter(isSpeciesCount)
      : [],
    tackle_split: {
      lure: toNonNegativeNumber(tackleSplit.lure),
      bait: toNonNegativeNumber(tackleSplit.bait),
    },
    size_progress: {
      weight: normalizeMeasurementProgress(sizeProgress.weight),
      length: normalizeMeasurementProgress(sizeProgress.length),
    },
    monthly_goal: {
      current: toNonNegativeNumber(monthlyGoal.current),
      target: toPositiveNumber(monthlyGoal.target, 10),
    },
    milestones: Array.isArray(data.milestones)
      ? data.milestones.filter(isMilestone)
      : [],
  };
}

function normalizeMeasurementProgress(value: unknown): MeasurementProgress {
  const data = isObject(value) ? value : {};
  const points = Array.isArray(data.points)
    ? data.points
      .filter(isMeasurementPoint)
      .map((point) => ({
        month: point.month,
        average: point.average,
      }))
    : [];

  return {
    average: toNullableNumber(data.average),
    change: toNullableNumber(data.change),
    points,
  };
}

function buildCollection(species: SpeciesCount[]): CollectionItem[] {
  const counts = new Map(
    species.map((item) => [
      normalize(item.name),
      item.count,
    ]),
  );

  return commonSpecies
    .map((name) => ({
      name,
      count: counts.get(normalize(name)) || 0,
      caught: counts.has(normalize(name)),
    }))
    .sort((first, second) => {
      if (first.caught !== second.caught) {
        return first.caught ? -1 : 1;
      }

      if (first.count !== second.count) {
        return second.count - first.count;
      }

      return first.name.localeCompare(second.name);
    });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSpeciesCount(value: unknown): value is SpeciesCount {
  return isObject(value)
    && typeof value.name === "string"
    && typeof value.count === "number"
    && Number.isFinite(value.count);
}

function isMilestone(value: unknown): value is Milestone {
  return isObject(value)
    && (value.type === "new_species" || value.type === "personal_best")
    && typeof value.title === "string"
    && typeof value.date_caught === "string";
}

function isMeasurementPoint(value: unknown): value is {
  month: string;
  average: number | null;
} {
  return isObject(value)
    && typeof value.month === "string"
    && (
      value.average === null
      || (
        typeof value.average === "number"
        && Number.isFinite(value.average)
      )
    );
}

function toNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
}

function toNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function toPositiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
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
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#062d46",
    borderWidth: 1,
    borderColor: "#0a5d87",
    marginRight: 10,
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
  collectionSummary: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  summaryValue: {
    color: "#eaf8ff",
    fontSize: 20,
    fontWeight: "800",
  },
  summaryTotal: {
    color: "#8e9fa9",
    fontSize: 12,
    fontWeight: "500",
  },
  percentText: {
    color: "#26b5ee",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#123447",
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#28c7ee",
  },
  speciesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },
  speciesTile: {
    flexBasis: "31%",
    flexGrow: 1,
    minWidth: 0,
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#061e2b",
    borderWidth: 1,
    borderColor: "#0b4057",
  },
  speciesTileLocked: {
    borderColor: "#18313e",
    opacity: 0.72,
  },
  speciesImageContainer: {
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  speciesImage: {
    width: 72,
    height: 42,
  },
  speciesImageLocked: {
    opacity: 0.3,
  },
  speciesName: {
    color: "#e0edf3",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
  },
  caught: {
    color: "#27e889",
    fontSize: 8,
    marginTop: 3,
  },
  notLogged: {
    color: "#748590",
    fontSize: 8,
    marginTop: 3,
  },
  tackleRows: {
    gap: 15,
  },
  tackleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tackleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#061e2b",
    borderWidth: 1,
  },
  tackleContent: {
    flex: 1,
    marginLeft: 11,
  },
  tackleHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  tackleLabel: {
    color: "#e0edf3",
    fontSize: 12,
    fontWeight: "700",
  },
  tackleNumbers: {
    alignItems: "flex-end",
  },
  tacklePercent: {
    fontSize: 14,
    fontWeight: "800",
  },
  tackleCount: {
    color: "#8e9fa9",
    fontSize: 8,
    marginTop: 1,
  },
  tackleTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#123447",
  },
  tackleFill: {
    height: "100%",
    borderRadius: 3,
  },
  goalContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalRing: {
    width: 94,
    height: 94,
    alignItems: "center",
    justifyContent: "center",
  },
  goalNumbers: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  goalCurrent: {
    color: "#f2f8fb",
    fontSize: 21,
    fontWeight: "800",
  },
  goalTarget: {
    color: "#8e9fa9",
    fontSize: 13,
    fontWeight: "600",
  },
  goalLabel: {
    color: "#8e9fa9",
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  goalCopy: {
    flex: 1,
    marginLeft: 16,
  },
  goalTitle: {
    color: "#e8f3f8",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  goalDescription: {
    color: "#8e9fa9",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 6,
  },
  milestones: {
    gap: 8,
  },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#061e2b",
  },
  milestoneIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#082d45",
  },
  milestoneCopy: {
    flex: 1,
    marginLeft: 10,
  },
  milestoneTitle: {
    color: "#e0edf3",
    fontSize: 11,
    fontWeight: "600",
  },
  milestoneDate: {
    color: "#8e9fa9",
    fontSize: 9,
    marginTop: 4,
  },
  sizeHeader: {
    marginBottom: 2,
  },
  measurementToggle: {
    flexDirection: "row",
    alignSelf: "flex-start",
    padding: 3,
    borderRadius: 9,
    backgroundColor: "#061e2b",
    borderWidth: 1,
    borderColor: "#0b3042",
    marginBottom: 12,
  },
  measurementOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 7,
  },
  measurementOptionSelected: {
    backgroundColor: "#28c7ee",
  },
  measurementOptionText: {
    color: "#8e9fa9",
    fontSize: 10,
    fontWeight: "600",
  },
  measurementOptionTextSelected: {
    color: "#02131f",
    fontWeight: "800",
  },
  averageSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  averageValue: {
    color: "#f2f8fb",
    fontSize: 27,
    fontWeight: "800",
  },
  averageUnit: {
    color: "#c5d2d9",
    fontSize: 14,
    fontWeight: "600",
  },
  averageLabel: {
    color: "#8e9fa9",
    fontSize: 9,
    marginTop: 2,
  },
  changeBlock: {
    alignItems: "flex-end",
  },
  changeValue: {
    color: "#27e889",
    fontSize: 17,
    fontWeight: "800",
  },
  changeValueDown: {
    color: "#f5a900",
  },
  changeLabel: {
    color: "#8e9fa9",
    fontSize: 8,
    marginTop: 3,
  },
  chartContainer: {
    marginTop: 12,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: -13,
  },
  chartLabel: {
    color: "#8e9fa9",
    fontSize: 8,
    width: 30,
    textAlign: "center",
  },
  status: {
    marginVertical: 20,
  },
  message: {
    color: "#90a9b7",
    fontSize: 12,
    lineHeight: 19,
    paddingVertical: 12,
  },
});
