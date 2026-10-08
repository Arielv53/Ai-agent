import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { cacheComment } from "./feedCache";
import type { CatchComment } from "../types";
export type { CatchComment } from "../types";

export function useCatchComments(
  catchId: number,
  initialCount: number,
  preview?: CatchComment[],
  previewCursor?: string | null,
) {
  const { token } = useAuth();
  const [comments, setComments] = useState<CatchComment[]>(preview ?? []);
  const [count, setCount] = useState(initialCount);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(previewCursor);
  const [loading, setLoading] = useState(!preview);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const alive = useRef(false);
  const revision = useRef(0);
  const expanded = useRef(false);
  const lastLoad = useRef(false);

  const load = useCallback(async (more = false, cursor?: string | null) => {
    if (active.current || pending.current) return;
    const controller = new AbortController();
    active.current = controller;
    lastLoad.current = more;
    const version = revision.current;
    setLoading(true);
    setError(null);
    try {
      const suffix = more && cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
      const response = await fetch(`${API_BASE}/catches/${catchId}/comments?limit=${more ? 20 : 3}${suffix}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Unable to load comments.");
      const data = await response.json();
      if (!Array.isArray(data.items)) throw new Error("Unable to load comments.");
      if (controller.signal.aborted || revision.current !== version) return;
      setComments((previous) => more && cursor
        ? [...previous, ...data.items.filter((item: CatchComment) => !previous.some((old) => old.id === item.id))]
        : data.items);
      setCount(data.total);
      setNextCursor(data.next_cursor);
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Unable to load comments.");
    } finally {
      if (active.current === controller) {
        active.current = null;
        if (alive.current) setLoading(false);
      }
    }
  }, [catchId, token]);

  useFocusEffect(useCallback(() => {
    alive.current = true;
    setLoading(false);
    setPosting(pending.current);
    if (preview) {
      setComments((previous) => expanded.current
        ? [...preview, ...previous.filter((item) => !preview.some((newer) => newer.id === item.id))]
        : preview);
      setCount(initialCount);
      if (!expanded.current) setNextCursor(previewCursor);
    } else {
      void load();
    }
    return () => {
      alive.current = false;
      active.current?.abort();
      active.current = null;
    };
  }, [preview, previewCursor, initialCount, load]));

  const submit = async (content: string) => {
    if (!token || pending.current || !content.trim() || !alive.current) return false;
    pending.current = true;
    setPosting(true);
    setPostError(null);
    try {
      const response = await fetch(`${API_BASE}/catches/${catchId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 422
        ? "Please sign in again to comment." : "Unable to post comment. Please try again.");
      const comment: CatchComment = await response.json();
      revision.current += 1;
      if (alive.current) {
        setComments((previous) => [comment, ...previous.filter((item) => item.id !== comment.id)]);
        setCount((previous) => previous + 1);
      }
      cacheComment(token, catchId, comment);
      return true;
    } catch (err) {
      if (alive.current) setPostError(err instanceof Error ? err.message : "Unable to post comment.");
      return false;
    } finally {
      pending.current = false;
      if (alive.current) setPosting(false);
    }
  };

  return {
    comments, count, loading, posting, error, postError, submit, signedIn: !!token,
    hasMore: nextCursor !== null && count > comments.length,
    loadMore: () => {
      expanded.current = true;
      void load(true, nextCursor);
    },
    retry: () => { void load(lastLoad.current, nextCursor); },
  };
}
