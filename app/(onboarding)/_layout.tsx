import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
        contentStyle: {
          backgroundColor: "#020d16", // match your app base
        },
      }}
    >

      {/* 3. Auth */}
      <Stack.Screen
        name="auth"
        options={{
          animation: "slide_from_right",
        }}
      />

      {/* 4. Account setup */}
      <Stack.Screen
        name="setup"
        options={{
          animation: "slide_from_right",
        }}
      />

      {/* 6. Launch transition */}
      <Stack.Screen
        name="launch"
        options={{
          animation: "fade",
        }}
      />
    </Stack>
  );
}
