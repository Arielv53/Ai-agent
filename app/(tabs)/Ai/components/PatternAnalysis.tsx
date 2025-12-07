import { API_BASE } from "@/constants/config";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function PatternAnalysis() {
  const [speciesOptions, setSpeciesOptions] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [openSpecies, setOpenSpecies] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const typingSpeed = 14; // ms per character (adjust for faster/slower)


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

  
    useEffect(() => {
    if (!insights?.summary_text) {
        setDisplayedText("");
        return;
    }

    const text = insights.summary_text;
    let i = 0;

    setDisplayedText("");

    const interval = setInterval(() => {
        i++;
        setDisplayedText(text.slice(0, i));

        if (i >= text.length) clearInterval(interval);
    }, typingSpeed);

    return () => clearInterval(interval);
    }, [insights, typingSpeed]);




  return (
    <View style={styles.cardWrapper}>
      <Text style={styles.sectionTitle}>Pattern Analysis</Text>

      {/* --- NEW: Species buttons dropdown area --- */}
      <View style={styles.dropdown}>
        <Text style={styles.dropdownLabel}>Select species:</Text>

            {/* --- NEW: Main dropdown toggle button --- */}
            <TouchableOpacity
                style={styles.dropdownToggle}
                onPress={() => setOpenSpecies((prev) => !prev)}
            >
            <Text style={styles.dropdownToggleText}>
                {selectedSpecies ? selectedSpecies : "All Species"}
            </Text>

            {/* Arrow indicator */}
            <Text style={styles.dropdownArrow}>
                {openSpecies ? "▲" : "▼"}
            </Text>
            </TouchableOpacity>

            {/* --- NEW: Collapsible species list --- */}
            {openSpecies && (
            <View style={styles.dropdownList}>
                <ScrollView
                    style={{ maxHeight: 160 }} // --- NEW: limits height + enables scroll ---
                    showsVerticalScrollIndicator={false}
                >
                    {speciesOptions.map((sp) => (
                    <TouchableOpacity
                        key={sp}
                        style={[
                            styles.speciesButton,
                            selectedSpecies === sp && styles.speciesButtonActive,
                        ]}
                        onPress={() => {
                            setSelectedSpecies(sp);
                            setOpenSpecies(false); // --- NEW: auto close on select ---
                        }}
                    >
                        <Text style={styles.speciesText}>{sp}</Text>
                    </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[
                            styles.speciesButton,
                            selectedSpecies === null && styles.speciesButtonActive,
                        ]}
                        onPress={() => {
                            setSelectedSpecies(null);
                            setOpenSpecies(false); // --- NEW: auto close on select ---
                        }}
                    >
                        <Text style={styles.speciesText}>All Species</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            )}
        </View>

      {/* --- NEW: Insights output --- */}
      <View style={styles.insightBox}>
        {loading ? (
          <Text style={styles.summaryText}>...</Text>
        ) : insights ? (
          <Text style={styles.summaryText}>{displayedText}</Text>
        ) : (
          <Text style={styles.summaryText}>No insights yet.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#020d16ff", // UPDATED – dark card background
    borderRadius: 20,           // UPDATED – more rounded like example
    padding: 15,                // UPDATED
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,             // NEW – glowing border
    borderColor: "rgba(0, 200, 255, 0.07)", // NEW
    shadowColor: "#00c8ff",     // NEW – neon glow shadow
    shadowOpacity: 0.3,         // NEW
    shadowRadius: 20,           // NEW
    shadowOffset: { height: 0, width: 0 }, // NEW
  },

  sectionTitle: {
    fontSize: 17,               // UPDATED
    fontWeight: "700",
    marginBottom: 8,
    color: "#9ee7ff",           // NEW – light text
    letterSpacing: 0.5,         // NEW
  },

  dropdown: {
    marginTop: 10,
    paddingHorizontal: 16,
  },

  dropdownLabel: {
    color: "#9ee7ff",
    fontSize: 16,
    marginBottom: 6,
  },

  dropdownToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#062336",
    borderRadius: 10,

    borderWidth: 1,
    borderColor: "rgba(0,200,255,0.35)", // neon border
  },

  dropdownToggleText: {
    color: "#d7f8ff",
    fontSize: 16,
    fontWeight: "600",
  },

  dropdownArrow: {
    color: "#00c8ff", // neon arrow
    fontSize: 14,
    marginLeft: 8,
  },

  // --- NEW: expanded list container ---
  dropdownList: {
    marginTop: 8,
    backgroundColor: "#020d16ff",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,200,255,0.28)",
  },

  speciesButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "#062336",
  },

  speciesButtonActive: {
    backgroundColor: "#004f6e",
    borderWidth: 1,
    borderColor: "#00c8ff",
  },

  speciesText: {
    color: "#d7f8ff",
    fontSize: 15,
  },

  insightBox: {
    marginTop: 12,
    backgroundColor: "#062336", // NEW – styled like species buttons
    padding: 14,                // NEW
    borderRadius: 12,           // NEW
    borderWidth: 1,             // NEW
    borderColor: "rgba(0, 200, 255, 0.25)", // NEW
  },

  summaryText: {
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    color: "#d7f8ff",
    // fontFamily: "JetBrainsMono-Regular",  AI FONT
    letterSpacing: 0.5,
  },
});

