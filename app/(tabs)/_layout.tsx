import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
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
        tabBarShowLabel: false, // hide text labels under icons
        tabBarStyle: {
          backgroundColor: "#000", // 🖤 makes the tab bar black
          borderTopWidth: 0,       // removes the divider line
          height: 40,              // optional: taller bar for better spacing
        },
      }}>
      <Tabs.Screen 
        name="Newsfeed"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="globe-outline" color={color} size={size} />
          ),
        }}
      />

      {/* Right tab: Chat */}
      <Tabs.Screen
        name="ChatScreen"
        options={{
          title: "AI Insights",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" color={color} size={size} />
          ),
        }}
      />

      {/* ✅ New Profile tab */}
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}