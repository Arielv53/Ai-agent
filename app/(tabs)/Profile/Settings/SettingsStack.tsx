import { Stack } from "expo-router";
import { Text } from "react-native";

export default function ProfileSettingsStack() {
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
              Settings
            </Text>
          ),
          headerStyle: {
            backgroundColor: "#020d16ff",
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="components/EditProfile"
        options={{
          headerTitle: "Edit Profile",
          headerStyle: {
            backgroundColor: "#020d16ff",
          },
          headerTintColor: "#d7f8ffb3",
        }}
      />
      <Stack.Screen
        name="components/Logout"
        options={{
          headerTitle: "Logout",
          headerStyle: {
            backgroundColor: "#020d16ff",
          },
          headerTintColor: "#d7f8ffb3",
        }}
      />
    </Stack>
  );
}
