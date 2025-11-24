// app/(tabs)/Ai/_layout.tsx
import { Stack } from "expo-router";

export default function AiLayout() {
  return (
    <Stack>
      {/* This is the tab entry screen (landing page) */}
      <Stack.Screen
        name="index"
        options={{
          title: "AI Insights", // header title when you're on the index
        }}
      />

      {/* This is your existing ChatScreen */}
      <Stack.Screen
        name="ChatScreen"
        options={{
          title: "Chat", // header title when you're chatting
        }}
      />

      {/* Later you can add more screens:
      <Stack.Screen name="SomeTool" options={{ title: "Some AI Tool" }} />
      */}
    </Stack>
  );
}