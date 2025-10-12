import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
    name="catches"
    options={{
      title: "Catches",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="fish-outline" color={color} size={size} />
      ),
    }}
  />

  {/* Middle tab: AddCatch (+ button) */}
<Tabs.Screen
  name="addCatch"
  options={{
    title: "",
    tabBarButton: (props) => {
      // Filter out any props with a value of null
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(([_, v]) => v !== null)
      );

      return (
        <TouchableOpacity
          {...filteredProps}
          onPress={() => router.push("/addCatch")}
          style={{
            top: -20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 35,
              backgroundColor: Colors[colorScheme ?? "light"].tint,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 5, // Android shadow
            }}
          >
            <Ionicons name="add" size={40} color="black" />
          </View>
        </TouchableOpacity>
      );
    },
  }}
/>


  {/* Right tab: Chat */}
  <Tabs.Screen
    name="ChatScreen"
    options={{
      title: "Chat",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="chatbubble-outline" color={color} size={size} />
      ),
    }}
  />
    </Tabs>
  );
}
