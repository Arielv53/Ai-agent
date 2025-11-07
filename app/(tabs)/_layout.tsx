import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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
        tabBarStyle: {
          backgroundColor: "#000", // 🖤 makes the tab bar black
          borderTopWidth: 0,       // removes the divider line
          height: 50,              // optional: taller bar for better spacing
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


      {/* ✅ New AI Spot Finder Tab */}
      <Tabs.Screen
        name="SpotFinderScreen"
        options={{
          headerShown: false,
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
          headerRight: () => ( 
            <TouchableOpacity
              onPress={() => {
                router.push("/(tabs)/addCatch?reset=true"); 
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
                  top: -5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 35,
                    backgroundColor: "#000",
                    borderWidth: 1,
                    borderColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 5, // Android shadow
                  }}
                >
                  <Ionicons name="add" size={40} color="white" />
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
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}