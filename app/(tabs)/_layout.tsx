import { Ionicons } from "@expo/vector-icons";
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4fd6fbff",
        headerShown: true,
        headerStyle: { backgroundColor: "#000" }, // 🆕 new
        headerTintColor: "#fff",
        tabBarButton: HapticTab,
        tabBarShowLabel: false, // hide text labels under icons
        tabBarStyle: {
          backgroundColor: "#02131f", // 🖤 makes the tab bar black
          borderTopWidth: 0,       // removes the divider line
          height: 45,              // optional: taller bar for better spacing
          paddingTop: 4,
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
        name="Ai"  // matches app/(tabs)/Ai/index.tsx
        options={{
          headerShown: false,
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