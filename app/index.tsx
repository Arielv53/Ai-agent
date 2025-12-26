import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ONBOARDING_COMPLETE_KEY } from "../constants/OnboardingContext";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem(
        ONBOARDING_COMPLETE_KEY
      );
      setHasCompletedOnboarding(value === "true");
      setReady(true);
    };

    checkOnboarding();
  }, []);

  if (!ready) {
    return null; // splash already handled elsewhere
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/splash" />;
  }

  return <Redirect href="/(tabs)/Newsfeed" />;
}
