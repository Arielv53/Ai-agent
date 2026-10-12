import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from "react-native";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "editReady"
    | "loading"
    | "submitSucceeded"
    | "error"
    | "successMessage"
    | "editId"
    | "fadeAnim"
    | "handleSubmit"
  >;
};

export default function CatchSubmit({ form }: Props) {
  const {
    editReady,
    loading,
    submitSucceeded,
    error,
    successMessage,
    editId,
    fadeAnim,
    handleSubmit,
  } = form;
  const glowPulse = React.useRef(new Animated.Value(0)).current;
  const successScale = React.useRef(new Animated.Value(0.7)).current;
  const disabled = loading || (!!editId && !editReady);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [glowPulse]);

  React.useEffect(() => {
    if (!submitSucceeded) {
      successScale.setValue(0.7);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.spring(successScale, {
      toValue: 1,
      damping: 11,
      stiffness: 190,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [submitSucceeded, successScale]);

  return (
    <>
      <View style={styles.addButtonGlowContainer}>
        {!disabled && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.addButtonGlow,
              {
                opacity: glowPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.08, 0.42],
                }),
                transform: [{
                  scale: glowPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1.045],
                  }),
                }],
              },
            ]}
          />
        )}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ disabled, busy: loading && !submitSucceeded }}
          style={[styles.addButton, disabled && !loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={disabled}
          activeOpacity={0.88}
        >
        <LinearGradient
          colors={disabled && !loading
            ? ["#102532", "#0b1b26"]
            : ["#06263a", "#04182a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButtonGradient}
        >
          {submitSucceeded ? (
            <Animated.View
              style={[styles.submitButtonContent, { transform: [{ scale: successScale }] }]}
            >
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={19} color="#078bea" />
              </View>
              <Text style={styles.addButtonText}>
                {editId ? "Changes saved" : "Catch logged"}
              </Text>
            </Animated.View>
          ) : loading ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.addButtonText}>
                {editId ? "Saving changes…" : "Logging catch…"}
              </Text>
            </View>
          ) : (
            <View style={styles.submitButtonContent}>
                {editId
                  ? <Ionicons name="save-outline" size={21} color="#ffffff" />
                  : <Text style={styles.addButtonPlus}>+</Text>}
              <Text style={styles.addButtonText}>
                {editId ? "Save changes" : "Add Catch"}
              </Text>
            </View>
          )}
        </LinearGradient>
        </TouchableOpacity>
      </View>

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      {successMessage ? (
        <Animated.View
          style={{
            opacity: fadeAnim,
            backgroundColor: "#2f2e2e",
            borderColor: "#f5b20b",
            borderWidth: 1,
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#f5b20b", fontWeight: "600" }}>
            {successMessage}
          </Text>
        </Animated.View>
      ) : null}
    </>
  );
}
