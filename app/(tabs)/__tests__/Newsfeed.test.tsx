import { API_BASE } from "@/constants/config";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import FeedHome from "../Feed";
import { readFeed } from "../Feed/_hooks/feedCache";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: (callback: () => void) => {
    jest.requireActual("react").useEffect(callback, [callback]);
  },
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ token: "test-token", loading: false }),
}));
jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));
jest.mock("../Feed/components/FeedTopBar/FeedTopBar", () => () => null);
jest.mock("../Feed/components/FeedFab", () => () => null);
jest.mock("../Feed/components/FeedLoader", () => function MockFeedLoader() {
  const { Text } = jest.requireActual("react-native");
  return <Text>Loading feed</Text>;
});
// Comments have their own requests; keep these tests focused on feed and likes.
jest.mock("../Feed/_hooks/useCatchComments", () => ({
  useCatchComments: () => ({ count: 0 }),
}));
jest.mock("../Feed/components/CatchComments", () => () => null);

const catchPost = {
  id: 1,
  user_id: 2,
  species: "Bluefin Tuna",
  image_url: "https://example.com/fish.jpg",
  user_name: "Ariel",
  date_caught: "2026-10-07T12:00:00Z",
  likes_count: 0,
  comments_count: 0,
  liked: false,
};
const response = (data: unknown, ok = true) =>
  ({ ok, status: ok ? 200 : 500, json: async () => data }) as Response;

describe("Feed screen", () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    readFeed("reset-test");
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("finishes loading an empty feed using the authenticated endpoint", async () => {
    fetchMock.mockResolvedValue(response({ items: [], next_cursor: null }));
    const { queryByText } = render(<FeedHome />);

    await waitFor(() => expect(queryByText("Loading feed")).toBeNull(), { timeout: 5000 });
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/feed?limit=20`,
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
        signal: expect.anything(),
      }),
    );
    expect(queryByText("Bluefin Tuna")).toBeNull();
  });

  it("renders a catch and allows liking and unliking it", async () => {
    fetchMock
      .mockResolvedValueOnce(response({ items: [catchPost], next_cursor: null }))
      .mockResolvedValue(response({}));
    const { findByText, getByText } = render(<FeedHome />);
    expect(await findByText("Bluefin Tuna")).toBeTruthy();

    fireEvent.press(getByText("0 Likes"));
    await waitFor(() => expect(getByText("1 Like")).toBeTruthy());
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${API_BASE}/catches/1/like`,
      { method: "POST", headers: { Authorization: "Bearer test-token" } },
    );

    fireEvent.press(getByText("1 Like"));
    await waitFor(() => expect(getByText("0 Likes")).toBeTruthy());
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${API_BASE}/catches/1/unlike`,
      { method: "DELETE", headers: { Authorization: "Bearer test-token" } },
    );
  });

  it("restores the like count when saving the like fails", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    fetchMock
      .mockResolvedValueOnce(response({ items: [catchPost], next_cursor: null }))
      .mockResolvedValueOnce(response({}, false));
    const { findByText, getByText } = render(<FeedHome />);
    await findByText("Bluefin Tuna");
    fireEvent.press(getByText("0 Likes"));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Unable to update like",
        "Please try again or sign in again.",
      ),
    );
    expect(getByText("0 Likes")).toBeTruthy();
  });
});
