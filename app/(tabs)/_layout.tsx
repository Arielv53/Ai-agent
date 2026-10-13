import { HapticTab } from "@/components/HapticTab";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  ComponentProps,
} from "react";
import {
  StyleSheet,
  View,
} from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#ffffff",
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#27c8ff",
        tabBarInactiveTintColor: "#77909f",
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="Feed"
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: "Feed",
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              activeName="globe"
              inactiveName="globe-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Ai"
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: "Stats",
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              activeName="stats-chart"
              inactiveName="stats-chart-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: "Profile",
          tabBarIcon: ({
            color,
            focused,
          }) => (
            <TabIcon
              activeName="person"
              inactiveName="person-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  activeName,
  inactiveName,
  color,
  focused,
}: {
  activeName: IconName;
  inactiveName: IconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={[
        styles.iconContainer,
        focused && styles.activeIconContainer,
      ]}
    >
      <Ionicons
        name={focused ? activeName : inactiveName}
        color={color}
        size={focused ? 22 : 21}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 64,
    right: 64,
    bottom: 20,
    height: 50,
    paddingTop: 5,
    paddingBottom: 0,
    marginHorizontal: 80,
    borderWidth: 1,
    borderColor: "#12678c",
    borderRadius: 27,
    backgroundColor: "#062238b5",
    shadowColor: "#16bfff",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 12,
  },
  tabItem: {
    height: 52,
    borderRadius: 26,
  },
  iconContainer: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },
  activeIconContainer: {
    backgroundColor: "rgba(18, 184, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(39, 200, 255, 0.42)",
  },
});
