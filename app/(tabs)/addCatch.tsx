import { API_BASE } from "@/constants/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Button,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddCatch() {
  const [file, setFile] = useState<any>(null);
  const [species, setSpecies] = useState("");
  const [baitUsed, setBaitUsed] = useState("");
  const [waterTemp, setWaterTemp] = useState("");
  const [airTemp, setAirTemp] = useState("");
  const [moonPhase, setMoonPhase] = useState("");
  const [tide, setTide] = useState("");
  const [size, setSize] = useState("");
  const [dateCaught, setDateCaught] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🐟 Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selected = result.assets[0];
      setFile({
        uri: selected.uri,
        name: selected.fileName || "catch.jpg",
        type: selected.type || "image/jpeg",
      });
    }
  };

  // 🧾 Submit catch
  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a photo of your catch.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type === "image" ? "image/jpeg" : file.type,
    } as any);

    formData.append("species", species);
    formData.append("bait_used", baitUsed);
    formData.append("water_temp", waterTemp);
    formData.append("air_temp", airTemp);
    formData.append("moon_phase", moonPhase);
    formData.append("tide", tide);
    formData.append("size", size);
    formData.append("date_caught", dateCaught ? dateCaught.toISOString() : "");

    try {
      const response = await fetch(`${API_BASE}/catches/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload catch");

      await response.json();
      setFile(null);
      setSpecies("");
      setBaitUsed("");
      setWaterTemp("");
      setAirTemp("");
      setMoonPhase("");
      setTide("");
      setSize("");
      setDateCaught(new Date());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDateCaught(selectedDate);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {file && <Text style={styles.fileName}>{file.name}</Text>}
      <TextInput
        placeholder="Species"
        value={species}
        onChangeText={setSpecies}
        style={styles.input}
      />
      <TextInput
        placeholder="Bait or Lure"
        value={baitUsed}
        onChangeText={setBaitUsed}
        style={styles.input}
      />
      <TextInput
        placeholder="Water Temp (°F)"
        value={waterTemp}
        onChangeText={setWaterTemp}
        style={styles.input}
      />
      <TextInput
        placeholder="Air Temp (°F)"
        value={airTemp}
        onChangeText={setAirTemp}
        style={styles.input}
      />
      <TextInput
        placeholder="Moon Phase"
        value={moonPhase}
        onChangeText={setMoonPhase}
        style={styles.input}
      />
      <TextInput
        placeholder="Tide"
        value={tide}
        onChangeText={setTide}
        style={styles.input}
      />
      <TextInput
        placeholder="Size"
        value={size}
        onChangeText={setSize}
        style={styles.input}
      />

      <View style={{ marginVertical: 8 }}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.button}>
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

      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.button}>Upload Photo</Text>
      </TouchableOpacity>

      <Button
        title={loading ? "Saving..." : "Add Catch"}
        onPress={handleSubmit}
        disabled={loading}
      />

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      {success ? (
        <Text style={{ color: "green" }}>Catch added successfully!</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    marginVertical: 4,
    color: "white",
    textAlign: "center" as const,
  },
  button: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    marginVertical: 4,
    color: "white",
    textAlign: "center" as const,
  },
  fileName: {
    color: "white",
    textAlign: "center" as const,
  },
};
