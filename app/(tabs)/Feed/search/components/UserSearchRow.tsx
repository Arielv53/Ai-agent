import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { SearchUser } from "../_hooks/useUserSearch";

type Props = { user: SearchUser; onPress: () => void };

export default function UserSearchRow({ user, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}
      accessibilityRole="button" accessibilityLabel={`View ${user.username}'s profile`}>
      {user.profile_photo ? (
        <Image source={{ uri: user.profile_photo }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar}><Ionicons name="person-circle-outline" size={44} color="#9aa4ad" /></View>
      )}
      <Text style={styles.username} numberOfLines={1}>{user.username}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9aa4ad" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: "#1f2933" },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  username: { flex: 1, color: "#fff", fontSize: 17, fontWeight: "600" },
});
