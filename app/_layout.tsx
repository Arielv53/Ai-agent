import LevelUpOverlay from "@/components/LevelUpOverlay"; // 🆕 NEW
import {
  UserProgressProvider,
  useUserProgress,
} from "@/contexts/UserProgressContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";
import { AuthProvider } from "../contexts/AuthContext";

function AppWithOverlay() {
  const { progress, justLeveledUp, setJustLeveledUp } = useUserProgress(); // 🆕 NEW

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="addCatch"
          options={{
            title: "Add Catch",
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>

      {/* 🆕 LEVEL UP OVERLAY */}
      {justLeveledUp && (
        <LevelUpOverlay
          level={progress.level}
          onFinish={() => setJustLeveledUp(false)}
        />
      )}
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "JetBrainsMono-Regular": require("../assets/fonts/JetBrainsMono-Regular.ttf"),
  });

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <UserProgressProvider>
          <AppWithOverlay />
        </UserProgressProvider>
      </AuthProvider>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
