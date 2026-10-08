import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCatchForm } from "@/components/addCatch/_hooks/useCatchForm";
import { readFeed, writeFeed } from "@/app/(tabs)/Feed/_hooks/feedCache";

const mockRouter = { dismissTo: jest.fn(), back: jest.fn(), replace: jest.fn() };
let mockParams: { editId?: string } = {};
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ token: "form-test" }),
}));
jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "images" },
  launchImageLibraryAsync: async () => ({
    canceled: false,
    assets: [{ uri: "file:///catch.jpg", fileName: "catch.jpg", type: "image" }],
  }),
}));

const originalFetch = global.fetch;
let fetchMock: jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  fetchMock = jest.fn();
  global.fetch = fetchMock;
  readFeed("form-test");
  writeFeed("form-test", (value) => ({ ...value, updatedAt: Date.now() }));
});
afterEach(() => { global.fetch = originalFetch; });

it("invalidates the feed and returns to its top after a successful new catch", async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: 10 }) });
  const { result } = renderHook(() => useCatchForm());
  await act(async () => { await result.current.pickImage(); });
  await act(async () => { await result.current.handleSubmit(); });
  expect(readFeed("form-test").updatedAt).toBe(0);
  expect(mockRouter.dismissTo).toHaveBeenCalledWith({
    pathname: "/(tabs)/Feed",
    params: { refresh: expect.any(String) },
  });
  expect(mockRouter.back).not.toHaveBeenCalled();
});

it("keeps the form and shows the error when saving fails", async () => {
  fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Upload failed" }) });
  const { result } = renderHook(() => useCatchForm());
  await act(async () => { await result.current.pickImage(); });
  await act(async () => { await result.current.handleSubmit(); });
  expect(result.current.error).toBe("Upload failed");
  expect(result.current.file).toBeTruthy();
  expect(mockRouter.dismissTo).not.toHaveBeenCalled();
  expect(readFeed("form-test").updatedAt).not.toBe(0);
});

it("preserves the edit flow back to the post", async () => {
  mockParams = { editId: "10" };
  fetchMock.mockResolvedValue({
    ok: true, json: async () => ({ id: 10, image_url: "https://example.com/catch.jpg" }),
  });
  const { result } = renderHook(() => useCatchForm());
  await waitFor(() => expect(result.current.editReady).toBe(true));
  await act(async () => { await result.current.handleSubmit(); });
  expect(mockRouter.back).toHaveBeenCalledTimes(1);
  expect(mockRouter.dismissTo).not.toHaveBeenCalled();
  expect(readFeed("form-test").updatedAt).toBe(0);
});
