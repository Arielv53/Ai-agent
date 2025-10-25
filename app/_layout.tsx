import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
   const [loaded] = [true] 
  // useFonts({SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),}); 

  useEffect(() => {
    console.log('RootLayout mounted');
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* 🆕 Wrap Tabs inside Stack */}
      <Stack>
        {/* 🆕 Main Tab Navigator (no header itself) */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        {/* 🆕 AddCatch screen — now outside tabs */}
        <Stack.Screen
          name="addCatch"
          options={{
            title: "Add Catch",
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
            headerRight: () => (
              <TouchableOpacity style={{ marginRight: 12 }}>
                <Text style={{ color: "#f5b20b", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            ),
            presentation: "modal", // 🆕 optional: makes it slide up
          }}
        />

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
