import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export function StatsHeaderTitle() {
  return (
    <View style={styles.titleContainer}>
      <View style={styles.iconGlow}>
        <Ionicons
          name="stats-chart"
          size={25}
          color="#28c7ff"
        />
      </View>

      <Text style={styles.title}>
        Stats
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  iconGlow: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#28c7ff",
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 5,
  },
  title: {
    color: "#f5fbff",
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
