import React from "react";
import { Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import SectionHeader from "./SectionHeader";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "length"
    | "setLength"
    | "weight"
    | "setWeight"
    | "windSpeed"
    | "setWindSpeed"
    | "method"
    | "setMethod"
    | "showMethodDropdown"
    | "setShowMethodDropdown"
    | "location"
    | "setLocation"
    | "dateCaught"
    | "showDatePicker"
    | "setShowDatePicker"
    | "openSections"
    | "onChangeDate"
    | "toggleSection"
  >;
};

export default function CatchDetailsSection({ form }: Props) {
  const {
    length,
    setLength,
    weight,
    setWeight,
    windSpeed,
    setWindSpeed,
    method,
    setMethod,
    showMethodDropdown,
    setShowMethodDropdown,
    location,
    setLocation,
    dateCaught,
    showDatePicker,
    setShowDatePicker,
    openSections,
    onChangeDate,
    toggleSection,
  } = form;
  return (
    <>
      <View style={styles.sectionCard}>
        <SectionHeader openSections={openSections} toggleSection={toggleSection} section="details" title="Catch Details" icon="fish-outline" />
        {openSections.details && <View style={styles.rowContainer}>

          <TextInput
            placeholder="Length (inches)"
            value={length}
            onChangeText={(text) => setLength(text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            placeholderTextColor="#a9a9a9"
          />
          <TextInput
            placeholder="Weight (lbs)"
            value={weight}
            onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            placeholderTextColor="#a9a9a9"
          />
          <TextInput
            placeholder="Wind Speed (mph)"
            value={windSpeed}
            onChangeText={(text) => setWindSpeed(text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            placeholderTextColor="#a9a9a9"
          />
          {/* 👇 REPLACE the old Method TextInput with this block 👇 */}
          <View style={{ width: "48%" }}>
            <TouchableOpacity
              onPress={() => setShowMethodDropdown(true)}
              style={styles.input}
            >
              <Text style={method ? styles.inputText : styles.placeholderText}>
                {method ? `Method: ${method}` : "Method"}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={showMethodDropdown}
              transparent
              animationType="slide"
              onRequestClose={() => setShowMethodDropdown(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { maxHeight: "70%" }]}>
                  <Text style={styles.modalTitle}>Select Method</Text>

                  {/* ✅ Scrollable list of fishing methods */}
                  <ScrollView>
                    {[
                      "Surfcasting",
                      "Ice fishing",
                      "Casting",
                      "Bottom fishing",
                      "Trolling",
                      "Spear fishing",
                      "Fly fishing",
                      "Jig fishing",
                      "Hand lining",
                    ].map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          setMethod(option);
                          setShowMethodDropdown(false);
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownItemText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    onPress={() => setShowMethodDropdown(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </View>}

        {openSections.details && <>
          <View style={styles.rowContainer}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.halfInput}>
              <Text style={styles.input}>
                {dateCaught
                  ? `Date Caught: ${dateCaught.toDateString()}`
                  : "Date Caught"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateCaught || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
              />
            )}
          </View>

          <TextInput
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            style={[styles.input, styles.fullInput]}
            placeholderTextColor="#a9a9a9"
          />
        </>}
      </View>
    </>
  );
}
