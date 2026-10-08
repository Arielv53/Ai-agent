import type { CatchComment, PublicCatch } from "../types";

export type FeedSnapshot = {
  items: PublicCatch[];
  nextCursor: string | null;
  updatedAt: number;
  revision: number;
};
let account: string | null | undefined;
let snapshot: FeedSnapshot = { items: [], nextCursor: null, updatedAt: 0, revision: 0 };
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export function readFeed(token: string | null): FeedSnapshot {
  if (account !== token) {
    account = token;
    snapshot = { items: [], nextCursor: null, updatedAt: 0, revision: snapshot.revision + 1 };
  }
  return snapshot;
}
export function subscribeFeed(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function writeFeed(token: string | null, update: (value: FeedSnapshot) => FeedSnapshot) {
  if (account !== token) return;
  snapshot = update(snapshot);
  notify();
}
export function invalidateFeed() {
  snapshot = { ...snapshot, updatedAt: 0, revision: snapshot.revision + 1 };
  notify();
}
export function cacheComment(token: string, catchId: number, comment: CatchComment) {
  writeFeed(token, (value) => ({
    ...value, updatedAt: 0, revision: value.revision + 1,
    items: value.items.map((post) => post.id === catchId ? {
      ...post,
      comments_count: (post.comments_count ?? 0) + 1,
      comments_preview: [comment, ...(post.comments_preview ?? [])].slice(0, 3),
      // Refresh pagination from the server on expansion after a local insertion.
      comments_next_cursor: undefined,
    } : post),
  }));
}
