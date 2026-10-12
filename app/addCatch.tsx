import { useCatchForm } from "@/components/addCatch/_hooks/useCatchForm";
import BasicInfoSection from "@/components/addCatch/components/BasicInfoSection";
import CatchCaption from "@/components/addCatch/components/CatchCaption";
import CatchDetailsSection from "@/components/addCatch/components/CatchDetailsSection";
import CatchPhoto from "@/components/addCatch/components/CatchPhoto";
import CatchSubmit from "@/components/addCatch/components/CatchSubmit";
import PrivateNotesSection from "@/components/addCatch/components/PrivateNotesSection";
import VisibilitySection from "@/components/addCatch/components/VisibilitySection";
import WeatherSection from "@/components/addCatch/components/WeatherSection";
import { styles } from "@/components/addCatch/styles";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";

export default function AddCatch() {
  const form = useCatchForm();
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      <Stack.Screen
        options={{
          title: form.editId ? "Edit catch" : "Add Catch",
          headerBackButtonDisplayMode: "minimal",
          headerStyle: { backgroundColor: "#020b13" },
          headerTintColor: "#f8fafb",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={() => router.back()}
              style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="chevron-back" size={21} color="#f8fafb" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        <CatchPhoto form={form} />
        <CatchCaption form={form} />
        <BasicInfoSection form={form} />
        <CatchDetailsSection form={form} />
        <WeatherSection form={form} />
        <PrivateNotesSection form={form} />
        <VisibilitySection form={form} />
        <CatchSubmit form={form} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
