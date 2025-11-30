import { API_BASE } from "@/constants/config";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ConditionsPattern() {
  const [speciesOptions, setSpeciesOptions] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const userId = 1; // TODO: replace with your real user auth

  // --- NEW: load species list on mount ---
  useEffect(() => {
    fetchUserSpecies();
  }, []);

  // --- NEW: fetch insights when species changes ---
  useEffect(() => {
    fetchInsights();
  }, [selectedSpecies]);

  const fetchUserSpecies = async () => {
    const res = await fetch(`${API_BASE}/user/species`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const raw = await res.text();
    console.log("RAW /user/species RESPONSE:", raw);

    try {
        const data = JSON.parse(raw);
        setSpeciesOptions(data.species || []);
    } catch (e) {
        console.error("JSON PARSE ERROR /user/species:", e);
    }

  };

  const fetchInsights = async () => {
    setLoading(true);

    const res = await fetch(`${API_BASE}/ai/conditions_summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        species: selectedSpecies,
      }),
    });

    const raw = await res.text();
    console.log("RAW /ai/conditions_summary RESPONSE:", raw);

    try {
        const data = JSON.parse(raw);
        setInsights(data);
    } catch (e) {
        console.error("JSON PARSE ERROR /ai/conditions_summary:", e);
    }

    setLoading(false);

  };

  return (
    <View style={styles.cardWrapper}>
      <Text style={styles.sectionTitle}>Conditions Pattern</Text>

      {/* --- NEW: Species buttons dropdown area --- */}
      <View style={styles.dropdown}>
        <Text style={styles.dropdownLabel}>Select species:</Text>

        {speciesOptions.map((sp) => (
          <TouchableOpacity
            key={sp}
            style={[
              styles.speciesButton,
              selectedSpecies === sp && styles.speciesButtonActive,
            ]}
            onPress={() => setSelectedSpecies(sp)}
          >
            <Text>{sp}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.speciesButton,
            selectedSpecies === null && styles.speciesButtonActive,
          ]}
          onPress={() => setSelectedSpecies(null)}
        >
          <Text>All Species</Text>
        </TouchableOpacity>
      </View>

      {/* --- NEW: Insights output --- */}
      <View style={styles.insightBox}>
        {loading ? (
          <ActivityIndicator size="small" />
        ) : insights ? (
          <Text style={styles.summaryText}>{insights.summary_text}</Text>
        ) : (
          <Text style={styles.summaryText}>No insights yet.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  dropdown: { marginBottom: 16 },
  dropdownLabel: { fontSize: 14, marginBottom: 6, fontWeight: "500" },

  speciesButton: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginVertical: 3,
  },
  speciesButtonActive: {
    backgroundColor: "#cce5ff",
  },

  insightBox: {
    marginTop: 4,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 20,
  },
});
