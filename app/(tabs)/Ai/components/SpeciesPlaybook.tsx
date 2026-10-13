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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SpeciesOption = {
  name: string;
  count: number;
};

type Playbook = {
  species: string;
  catch_count: number;
  best_location: string | null;
  top_tackle: string | null;
  tackle_type: string | null;
  best_tide: string | null;
  strongest_month: string | null;
  average_weight: number | null;
  best_weight: number | null;
  average_length: number | null;
  private_note_count: number;
  recent_notes: string[];
};

export default function SpeciesPlaybook() {
  const {
    token,
    user,
    loading: authLoading,
  } = useAuth();

  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const isPremium = Boolean(user?.is_premium);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();

      setError(false);
      setLoading(authLoading || Boolean(token && isPremium));

      if (authLoading || !token || !isPremium) {
        return () => controller.abort();
      }

      void (async () => {
        try {
          const query = selectedSpecies
            ? `?species=${encodeURIComponent(selectedSpecies)}`
            : "";
          const response = await fetch(
            `${API_BASE}/stats/species-playbook${query}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Species playbook unavailable");
          }

          const body = await response.json();

          if (!controller.signal.aborted) {
            setSpecies(
              Array.isArray(body.available_species)
                ? body.available_species
                : [],
            );
            setPlaybook(body.playbook || null);
            setSelectedSpecies((current) => (
              current || body.playbook?.species || null
            ));
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
      selectedSpecies,
      attempt,
    ]),
  );

  const speciesImage = playbook
    ? getSpeciesImage(playbook.species)
    : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="book-outline"
            size={18}
            color="#f5b20b"
          />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>
            Species Playbook
          </Text>

          <Text style={styles.subtitle}>
            Your private history for each species
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

      {!isPremium ? (
        <View style={styles.lockedState}>
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#f5b20b"
          />

          <View style={styles.lockedCopy}>
            <Text style={styles.lockedTitle}>
              Build a playbook for every species
            </Text>

            <Text style={styles.lockedDescription}>
              Premium connects your locations, tackle, conditions, sizes, and private notes.
            </Text>
          </View>
        </View>
      ) : loading && !playbook ? (
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
            Unable to load the playbook. Tap to retry.
          </Text>
        </TouchableOpacity>
      ) : !playbook ? (
        <Text style={styles.message}>
          Log a catch with a species to create your first playbook.
        </Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.speciesSelector}
          >
            {species.map((option) => {
              const selected = option.name === playbook.species;

              return (
                <TouchableOpacity
                  key={option.name}
                  onPress={() => setSelectedSpecies(option.name)}
                  accessibilityRole="button"
                  style={[
                    styles.speciesPill,
                    selected && styles.speciesPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.speciesPillText,
                      selected && styles.speciesPillTextSelected,
                    ]}
                  >
                    {option.name} · {option.count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.speciesSummary}>
            <View style={styles.fishContainer}>
              {speciesImage ? (
                <Image
                  source={speciesImage}
                  style={styles.fishImage}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name="fish-outline"
                  size={42}
                  color="#26b5ee"
                />
              )}
            </View>

            <View style={styles.speciesCopy}>
              <Text style={styles.speciesName}>
                {playbook.species}
              </Text>

              <Text style={styles.catchCount}>
                {playbook.catch_count} {playbook.catch_count === 1 ? "catch" : "catches"} logged
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>
            Your Winning Details
          </Text>

          <View style={styles.detailGrid}>
            <PlaybookDetail
              icon="location-outline"
              label="Best Location"
              value={playbook.best_location}
            />

            <PlaybookDetail
              icon="color-wand-outline"
              label={`Top ${playbook.tackle_type || "Tackle"}`}
              value={playbook.top_tackle}
            />

            <PlaybookDetail
              icon="water-outline"
              label="Best Tide"
              value={playbook.best_tide}
            />

            <PlaybookDetail
              icon="calendar-outline"
              label="Strongest Month"
              value={playbook.strongest_month}
            />
          </View>

          <Text style={styles.sectionLabel}>
            Size Profile
          </Text>

          <View style={styles.sizeRow}>
            <SizeMetric
              label="Avg. Weight"
              value={formatMeasurement(playbook.average_weight, "lb")}
            />

            <SizeMetric
              label="Personal Best"
              value={formatMeasurement(playbook.best_weight, "lb")}
              featured
            />

            <SizeMetric
              label="Avg. Length"
              value={formatMeasurement(playbook.average_length, "in")}
            />
          </View>

          <View style={styles.privateSection}>
            <View style={styles.privateHeader}>
              <Ionicons
                name="lock-closed-outline"
                size={15}
                color="#f5b20b"
              />

              <Text style={styles.privateTitle}>
                Private Knowledge
              </Text>

              <Text style={styles.noteCount}>
                {playbook.private_note_count} {playbook.private_note_count === 1 ? "note" : "notes"}
              </Text>
            </View>

            {playbook.recent_notes.length ? (
              playbook.recent_notes.map((note, index) => (
                <View
                  key={`${index}-${note}`}
                  style={styles.note}
                >
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color="#f5b20b"
                  />

                  <Text
                    style={styles.noteText}
                    numberOfLines={2}
                  >
                    {note}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.privateEmpty}>
                Add private notes to this species to build your knowledge base.
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

function PlaybookDetail({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string | null;
}) {
  return (
    <View style={styles.detail}>
      <Ionicons
        name={icon}
        size={18}
        color="#26b5ee"
      />

      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text
        style={styles.detailValue}
        numberOfLines={1}
      >
        {value || "Not enough data"}
      </Text>
    </View>
  );
}

function SizeMetric({
  label,
  value,
  featured = false,
}: {
  label: string;
  value: string;
  featured?: boolean;
}) {
  return (
    <View style={styles.sizeMetric}>
      <Text style={styles.sizeLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.sizeValue,
          featured && styles.sizeValueFeatured,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function formatMeasurement(value: number | null, unit: string) {
  return value === null
    ? "—"
    : `${Number(value.toFixed(1))} ${unit}`;
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
  speciesSelector: {
    gap: 7,
    paddingTop: 13,
    paddingBottom: 2,
  },
  speciesPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#1b2118",
    borderWidth: 1,
    borderColor: "#38371f",
  },
  speciesPillSelected: {
    backgroundColor: "#082d45",
    borderColor: "#26b5ee",
  },
  speciesPillText: {
    color: "#aaa58f",
    fontSize: 10,
  },
  speciesPillTextSelected: {
    color: "#dff6ff",
    fontWeight: "700",
  },
  speciesSummary: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    marginTop: 11,
    borderRadius: 11,
    backgroundColor: "#071d26",
    borderWidth: 1,
    borderColor: "#0b4057",
  },
  fishContainer: {
    width: 90,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  fishImage: {
    width: 88,
    height: 56,
  },
  speciesCopy: {
    flex: 1,
    marginLeft: 10,
  },
  speciesName: {
    color: "#eff8fb",
    fontSize: 17,
    fontWeight: "800",
  },
  catchCount: {
    color: "#90a9b7",
    fontSize: 11,
    marginTop: 4,
  },
  sectionLabel: {
    color: "#eee9d9",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  detail: {
    flexBasis: "46%",
    flexGrow: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#1b2118",
    borderWidth: 1,
    borderColor: "#38371f",
  },
  detailLabel: {
    color: "#aaa58f",
    fontSize: 8,
    marginTop: 6,
  },
  detailValue: {
    color: "#eee9d9",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  sizeRow: {
    flexDirection: "row",
    gap: 7,
  },
  sizeMetric: {
    flex: 1,
    minWidth: 0,
    padding: 9,
    borderRadius: 9,
    backgroundColor: "#1b2118",
    alignItems: "center",
  },
  sizeLabel: {
    color: "#aaa58f",
    fontSize: 8,
  },
  sizeValue: {
    color: "#26b5ee",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
  },
  sizeValueFeatured: {
    color: "#f5b20b",
  },
  privateSection: {
    padding: 11,
    marginTop: 13,
    borderRadius: 10,
    backgroundColor: "#1b2118",
    borderWidth: 1,
    borderColor: "#38371f",
  },
  privateHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  privateTitle: {
    flex: 1,
    color: "#eee9d9",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  noteCount: {
    color: "#aaa58f",
    fontSize: 9,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 9,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: "#202619",
  },
  noteText: {
    flex: 1,
    color: "#ccc7b6",
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 7,
  },
  privateEmpty: {
    color: "#aaa58f",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 8,
  },
  lockedState: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 13,
    borderRadius: 10,
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
