// app/(tabs)/Ai/_layout.tsx
import { Stack } from "expo-router";
import { Text } from "react-native";

export default function StatsLayout() {
  return (
    <Stack>
        <Stack.Screen
            name="index"
            options={{
                headerTitleAlign: "center",
            headerTitle: () => (
                <Text
                style={{
                    color: "#d7f8ffb3",
                    fontSize: 24,
                    fontWeight: "600",
                    letterSpacing: 0.7,
                }}
                >
                Stats
                </Text>
            ),

            headerStyle: {
                backgroundColor: "#020d16ff",
            },
            headerShadowVisible: false,
            }}
        />
    </Stack>
  );
}
