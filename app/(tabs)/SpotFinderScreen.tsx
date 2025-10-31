import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SpotFinderScreen() {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Spot Finder</Text>
      <Text style={styles.subtitle}>
        Upload a fishing photo to identify potential locations.
      </Text>

      {/* ✅ Upload Area */}
      {!image ? (
        <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
          <Ionicons name="camera-outline" size={42} color="#888" />
          <Text style={styles.uploadText}>Tap to Upload Photo</Text>
        </TouchableOpacity>
      ) : (
        <Image source={{ uri: image }} style={styles.previewImage} />
      )}

      {/* ✅ Placeholder for AI Analysis */}
      <View style={styles.resultsBox}>
        <Text style={styles.resultsTitle}>AI Insights (coming soon)</Text>
        <Text style={styles.resultsText}>
          Once integrated, this section will analyze the photo background and
          suggest nearby fishing spots based on visual cues.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 12,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
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
    marginBottom: 20,
  },
  resultsBox: {
    marginTop: 16,
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
