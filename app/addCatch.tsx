import { Stack } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { useCatchForm } from "@/components/addCatch/_hooks/useCatchForm";
import { styles } from "@/components/addCatch/styles";
import CatchPhoto from "@/components/addCatch/components/CatchPhoto";
import CatchCaption from "@/components/addCatch/components/CatchCaption";
import BasicInfoSection from "@/components/addCatch/components/BasicInfoSection";
import VisibilitySection from "@/components/addCatch/components/VisibilitySection";
import WeatherSection from "@/components/addCatch/components/WeatherSection";
import CatchDetailsSection from "@/components/addCatch/components/CatchDetailsSection";
import PrivateNotesSection from "@/components/addCatch/components/PrivateNotesSection";
import CatchSubmit from "@/components/addCatch/components/CatchSubmit";

export default function AddCatch() {
  const form = useCatchForm();

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: form.editId ? "Edit catch" : "Add Catch", headerBackButtonDisplayMode: "minimal" }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <CatchPhoto form={form} />
        <CatchCaption form={form} />
        <BasicInfoSection form={form} />
        <VisibilitySection form={form} />
        <WeatherSection form={form} />
        <CatchDetailsSection form={form} />
        <PrivateNotesSection form={form} />
        <CatchSubmit form={form} />
      </ScrollView>
    </View>
  );
}
