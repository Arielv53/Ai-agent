import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const STEPS = [
  {
    emoji: "📅",
    title: "Log your best catches monthly",
    description:
      "Add your most successful catches each month so your Fishing Agent can spot long-term patterns.",
  },
  {
    emoji: "🧠",
    title: "We remember what you forget",
    description:
      "Details like bait, tide, wind, and time fade over time — we keep them connected forever.",
  },
  {
    emoji: "📈",
    title: "Your agent gets smarter over time",
    description:
      "The more data you feed it, the better the insights, predictions, and recommendations.",
  },
];

export default function GuideScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Train your Fishing Agent 🎣</Text>
      <Text style={styles.subtitle}>
        A little input now leads to smarter fishing later.
      </Text>

      <View style={styles.steps}>
        {STEPS.map((step, index) => (
          <View key={index} style={styles.step}>
            <Text style={styles.emoji}>{step.emoji}</Text>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>
                {step.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.cta}
        onPress={() => router.replace("/(onboarding)/launch")}
      >
        <Text style={styles.ctaText}>Let’s start fishing smarter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020d16",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#9fb3c8",
    marginBottom: 32,
  },
  steps: {
    flex: 1,
    justifyContent: "center",
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  emoji: {
    fontSize: 28,
    marginRight: 16,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#9fb3c8",
    lineHeight: 20,
  },
  cta: {
    backgroundColor: "#1f6feb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});