// Profile/Settings/components/EditProfile.tsx
import { API_BASE } from "@/constants/config";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfile() {
  const [username, setUsername] = useState("Arielv");
  const [country, setCountry] = useState("United States");
  const [state, setState] = useState("New York");
  const [profilePhoto, setProfilePhoto] = useState(
    "https://randomuser.me/api/portraits/men/1.jpg",
  );
  const [coverPhoto, setCoverPhoto] = useState(
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  );
  const navigation = useNavigation();

  const updateProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/1`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          country,
          state,
          profile_photo: profilePhoto,
          cover_photo: coverPhoto,
        }),
      });

      const data = await response.json();
      console.log("Updated user:", data);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // 🆕 pick image helper
  const pickImage = async (type: "profile" | "cover") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission required to access photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "cover" ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      if (type === "profile") {
        setProfilePhoto(uri);
      } else {
        setCoverPhoto(uri);
      }
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={updateProfile}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [username, country, state, profilePhoto, coverPhoto]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: coverPhoto }} style={styles.coverImage} />

          {/* 🆕 image picker */}
          <TouchableOpacity
            style={styles.coverOverlay}
            onPress={() => pickImage("cover")}
          >
            <Ionicons name="camera-outline" size={22} color="#fff" />
            <Text style={styles.coverText}>Change cover photo</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: profilePhoto }} style={styles.profileImage} />

          {/* 🆕 image picker */}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => pickImage("profile")}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Editable Form Fields */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>
            <TextInput
              style={styles.rowInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Country</Text>
            <TextInput
              style={styles.rowInput}
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>State</Text>
            <TextInput
              style={styles.rowInput}
              value={state}
              onChangeText={setState}
              placeholder="State"
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

function Row({ label, value, arrow = false }: any) {
  return (
    <TouchableOpacity style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>

      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>

        {arrow && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#9aa4a8"
            style={{ marginLeft: 6 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2a33",
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
