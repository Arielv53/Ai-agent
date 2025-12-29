import CatchDetails from "@/components/CatchDetails";
import { Stack, useLocalSearchParams } from "expo-router";

export default function CatchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Catch Details",
          headerTitleAlign: "center",
        }}
      />

      <CatchDetails catchId={Number(id)} />
    </>
  );
}
