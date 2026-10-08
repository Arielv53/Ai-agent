import React from "react";
import { TextInput, View } from "react-native";
import SectionHeader from "./SectionHeader";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "species"
    | "setSpecies"
    | "baitUsed"
    | "setBaitUsed"
    | "openSections"
    | "toggleSection"
  >;
};

export default function BasicInfoSection({ form }: Props) {
  const {
    species,
    setSpecies,
    baitUsed,
    setBaitUsed,
    openSections,
    toggleSection,
  } = form;
  return (
    <>
      <View style={styles.sectionCard}>
        <SectionHeader openSections={openSections} toggleSection={toggleSection} section="basic" title="Basic Info" icon="fish-outline" />
        {openSections.basic && <View style={styles.rowContainer}>
          <TextInput
            placeholder="Species"
            value={species}
            onChangeText={setSpecies}
            style={[styles.input, styles.halfInput]}
            placeholderTextColor="#a9a9a9"
          />
          <TextInput
            placeholder="Bait or Lure"
            value={baitUsed}
            onChangeText={setBaitUsed}
            style={[styles.input, styles.halfInput]}
            placeholderTextColor="#a9a9a9"
          />
        </View>}
      </View>
    </>
  );
}
