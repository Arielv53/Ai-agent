import { API_BASE } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SpotFinderScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setAnalysis(
        // 🆕 friendly message explaining how AI works best
        "Tip: The AI can better identify fishing spots if landmarks like bridges, buildings, or docks are visible in the photo background."
      );
    }
  };

  // 🧠 Connects to Flask endpoint
  const analyzePhoto = async () => {
    if (!image) {
      Alert.alert("No Photo", "Please upload a fishing photo first.");
      return;
    }

    try {
      setLoading(true);
      setAnalysis("Analyzing photo... 🧠");

      // 🆕 prepare form data
      const formData = new FormData();
      formData.append("photo", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      // ⚠️ update this to your Flask server’s IP (on same WiFi for testing)
      const response = await fetch(`${API_BASE}/ai/spot_finder`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (data.result) {
        setAnalysis(data.result);
      } else {
        setAnalysis("No landmark detected. Try another photo.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not analyze the photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Spot Finder</Text>
      <Text style={styles.subtitle}>
        Upload a fishing photo to identify potential fishing locations.
      </Text>

      {!image ? (
        <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
          <Ionicons name="camera-outline" size={42} color="#888" />
          <Text style={styles.uploadText}>Tap to Upload Photo</Text>
        </TouchableOpacity>
      ) : (
        <Image source={{ uri: image }} style={styles.previewImage} />
      )}

      {image && (
        <TouchableOpacity onPress={analyzePhoto} style={styles.analyzeButton}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.analyzeButtonText}>Analyze Photo</Text>
        </TouchableOpacity>
      )}

      <View style={styles.resultsBox}>
        <Text style={styles.resultsTitle}>AI Insights</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <Text style={styles.resultsText}>
            {analysis
              ? analysis
              : "Once integrated, this section will analyze the photo background and suggest fishing spots based on visible landmarks."}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#0c0c0cff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "left",
    marginVertical: 12,
    marginBottom: 50,
    color: "#fcf8f8ff",
  },
  subtitle: {
    textAlign: "center",
    color: "#9a9a9aff",
    fontSize: 14,
    marginBottom: 24,
  },
  uploadBox: {
    width: "80%",
    height: 180,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  uploadText: {
    color: "#888",
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 8,
  },
  previewImage: {
    width: "80%",
    height: 180,
    alignSelf: "center",
    borderRadius: 12,
    marginBottom: 12,
  },
  analyzeButton: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#007BFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  resultsBox: {
    marginTop: 8,
    backgroundColor: "#f4f4f4",
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 8,
  },
  resultsText: {
    color: "#555",
    lineHeight: 20,
  },
});
