import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render, waitFor } from "@testing-library/react-native";
import React from "react";
import Index from "../app/index";
import { ONBOARDING_COMPLETE_KEY } from "../constants/OnboardingContext";

let mockUser: { id: number } | null = null;
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockUser, loading: false }),
}));
jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("@/components/BiteBookLaunch", () => () => null);
jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = jest.requireActual("react-native");
    return <Text>{href}</Text>;
  },
}));

describe("App entry routing", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUser = null;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    [null, null, "/(onboarding)/auth"],
    ["true", null, "/(onboarding)/auth"],
    ["true", { id: 1 }, "/(tabs)/Feed"],
  ])("routes onboarding=%s and user=%s correctly", async (completed, user, destination) => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(completed as string | null);
    mockUser = user as { id: number } | null;
    const { getByText } = render(<Index />);
    await act(async () => {
      jest.advanceTimersByTime(2400);
    });
    await waitFor(() => expect(getByText(destination as string)).toBeTruthy());
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(ONBOARDING_COMPLETE_KEY);
  });
});
