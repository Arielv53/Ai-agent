import { invalidateFeed } from "@/app/(tabs)/Feed/_hooks/feedCache";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Profile/Settings/components/EditProfile.tsx
import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfile() {
  const { user, token, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [profileAsset, setProfileAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [coverAsset, setCoverAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const savePending = useRef(false);
  const navigation = useNavigation();
  const userId = user?.id;

  const updateProfile = useCallback(async () => {
    if (!ready || savePending.current) return;
    if (!user || !token) {
      console.error("A signed-in user is required to update a profile.");
      return;
    }

    savePending.current = true;
    setSaving(true);
    try {
      const form = new FormData();
      for (const [key, value] of Object.entries({ username, country, city, first_name: firstName, last_name: lastName })) {
        form.append(key, value);
      }
      for (const [field, asset] of [["profile_photo", profileAsset], ["cover_photo", coverAsset]] as const) {
        if (!asset) continue;
        const name = asset.fileName || `${field}.jpg`;
        if (Platform.OS === "web") {
          const blob = await (await fetch(asset.uri)).blob();
          form.append(field, blob, name);
        } else {
          form.append(field, { uri: asset.uri, name, type: asset.mimeType || "image/jpeg" } as any);
        }
      }
      const response = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) { const body = await response.json(); throw new Error(body.error || "Unable to update profile"); }
      const data = await response.json();
      invalidateFeed();
      setProfilePhoto(data.profile_photo || "");
      setCoverPhoto(data.cover_photo || "");
      setProfileAsset(null); setCoverAsset(null);
      setUser({ ...user, ...data });
      await AsyncStorage.setItem("AUTH_USER", JSON.stringify({ ...user, ...data }));
      Alert.alert("Profile saved");

    } catch (error) {
      Alert.alert("Unable to save profile", error instanceof Error ? error.message : "Please try again.");
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  }, [country, coverAsset, profileAsset, ready, setUser, city, firstName, lastName, token, user, username]);

  useEffect(() => {
    setReady(false);
    if (!userId || !token) return;
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/${userId}/profile`, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Unable to load profile");
        const data = await response.json();
        if (controller.signal.aborted) return;
        setReady(true);
        setProfileAsset(null); setCoverAsset(null);
        setUsername(data.username || "");
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setCountry(data.country || "");
        setCity(data.city || "");
        setProfilePhoto(data.profile_photo || "");
        setCoverPhoto(data.cover_photo || "");
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    void loadProfile();
    return () => controller.abort();
  }, [userId, token]);

  const pickImage = async (type: "profile" | "cover") => {
    if (saving || !ready) return;
    try {
      // The system image picker grants access to the selected photo without
      // requiring permission to read the user's entire photo library.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: type === "cover" ? [16, 9] : [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      if (type === "profile") {
        setProfilePhoto(asset.uri);
        setProfileAsset(asset);
      } else {
        setCoverPhoto(asset.uri);
        setCoverAsset(asset);
      }
    } catch (error) {
      Alert.alert("Unable to open photos", error instanceof Error ? error.message : "Please try again.");
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity disabled={saving || !ready} onPress={updateProfile}>
          <Text style={styles.saveButton}>{saving ? "Saving…" : "Save"}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, updateProfile, saving, ready]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          {coverPhoto ? <Image source={{ uri: coverPhoto }} style={styles.coverImage} /> : <View style={styles.coverPlaceholder} />}

          {/* 🆕 image picker */}
          <TouchableOpacity
            disabled={saving || !ready}
            style={styles.coverOverlay}
            onPress={() => pickImage("cover")}
          >
            <Ionicons name="camera-outline" size={22} color="#fff" />
            <Text style={styles.coverText}>Change cover photo</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.profileImageContainer}>
          {profilePhoto ? <Image source={{ uri: profilePhoto }} style={styles.profileImage} /> : <View style={styles.profilePlaceholder}><Ionicons name="person" size={46} color="#73ceef" /></View>}

          {/* 🆕 image picker */}
          <TouchableOpacity
            disabled={saving || !ready}
            style={styles.cameraButton}
            onPress={() => pickImage("profile")}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Editable Form Fields */}
        <View style={styles.section}>
          <View style={styles.row}><Text style={styles.rowLabel}>First name</Text><TextInput editable={!saving && ready} style={styles.rowInput} value={firstName} onChangeText={setFirstName} placeholder="First name" maxLength={100} /></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Last name</Text><TextInput editable={!saving && ready} style={styles.rowInput} value={lastName} onChangeText={setLastName} placeholder="Last name" maxLength={100} /></View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>
            <TextInput editable={!saving && ready}
              style={styles.rowInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Country</Text>
            <TextInput editable={!saving && ready}
              style={styles.rowInput}
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>City</Text>
            <TextInput editable={!saving && ready}
              style={styles.rowInput}
              value={city}
              onChangeText={setCity}
              placeholder="City"
            />
          </View>
        </View>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020d16ff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  saveButton: {
    fontSize: 17,
    color: "#bebfc0",
    fontWeight: "600",
  },

  coverContainer: {
    height: 180,
    width: "100%",
  },

  coverImage: {
    height: "100%",
    width: "100%",
  },
  coverPlaceholder: { height: "100%", width: "100%", backgroundColor: "#06334d" },

  coverOverlay: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center", // place icon and text in the center vertically
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  coverText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
  },

  profileImageContainer: {
    alignItems: "center",
    marginTop: -60,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#0f2a33",
  },
  profilePlaceholder: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#0f2a33", backgroundColor: "#092c43", alignItems: "center", justifyContent: "center" },

  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 140,
    backgroundColor: "#2b6f77",
    borderRadius: 14,
    padding: 4,
  },

  section: {
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: "#1d3c44",
  },
  // 🆕 input styles
  inputRow: {
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 14,
    color: "#6b7a80",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e3e6e8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1d3c44",
  },
  // 🆕 editable input inside row
  rowInput: {
    color: "#9aa4a8",
    fontSize: 15,
    textAlign: "right",
    minWidth: 120,
  },

  rowLabel: {
    color: "#d1d7da",
    fontSize: 16,
  },

  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowValue: {
    color: "#9aa4a8",
    fontSize: 15,
  },

  deleteButton: {
    marginTop: 40,
    alignItems: "center",
  },

  deleteText: {
    color: "#ff4d4d",
    fontSize: 18,
  },
});
