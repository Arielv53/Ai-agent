// app/(tabs)/Ai/_layout.tsx
import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function AiLayout() {
  return (
    <Stack>
        <Stack.Screen
            name="index"
            options={{
            headerTitle: () => (
                <Text
                style={{
                    color: "#d7f8ffb3",
                    fontSize: 24,
                    fontWeight: "700",
                    letterSpacing: 0.7,
                    marginRight: 200,
                }}
                >
                AI Insights
                </Text>
            ),

            headerStyle: {
                backgroundColor: "#02131f",
            },
            headerShadowVisible: false,
            }}
        />

      <Stack.Screen
        name="ChatScreen"
        options={{
          headerTitleAlign: "left",
          headerTitle: () => (
            <Text
              style={{
                color: "#d7f8ff",
                fontSize: 22,
                fontWeight: "600",
              }}
            >
              Chat
            </Text>
          ),
          headerLeft: () => <View style={{ width: 0 }} />,
          // @ts-ignore
          headerTitleContainerStyle: {
            paddingLeft: 12,
          },
          headerStyle: { backgroundColor: "#02131f" },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
