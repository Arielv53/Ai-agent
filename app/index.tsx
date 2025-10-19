import { Redirect } from "expo-router";

export default function Index() {
  // Redirects to your main tab layout (assuming that’s where you start)
  return <Redirect href="/(tabs)/catches" />;
}
