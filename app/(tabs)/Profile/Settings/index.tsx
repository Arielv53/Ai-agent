// Profile/Settings/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileSettings() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.done}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("EditProfile" as never)}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="person-outline" size={22} color="#ffffff55" />
            <Text style={styles.rowText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#ffffff55" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("Logout" as never)}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="log-out-outline" size={22} color="#f63f3fc8" />
            <Text style={styles.rowText}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#ffffff55" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f2a33", // dark background similar to screenshot
  },
  header: {
    height: 70,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  done: {
    position: "absolute",
    right: 12,
    top: 26,
  },
  doneText: { color: "#ffffffc9", fontSize: 16 },

  list: {
    marginTop: 8,
  },
  row: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 12,
    fontWeight: "500", // optional: slightly bolder text
  },
});
