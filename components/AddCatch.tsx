import { API_BASE } from "@/constants/config";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Button, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';

interface AddCatchProps {
  onCatchAdded: () => void; // callback after successful upload
}

const AddCatch: React.FC<AddCatchProps> = ({ onCatchAdded }) => {
  const [file, setFile] = useState<any>(null);
  const [species, setSpecies] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [baitUsed, setBaitUsed] = useState("");
  const [gear, setGear] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🐟 Pick image from camera or gallery
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
      uri: file.uri, // ✅ updated for React Native upload
      name: file.name,
      type: file.type,
    } as any);
    formData.append("species", species);
    formData.append("location_description", locationDescription);
    formData.append("bait_used", baitUsed);
    formData.append("gear", gear);
    formData.append("notes", notes);

    try {
      const response = await fetch(`${API_BASE}/catches/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload catch");
      }

      await response.json();

      // reset form
      setFile(null);
      setSpecies("");
      setLocationDescription("");
      setBaitUsed("");
      setGear("");
      setNotes("");
      setSuccess(true);
      onCatchAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <ScrollView contentContainerStyle={{ padding: 16 }}>
    <TouchableOpacity onPress={pickImage}>
      <Text style={{ borderWidth: 1, borderColor: "gray", padding: 8, marginVertical: 4, color: 'white', textAlign: 'center'}}>Upload Photo</Text>
    </TouchableOpacity>

    {file && <Text>{file.name}</Text>}

    <TextInput
      placeholder="Species"
      value={species}
      onChangeText={setSpecies}
      style={{ borderWidth: 1, borderColor: "gray", padding: 8, marginVertical: 4, color: 'white', textAlign: 'center' }}
    />
    <TextInput
      placeholder="Location description"
      value={locationDescription}
      onChangeText={setLocationDescription}
      style={{ borderWidth: 1, borderColor: "gray", padding: 8, marginVertical: 4, color: 'white', textAlign: 'center' }}
    />
    <TextInput
      placeholder="Bait used"
      value={baitUsed}
      onChangeText={setBaitUsed}
      style={{ borderWidth: 1, borderColor: "gray", padding: 8, marginVertical: 4, color: 'white', textAlign: 'center' }}
    />
    <TextInput
      placeholder="Gear"
      value={gear}
      onChangeText={setGear}
      style={{ borderWidth: 1, borderColor: "gray", padding: 8, marginVertical: 4, color: 'white', textAlign: 'center' }}
    />
    <TextInput
      placeholder="Notes"
      value={notes}
      onChangeText={setNotes}
      multiline
      style={{ borderWidth: 1, borderColor: "gray", padding: 8, marginVertical: 4, height: 80, color: 'white', textAlign: 'center' }}
    />

    <Button
      title={loading ? "Saving..." : "Add Catch"}
      onPress={handleSubmit}
      disabled={loading}
    />

    {error ? <Text>{error}</Text> : null}
    {success ? <Text>Catch added successfully!</Text> : null}
  </ScrollView>
);
};

export default AddCatch;
