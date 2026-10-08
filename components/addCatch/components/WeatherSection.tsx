import React from "react";
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import SectionHeader from "./SectionHeader";
import { moonPhases } from "../constants";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "waterTemp"
    | "setWaterTemp"
    | "airTemp"
    | "setAirTemp"
    | "moonPhase"
    | "setMoonPhase"
    | "showMoonDropdown"
    | "setShowMoonDropdown"
    | "tide"
    | "setTide"
    | "showTideDropdown"
    | "setShowTideDropdown"
    | "openSections"
    | "toggleSection"
  >;
};

export default function WeatherSection({ form }: Props) {
  const {
    waterTemp,
    setWaterTemp,
    airTemp,
    setAirTemp,
    moonPhase,
    setMoonPhase,
    showMoonDropdown,
    setShowMoonDropdown,
    tide,
    setTide,
    showTideDropdown,
    setShowTideDropdown,
    openSections,
    toggleSection,
  } = form;
  return (
    <>
      <View style={styles.sectionCard}>
        <SectionHeader openSections={openSections} toggleSection={toggleSection} section="weather" title="Weather Conditions" icon="partly-sunny-outline" />
        {openSections.weather && <View style={styles.rowContainer}>
          <TextInput
            placeholder="Water Temp (°F)"
            value={waterTemp}
            onChangeText={setWaterTemp}
            style={[styles.input, styles.halfInput]}
            placeholderTextColor="#a9a9a9"
          />
          <TextInput
            placeholder="Air Temp (°F)"
            value={airTemp}
            onChangeText={setAirTemp}
            style={[styles.input, styles.halfInput]}
            placeholderTextColor="#a9a9a9"
          />
          <View style={{ width: "48%" }}>
            <TouchableOpacity
              onPress={() => setShowMoonDropdown(true)}
              style={styles.input}
            >
              <Text
                style={
                  moonPhase
                    ? styles.inputText // Normal white text for selected value
                    : styles.placeholderText // Gray placeholder style like other fields
                }
              >
                {moonPhase ? `Moon Phase: ${moonPhase}` : "Moon phase"}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={showMoonDropdown}
              transparent
              animationType="slide"
              onRequestClose={() => setShowMoonDropdown(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Select Moon Phase</Text>
                  <View style={styles.moonGrid}>
                    {moonPhases.map((phase) => (
                      <TouchableOpacity
                        key={phase.name}
                        onPress={() => {
                          setMoonPhase(phase.name);
                          setShowMoonDropdown(false);
                        }}
                        style={styles.moonItem}
                      >
                        <Image source={phase.image} style={styles.moonImage} />
                        <Text style={styles.moonLabel}>{phase.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowMoonDropdown(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
          <View style={{ width: "48%" }}>
            <TouchableOpacity
              onPress={() => setShowTideDropdown(true)}
              style={styles.input}
            >
              <Text style={tide ? styles.inputText : styles.placeholderText}>
                {tide ? `Tide: ${tide}` : "Tide"}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={showTideDropdown}
              transparent
              animationType="slide"
              onRequestClose={() => setShowTideDropdown(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Select Tide</Text>

                  {/* ✅ List of tide options */}
                  {["High", "Outgoing", "Low", "Incoming"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setTide(option);
                        setShowTideDropdown(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    onPress={() => setShowTideDropdown(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

        </View>}
      </View>
    </>
  );
}
