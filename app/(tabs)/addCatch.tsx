import { API_BASE } from "@/constants/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
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
  const [showMoonDropdown, setShowMoonDropdown] = useState(false);
  const [tide, setTide] = useState("");
  const [showTideDropdown, setShowTideDropdown] = useState(false);
  const [length, setLength] = useState(""); 
  const [weight, setWeight] = useState(""); 
  const [windSpeed, setWindSpeed] = useState(""); 
  const [method, setMethod] = useState("");
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [location, setLocation] = useState(""); 
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
    formData.append("location", location);
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
      setLocation("");
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
    setLocation("");
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

  const moonPhases = [
    { name: "New Moon", image: require("../../assets/moon_phases/new_moon.png") },
    { name: "First Quarter", image: require("../../assets/moon_phases/first_quarter.png") },
    { name: "Last Quarter", image: require("../../assets/moon_phases/last_quarter.png") },
    { name: "Full Moon", image: require("../../assets/moon_phases/full_moon.png") },
  ];



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
            placeholderTextColor="#a9a9a9"
          />
          <TextInput
            placeholder="Bait or Lure"
            value={baitUsed}
            onChangeText={setBaitUsed}
            style={[styles.input, styles.halfInput]}
            placeholderTextColor="#a9a9a9"
          />
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
          {/* 👇 REPLACE the old Moon Phase input with this block 👇 */}
          <View style={{ width: "48%" }}>
            <TouchableOpacity
              onPress={() => setShowMoonDropdown(true)}
              style={styles.input}
            >
              <Text
              style={
                moonPhase
                  ? styles.inputText          // Normal white text for selected value
                  : styles.placeholderText    // Gray placeholder style like other fields
              }
            >
              {/* ✅ Placeholder now matches your TextInput behavior */}
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
          {/* 👇 REPLACE the old Tide TextInput with this block 👇 */}
<View style={{ marginVertical: 4, width: "48%" }}>
  <TouchableOpacity
    onPress={() => setShowTideDropdown(true)}
    style={styles.input}
  >
    <Text
      style={
        tide
          ? styles.inputText
          : styles.placeholderText
      }
    >
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
<View style={{ marginVertical: 4, width: "48%" }}>
  <TouchableOpacity
    onPress={() => setShowMethodDropdown(true)}
    style={styles.input}
  >
    <Text
      style={
        method
          ? styles.inputText
          : styles.placeholderText
      }
    >
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

        <TextInput
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          placeholderTextColor="#a9a9a9"
        />

        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.button}>Upload Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>
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
    fontSize: 14,
    textAlign: "center" as const,
  },
  inputText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
  },
  placeholderText: {
    color: "#a9a9a9",
    textAlign: "center",
    fontSize: 14,
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
  addButtonText: {
    color: "black",     
    fontSize: 18,       
    fontWeight: "700",  
  },
  disabledButton: {
    backgroundColor: "#555",      
  },
  buttonText: {
    color: "white",
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
  dropdownButton: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 8,
    marginVertical: 4,
    height: 40,
    color: "white",
    textAlign: "center" as const,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#2f2e2eff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "white",
  },
  moonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  moonItem: {
    alignItems: "center",
    marginVertical: 8,
  },
  moonImage: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  moonLabel: {
    fontSize: 10,
    color: "white",
  },
  cancelButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  dropdownItem: {
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "gray",
  alignItems: "center",
},
dropdownItemText: {
  color: "white",
  fontSize: 16,
},
});