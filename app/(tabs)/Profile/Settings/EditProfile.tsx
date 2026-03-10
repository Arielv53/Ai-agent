// Profile/Settings/components/EditProfile.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfile() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            }}
            style={styles.coverImage}
          />

          <TouchableOpacity style={styles.coverOverlay}>
            <Ionicons name="camera-outline" size={22} color="#fff" />
            <Text style={styles.coverText}>Change cover photo</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/1.jpg",
            }}
            style={styles.profileImage}
          />

          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Row label="Username" value="_Arielv_" />

          <Row label="Country" value="United States" arrow />

          <Row label="State" value="New York" arrow />
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
    bottom: 12,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
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
    marginTop: -40,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1d3c44",
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
    fontSize: 16,
  },
});
