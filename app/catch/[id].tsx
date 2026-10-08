import CatchDetails from "@/components/CatchDetails";
import { Stack, useLocalSearchParams } from "expo-router";

export default function CatchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Catch details",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#020d16" },
          headerTintColor: "#7cddf5",
          headerTitleStyle: { color: "#f4f7fa", fontSize: 21, fontWeight: "700" },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <CatchDetails catchId={Number(id)} />
    </>
  );
}
