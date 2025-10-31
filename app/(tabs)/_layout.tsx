import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

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
        headerShown: true,
        headerStyle: { backgroundColor: "#000" }, // 🆕 new
        headerTintColor: "#fff",
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
      title: "Analytics",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="fish-outline" color={color} size={size} />
      ),
    }}
  />

  {/* ✅ New AI Spot Finder Tab */}
  <Tabs.Screen
    name="SpotFinderScreen"
    options={{
      title: "Spot Finder",
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="compass-outline" color={color} size={size} />
      ),
    }}
  />

  {/* Middle tab: AddCatch (+ button) */}
<Tabs.Screen
  name="addCatch"
  options={{
    headerShown: true,
    title: "New Catch",
    headerRight: () => ( // 🆕 new header button
      <TouchableOpacity
        onPress={() => {
          router.push("/(tabs)/addCatch?reset=true"); // 🆕 triggers form reset
        }}
        style={{ marginRight: 15 }}
      >
        <Text style={{ color: "#f5b20b", fontWeight: "700" }}>Cancel</Text>
      </TouchableOpacity>
    ),
    tabBarButton: (props) => {
      // Filter out any props with a value of null
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(([_, v]) => v !== null)
      );

      return (
        <TouchableOpacity
          {...filteredProps}
          onPress={() => router.push("/(tabs)/addCatch")}
          style={{
            top: -7,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
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

  {/* ✅ New Profile tab */}
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}