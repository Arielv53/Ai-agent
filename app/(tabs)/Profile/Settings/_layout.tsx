import { Stack } from "expo-router";

export default function ProfileSettingsStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        options={{
          headerTitle: "Edit Profile",
          headerStyle: {
            backgroundColor: "#020d16ff",
          },
          headerTintColor: "#d7f8ffb3",
          headerBackButtonDisplayMode: "minimal", // hide index title on back button
        }}
      />
      <Stack.Screen
        name="Logout"
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
