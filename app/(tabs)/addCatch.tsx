import { API_BASE } from "@/constants/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function AddCatch() {
  const [file, setFile] = useState<any>(null);
  const [species, setSpecies] = useState("");
  const [baitUsed, setBaitUsed] = useState("");
  const [waterTemp, setWaterTemp] = useState("");
  const [airTemp, setAirTemp] = useState("");
  const [moonPhase, setMoonPhase] = useState("");
  const [tide, setTide] = useState("");
  const [length, setLength] = useState(""); 
  const [weight, setWeight] = useState(""); 
  const [windSpeed, setWindSpeed] = useState(""); 
  const [method, setMethod] = useState("");
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
    formData.append("length", length); 
    formData.append("weight", weight); 
    formData.append("wind_speed", windSpeed); 
    formData.append("method", method);
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
      setLength(""); 
      setWeight(""); 
      setWindSpeed(""); 
      setMethod("");
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

  const { reset } = useLocalSearchParams();  // get ?reset=true
  const router = useRouter();

  const clearForm = () => {
    setFile(null);
    setSpecies("");
    setBaitUsed("");
    setWaterTemp("");
    setAirTemp("");
    setMoonPhase("");
    setTide("");
    setLength("");
    setWeight("");
    setWindSpeed("");
    setMethod("");
    setDateCaught(null);
    setError("");
    setSuccess(false);
  };

  // 👀 Watch for reset param
  useEffect(() => {
    if (reset === "true") {
      clearForm();
      // 🧭 replace route to remove ?reset=true from URL
      router.replace("/(tabs)/addCatch");
    }
  }, [reset]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {file && ( 
          <Image
            source={{ uri: file.uri }}   
            style={styles.previewImage} 
            resizeMode="cover"           
          />
        )} 

        <View style={styles.rowContainer}>
          <TextInput
            placeholder="Species"
            value={species}
            onChangeText={setSpecies}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="Bait or Lure"
            value={baitUsed}
            onChangeText={setBaitUsed}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="Water Temp (°F)"
            value={waterTemp}
            onChangeText={setWaterTemp}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="Air Temp (°F)"
            value={airTemp}
            onChangeText={setAirTemp}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="Moon Phase"
            value={moonPhase}
            onChangeText={setMoonPhase}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="Tide"
            value={tide}
            onChangeText={setTide}
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            placeholder="Length (inches)"
            value={length}
            onChangeText={(text) => setLength(text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]} 
          />
          <TextInput
            placeholder="Weight (lbs)"
            value={weight}
            onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ""))} 
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]} 
          />
          <TextInput
            placeholder="Wind Speed (mph)"
            value={windSpeed}
            onChangeText={(text) => setWindSpeed(text.replace(/[^0-9.]/g, ""))} 
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]} 
          />
          <TextInput
            placeholder="Method"
            value={method}
            onChangeText={setMethod}
            style={[styles.input, styles.halfInput]} 
          />
        </View>

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

        <TouchableOpacity
          style={[styles.addButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Add Catch"}
          </Text>
        </TouchableOpacity>


        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        {success ? (
          <Text style={{ color: "green" }}>Catch added successfully!</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelText: {
    color: "#f5b20b",
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    marginVertical: 4,
    height: 40,
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
  rowContainer: {
    flexDirection: "row",   
    flexWrap: "wrap",       
    justifyContent: "space-between", 
  },
  halfInput: {
    width: "48%",            
  },
  addButton: {
    backgroundColor: "#f5b20bff",   
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#555",      
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "700",
  },
  previewImage: {                
  width: 150,
  height: 150,
  borderRadius: 12,            
  alignSelf: "center",
  marginBottom: 10,
  borderWidth: 1,
  borderColor: "gray",
  },
});