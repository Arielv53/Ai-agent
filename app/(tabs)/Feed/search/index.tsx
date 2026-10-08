import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUserSearch } from "./_hooks/useUserSearch";
import UserSearchRow from "./components/UserSearchRow";

export default function UserSearchScreen() {
  const [query, setQuery] = useState("");
  const { users, loading, error, signedIn, retry } = useUserSearch(query);
  const emptyMessage = !signedIn ? "Sign in to search users."
    : !query.trim() ? "Search for someone by username."
    : "No users found. Try another username.";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Search users", headerStyle: { backgroundColor: "#020d16" },
        headerTintColor: "#fff", headerShadowVisible: false, headerBackButtonDisplayMode: "minimal" }} />
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={22} color="#9aa4ad" />
        <TextInput value={query} onChangeText={setQuery} style={styles.input}
          placeholder="Search by username" placeholderTextColor="#9aa4ad"
          accessibilityLabel="Search by username" autoFocus autoCapitalize="none"
          autoCorrect={false} maxLength={100} returnKeyType="search" />
        {!!query && <TouchableOpacity onPress={() => setQuery("")} accessibilityRole="button"
          accessibilityLabel="Clear search" style={styles.clear}>
          <Ionicons name="close-circle" size={22} color="#9aa4ad" />
        </TouchableOpacity>}
      </View>
      {loading ? <ActivityIndicator style={styles.status} color="#fff" /> : error ? (
        <View style={styles.status}>
          <Text style={styles.message}>{error}</Text>
          <TouchableOpacity onPress={retry} accessibilityRole="button" style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={users} keyExtractor={(user) => String(user.id)}
          keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
          renderItem={({ item }) => <UserSearchRow user={item} onPress={() => router.push({
            pathname: "/UserProfile/[id]", params: { id: String(item.id) },
          })} />}
          ListEmptyComponent={<Text style={[styles.message, styles.status]}>{emptyMessage}</Text>}
          ListFooterComponent={users.length === 50
            ? <Text style={[styles.message, styles.status]}>Showing 50 users. Refine your search to find more.</Text> : null} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020d16", paddingHorizontal: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#0c1c29",
    borderRadius: 12, paddingHorizontal: 12, marginVertical: 14 },
  input: { flex: 1, color: "#fff", fontSize: 16, paddingVertical: 14 },
  clear: { padding: 4 },
  status: { marginTop: 32 },
  message: { color: "#9aa4ad", textAlign: "center", fontSize: 15 },
  retry: { alignSelf: "center", padding: 16 },
  retryText: { color: "#00c8ff", fontWeight: "600" },
});
