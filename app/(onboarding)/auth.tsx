import { API_BASE } from "@/constants/config";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AuthScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (type: "signup" | "login") => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // TODO: store user in AuthContext
      console.log("Authenticated user:", data);

      router.replace("/(onboarding)/setup");
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>
        Create an account or log in to save your progress.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Choose a username"
        placeholderTextColor="#6b7c93"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => submit("signup")}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => submit("login")}
        disabled={loading}
      >
        <Text style={styles.secondaryText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020d16",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#9fb3c8",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#0b1a26",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 12,
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#1f6feb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: {
    color: "#9fb3c8",
    fontSize: 14,
  },
});