import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import BiteBookLaunch from "@/components/BiteBookLaunch";
import { useAuth } from "@/contexts/AuthContext";
import { ONBOARDING_COMPLETE_KEY } from "../constants/OnboardingContext";

const MIN_LAUNCH_TIME = 2400;

export default function Index() {
  const { user, loading: authLoading } = useAuth();

  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean | null>(null);

  const [launchFinished, setLaunchFinished] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        const value = await AsyncStorage.getItem(
          ONBOARDING_COMPLETE_KEY
        );

        if (mounted) {
          setHasCompletedOnboarding(value === "true");
        }
      } catch (error) {
        console.warn(
          "Failed to check onboarding state:",
          error
        );

        if (mounted) {
          setHasCompletedOnboarding(false);
        }
      }
    };

    initializeApp();

    const timer = setTimeout(() => {
      if (mounted) {
        setLaunchFinished(true);
      }
    }, MIN_LAUNCH_TIME);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const appReady =
    !authLoading &&
    hasCompletedOnboarding !== null &&
    launchFinished;

  if (!appReady) {
    return (
      <View style={{ flex: 1 }}>
        <BiteBookLaunch />
      </View>
    );
  }

  // First-time user
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/auth" />;
  }

  // Returning authenticated user
  if (user) {
    return <Redirect href="/(tabs)/Feed" />;
  }

  // Returning user who isn't authenticated
  return <Redirect href="/(onboarding)/auth" />;
}
