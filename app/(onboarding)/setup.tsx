import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

type Experience = "beginner" | "intermediate" | "advanced";
type WaterType = "freshwater" | "saltwater" | "both";

const GOALS = [
  "Catch more fish",
  "Learn patterns",
  "Track progress",
  "Level up",
];

export default function SetupScreen() {
  const router = useRouter();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [waterType, setWaterType] = useState<WaterType | null>(null);
  const [goals, setGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
  };

  const continueNext = () => {
    // TODO: save to OnboardingContext / backend
    console.log({
      experience,
      waterType,
      goals,
    });

    router.replace("/(onboarding)/guide");
  };

  return (
    <View style={styles.container}>
        <ScrollView>
            <Text style={styles.title}>Let’s personalize things 🎣</Text>
      <Text style={styles.subtitle}>
        This helps us tailor insights just for you.
      </Text>

      {/* Experience */}
      <Text style={styles.section}>Your experience</Text>
      <View style={styles.row}>
        {["beginner", "intermediate", "advanced"].map((level) => (
          <Option
            key={level}
            label={capitalize(level)}
            selected={experience === level}
            onPress={() => setExperience(level as Experience)}
          />
        ))}
      </View>

      {/* Water type */}
      <Text style={styles.section}>Where do you fish?</Text>
      <View style={styles.row}>
        {["freshwater", "saltwater", "both"].map((type) => (
          <Option
            key={type}
            label={capitalize(type)}
            selected={waterType === type}
            onPress={() => setWaterType(type as WaterType)}
          />
        ))}
      </View>

      {/* Goals */}
      <Text style={styles.section}>What are you here for?</Text>
      {GOALS.map((goal) => (
        <TouchableOpacity
          key={goal}
          style={[
            styles.goal,
            goals.includes(goal) && styles.goalActive,
          ]}
          onPress={() => toggleGoal(goal)}
        >
          <Text
            style={[
              styles.goalText,
              goals.includes(goal) && styles.goalTextActive,
            ]}
          >
            {goal}
          </Text>
        </TouchableOpacity>
      ))}

      {/* CTA */}
      <TouchableOpacity style={styles.cta} onPress={continueNext}>
        <Text style={styles.ctaText}>Continue</Text>
      </TouchableOpacity>

      {/* Skip */}
      <TouchableOpacity
        style={styles.skip}
        onPress={() => router.replace("/(onboarding)/guide")}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
        </ScrollView>
      
    </View>
  );
}

/* Small helper component */
function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected && styles.optionTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
    marginBottom: 28,
  },
  section: {
    color: "#9fb3c8",
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: "#0b1a26",
    alignItems: "center",
  },
  optionActive: {
    backgroundColor: "#1f6feb",
  },
  optionText: {
    color: "#9fb3c8",
    fontSize: 14,
  },
  optionTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  goal: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#0b1a26",
    marginBottom: 8,
  },
  goalActive: {
    backgroundColor: "#132f4c",
    borderWidth: 1,
    borderColor: "#1f6feb",
  },
  goalText: {
    color: "#9fb3c8",
    fontSize: 14,
  },
  goalTextActive: {
    color: "#ffffff",
    fontWeight: "500",
  },
  cta: {
    marginTop: 24,
    backgroundColor: "#1f6feb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  skip: {
    marginTop: 16,
    alignItems: "center",
  },
  skipText: {
    color: "#6b7c93",
    fontSize: 13,
  },
});