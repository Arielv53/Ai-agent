import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

type Feature = {
  id: string;
  title: string;
  description: string;
  emoji: string;
};

const FEATURES: Feature[] = [
  {
    id: "1",
    title: "Log Every Catch",
    description:
      "Automatically organize your catches with photos, locations, and conditions.",
    emoji: "📸",
  },
  {
    id: "2",
    title: "Spot Patterns",
    description:
      "Discover trends in bait, time, tide, and weather based on your history.",
    emoji: "📊",
  },
  {
    id: "3",
    title: "Fish Smarter",
    description:
      "Get AI-powered insights that help you decide when, where, and how to fish.",
    emoji: "🧠",
  },
];

export default function PreviewScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = index === FEATURES.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip */}
      {!isLastSlide && (
        <TouchableOpacity
          style={styles.skip}
          onPress={() => router.replace("/(onboarding)/auth")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={FEATURES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Progress dots */}
      <View style={styles.dots}>
        {FEATURES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.cta}
        onPress={() => {
          if (!isLastSlide) {
            flatListRef.current?.scrollToIndex({
              index: index + 1,
              animated: true,
            });
          } else {
            router.replace("/(onboarding)/auth");
          }
        }}
      >
        <Text style={styles.ctaText}>
          {isLastSlide ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020d16",
    paddingTop: 48,
  },
  skip: {
    position: "absolute",
    top: 48,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: "#9fb3c8",
    fontSize: 14,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#9fb3c8",
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2a3a4a",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#ffffff",
  },
  cta: {
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1f6feb",
    alignItems: "center",
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});