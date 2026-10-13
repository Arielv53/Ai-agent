// app/(tabs)/Ai/_layout.tsx
import {
  StatsHeaderTitle,
} from "./components/StatsHeader";
import { Stack } from "expo-router";

export default function StatsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitleAlign: "left",
          headerTitle: () => (
            <StatsHeaderTitle />
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
