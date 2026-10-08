import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useFeed } from "@/app/(tabs)/Feed/_hooks/useFeed";
import { useCatchComments } from "@/app/(tabs)/Feed/_hooks/useCatchComments";
import { invalidateFeed, readFeed } from "@/app/(tabs)/Feed/_hooks/feedCache";
import { feedImageUrl } from "@/components/feedImage";
import type { PublicCatch, CatchComment } from "@/app/(tabs)/Feed/types";

jest.mock("expo-router", () => ({
  useFocusEffect: (callback: () => void) => {
    jest.requireActual("react").useEffect(callback, [callback]);
  },
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ token: "feed-test", loading: false }),
}));
const post: PublicCatch = {
  id: 1, species: "Bass", image_url: "https://example.com/fish.jpg",
  date_caught: "2026-10-07T12:00:00", user_id: 1, user_name: "Angler",
  liked: false, likes_count: 0, comments_count: 0, comments_preview: [],
  comments_next_cursor: null,
};
const comment = (id: number): CatchComment => ({
  id, content: String(id), timestamp: "2026-10-07T12:00:00",
  user: { id: 2, username: "friend" },
});
const reply = (data: unknown, ok = true) => ({ ok, json: async () => data });
const originalFetch = global.fetch;
let fetchMock: jest.Mock;
beforeEach(() => {
  readFeed("reset");
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});
afterEach(() => {
  global.fetch = originalFetch;
});

it("reuses a fresh feed without re-fetching and clears it for another account", async () => {
  fetchMock.mockResolvedValue(reply({ items: [post], next_cursor: null }));
  const first = renderHook(() => useFeed("feed-test"));
  await waitFor(() => expect(first.result.current.catches).toHaveLength(1));
  first.unmount();
  const second = renderHook(() => useFeed("feed-test"));
  expect(second.result.current.catches).toHaveLength(1);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  second.unmount();
  fetchMock.mockResolvedValue(reply({ items: [], next_cursor: null }));
  const other = renderHook(() => useFeed("different-account"));
  expect(other.result.current.catches).toHaveLength(0);
  await waitFor(() => expect(other.result.current.loading).toBe(false));
});

it("deduplicates pages and prevents simultaneous pagination requests", async () => {
  fetchMock.mockResolvedValueOnce(reply({ items: [post], next_cursor: "page-two" }));
  const hook = renderHook(() => useFeed("feed-test"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  let finish!: (value: unknown) => void;
  fetchMock.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  act(() => {
    hook.result.current.onLoadMore();
    hook.result.current.onLoadMore();
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  await act(async () => {
    finish(reply({ items: [post, { ...post, id: 2 }], next_cursor: null }));
  });
  expect(hook.result.current.catches.map((item) => item.id)).toEqual([1, 2]);
  act(() => hook.result.current.onLoadMore());
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("keeps cached cards during a refresh and retries the failed first page", async () => {
  fetchMock.mockResolvedValueOnce(reply({ items: [post], next_cursor: "older" }));
  const first = renderHook(() => useFeed("feed-test"));
  await waitFor(() => expect(first.result.current.loading).toBe(false));
  first.unmount();
  invalidateFeed();
  fetchMock.mockResolvedValueOnce(reply({}, false));
  const second = renderHook(() => useFeed("feed-test"));
  expect(second.result.current.catches).toHaveLength(1);
  await waitFor(() => expect(second.result.current.error).toBeTruthy());
  fetchMock.mockResolvedValueOnce(reply({ items: [], next_cursor: null }));
  act(() => second.result.current.retry());
  await waitFor(() => expect(second.result.current.catches).toHaveLength(0));
  expect(fetchMock.mock.calls[2][0]).toMatch(/feed\?limit=20$/);
});

it("does not overwrite an optimistic like with an older background response", async () => {
  fetchMock.mockResolvedValueOnce(reply({ items: [post], next_cursor: null }));
  const hook = renderHook(() => useFeed("feed-test"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  let finish!: (value: unknown) => void;
  fetchMock.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  act(() => hook.result.current.onRefresh());
  fetchMock.mockResolvedValueOnce(reply({}));
  await act(async () => { await hook.result.current.onLikeToggle(1); });
  await act(async () => { finish(reply({ items: [post], next_cursor: null })); });
  expect(hook.result.current.catches[0].liked).toBe(true);
});

it("uses seeded comments without requests, then pages and posts with an accurate total", async () => {
  const preview = [comment(8), comment(7), comment(6)];
  const hook = renderHook(() => useCatchComments(1, 8, preview, "comments-next"));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(hook.result.current.comments).toHaveLength(3);
  fetchMock.mockResolvedValueOnce(reply({
    items: [comment(5), comment(4), comment(3)], total: 8, next_cursor: "last",
  }));
  act(() => hook.result.current.loadMore());
  await waitFor(() => expect(hook.result.current.comments).toHaveLength(6));
  expect(hook.result.current.count).toBe(8);
  expect(hook.result.current.hasMore).toBe(true);
  fetchMock.mockResolvedValueOnce(reply(comment(9)));
  await act(async () => { await hook.result.current.submit("New comment"); });
  expect(hook.result.current.count).toBe(9);
  expect(hook.result.current.comments[0].id).toBe(9);
});

it("uses bounded requests for profile post comments and exposes retry errors", async () => {
  fetchMock.mockResolvedValueOnce(reply({}, false));
  const hook = renderHook(() => useCatchComments(1, 5));
  await waitFor(() => expect(hook.result.current.error).toBeTruthy());
  fetchMock.mockResolvedValueOnce(reply({
    items: [comment(5), comment(4), comment(3)], total: 5, next_cursor: "next",
  }));
  act(() => hook.result.current.retry());
  await waitFor(() => expect(hook.result.current.comments).toHaveLength(3));
  expect(fetchMock.mock.calls[0][0]).toMatch(/comments\?limit=3$/);
  expect(hook.result.current.count).toBe(5);
});

it("resizes Cloudinary thumbnails while preserving external and signed URLs", () => {
  expect(feedImageUrl("https://res.cloudinary.com/demo/image/upload/v123/fish.jpg", 1080))
    .toBe("https://res.cloudinary.com/demo/image/upload/c_limit,w_1080,q_auto,f_auto/v123/fish.jpg");
  const external = "https://example.com/fish.jpg";
  const signed = "https://res.cloudinary.com/demo/image/upload/s--signed--/v123/fish.jpg";
  expect(feedImageUrl(external, 100)).toBe(external);
  expect(feedImageUrl(signed, 100)).toBe(signed);
});
