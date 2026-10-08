import { useFocusEffect, useRouter } from "expo-router";
import { PropsWithChildren, useCallback, useMemo, useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

const PAGES = ["/(onboarding)/auth", "/(onboarding)/setup", "/(onboarding)/preview", "/(onboarding)/launch"] as const;

export default function OnboardingSwipe({ page, children }: PropsWithChildren<{ page: number }>) {
  const router = useRouter();
  const navigating = useRef(false);
  useFocusEffect(useCallback(() => { navigating.current = false; }, []));
  const move = useCallback((direction: number) => {
    const destination = PAGES[page + direction];
    if (!destination || navigating.current) return;
    navigating.current = true;
    router.replace(destination);
  }, [page, router]);
  const responder = useMemo(() => PanResponder.create({
    // Capture only deliberate horizontal movements; retain taps and vertical scrolling.
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      Math.abs(gesture.dx) > 20 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2,
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) > 55 || (Math.abs(gesture.dx) > 25 && Math.abs(gesture.vx) > 0.5)) {
        move(gesture.dx < 0 ? 1 : -1);
      }
    },
  }), [move]);
  return <View style={styles.container} {...responder.panHandlers}
    accessibilityActions={[{ name: "increment", label: "Next page" }, { name: "decrement", label: "Previous page" }]}
    onAccessibilityAction={(event) => move(event.nativeEvent.actionName === "increment" ? 1 : -1)}>
    {children}
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1 } });
