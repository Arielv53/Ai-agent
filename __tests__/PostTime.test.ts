import { getPostAge } from "@/app/(tabs)/Feed/_utils/postTime";

const now = Date.parse("2026-10-07T12:05:00Z");
it("uses posting time in minutes and handles UTC explicitly", () => {
  expect(getPostAge("2026-10-07T12:00:00Z", now)).toBe("5m");
  expect(getPostAge("2026-10-07T12:00:00", now)).toBe("5m");
  expect(getPostAge("2026-10-07T08:00:00-04:00", now)).toBe("5m");
  expect(getPostAge("2026-10-07T12:05:00Z", now)).toBe("now");
});
it("does not fabricate an age for legacy posts", () => {
  expect(getPostAge(null, now)).toBeNull();
  expect(getPostAge(undefined, now)).toBeNull();
  expect(getPostAge("invalid", now)).toBeNull();
});
