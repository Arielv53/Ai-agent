import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SectionHeader from "./SectionHeader";
import SelectionModal from "./SelectionModal";
import type { CatchForm } from "../_hooks/useCatchForm";
import { commonBaits, commonLures, commonSpecies } from "../constants";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "species"
    | "setSpecies"
    | "showSpeciesDropdown"
    | "setShowSpeciesDropdown"
    | "baitUsed"
    | "setBaitUsed"
    | "showBaitDropdown"
    | "setShowBaitDropdown"
    | "lureUsed"
    | "setLureUsed"
    | "showLureDropdown"
    | "setShowLureDropdown"
    | "openSections"
    | "toggleSection"
  >;
};

export default function BasicInfoSection({ form }: Props) {
  const {
    species,
    setSpecies,
    showSpeciesDropdown,
    setShowSpeciesDropdown,
    baitUsed,
    setBaitUsed,
    showBaitDropdown,
    setShowBaitDropdown,
    lureUsed,
    setLureUsed,
    showLureDropdown,
    setShowLureDropdown,
    openSections,
    toggleSection,
  } = form;
  return (
    <>
      <View style={styles.sectionCard}>
        <SectionHeader openSections={openSections} toggleSection={toggleSection} section="basic" title="Basic Info" icon="fish-outline" />
        {openSections.basic && <View style={styles.rowContainer}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Select species"
            onPress={() => setShowSpeciesDropdown(true)}
            style={[styles.input, styles.fullInput, styles.selectorInput]}
          >
            <Text style={styles.selectorText}>
              {species || "Species"}
            </Text>
          </TouchableOpacity>

          <SelectionModal
            title="Select Species"
            options={commonSpecies}
            visible={showSpeciesDropdown}
            onSelect={(option) => {
              setSpecies(option);
              setShowSpeciesDropdown(false);
            }}
            onClose={() => setShowSpeciesDropdown(false)}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Select bait"
            onPress={() => setShowBaitDropdown(true)}
            style={[styles.input, styles.halfInput, styles.selectorInput]}
          >
            <Text style={styles.selectorText}>{baitUsed || "Bait"}</Text>
          </TouchableOpacity>
          <SelectionModal
            title="Select Bait"
            options={commonBaits}
            visible={showBaitDropdown}
            onSelect={(option) => {
              setBaitUsed(option);
              setShowBaitDropdown(false);
            }}
            onClose={() => setShowBaitDropdown(false)}
          />

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Select lure"
            onPress={() => setShowLureDropdown(true)}
            style={[styles.input, styles.halfInput, styles.selectorInput]}
          >
            <Text style={styles.selectorText}>{lureUsed || "Lure"}</Text>
          </TouchableOpacity>
          <SelectionModal
            title="Select Lure"
            options={commonLures}
            visible={showLureDropdown}
            onSelect={(option) => {
              setLureUsed(option);
              setShowLureDropdown(false);
            }}
            onClose={() => setShowLureDropdown(false)}
          />
        </View>}
      </View>
    </>
  );
}
