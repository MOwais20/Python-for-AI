"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { getHistory, sendMessage } from "@/lib/api";
import type { Message, Session } from "@/lib/contracts";
import { readSessions, saveSessions } from "@/lib/storage";

type Thread = { messages: Message[]; loaded: boolean; loading: boolean; pending: boolean; error?: string };
type State = {
  ready: boolean; sessions: Session[]; activeId: string | null;
  threads: Record<string, Thread>; drafts: Record<string, string>; storageError: boolean;
};
type Action =
  | { type: "boot"; sessions: Session[]; activeId: string | null }
  | { type: "select"; id: string | null }
  | { type: "add"; session: Session }
  | { type: "remove"; id: string }
  | { type: "rename"; id: string; title: string }
  | { type: "draft"; id: string; value: string }
  | { type: "thread"; id: string; patch: Partial<Thread> }
  | { type: "send"; session: Session; message: Message }
  | { type: "answer"; id: string; message: Message }
  | { type: "storage-error" };
const emptyThread = (): Thread => ({ messages: [], loaded: false, loading: false, pending: false });
const initial: State = { ready: false, sessions: [], activeId: null, threads: {}, drafts: {}, storageError: false };
function threadAt(state: State, id: string): Thread | undefined {
  return Object.hasOwn(state.threads, id) ? state.threads[id] : undefined;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "boot": return { ...state, ready: true, sessions: action.sessions, activeId: action.activeId };
    case "select": return { ...state, activeId: action.id };
    case "add": return { ...state, activeId: action.session.id,
      sessions: [action.session, ...state.sessions.filter((s) => s.id !== action.session.id)] };
    case "remove": {
      const threads = { ...state.threads }; const drafts = { ...state.drafts };
      delete threads[action.id]; delete drafts[action.id];
      return { ...state, threads, drafts, sessions: state.sessions.filter((s) => s.id !== action.id),
        activeId: state.activeId === action.id ? null : state.activeId };
    }
    case "rename": return { ...state, sessions: state.sessions.map((s) => s.id === action.id ? { ...s, title: action.title } : s) };
    case "draft": return { ...state, drafts: { ...state.drafts, [action.id]: action.value } };
    case "thread": return { ...state, threads: { ...state.threads,
      [action.id]: { ...(threadAt(state, action.id) || emptyThread()), ...action.patch } } };
    case "send": return { ...state, activeId: action.session.id,
      sessions: [action.session, ...state.sessions.filter((s) => s.id !== action.session.id)],
      drafts: { ...state.drafts, new: "", [action.session.id]: "" },
      threads: { ...state.threads, [action.session.id]: {
        ...(threadAt(state, action.session.id) || emptyThread()), loaded: true, pending: true, error: undefined,
        messages: [...(threadAt(state, action.session.id)?.messages || []), action.message],
      } } };
    case "answer": return { ...state, threads: { ...state.threads, [action.id]: {
      ...(threadAt(state, action.id) || emptyThread()), pending: false,
      messages: [...(threadAt(state, action.id)?.messages || []), action.message],
    } } };
    case "storage-error": return { ...state, storageError: true };
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(reducer, initial);
  const locks = useRef(new Set<string>());
  const controllers = useRef(new Map<string, AbortController>());

  useEffect(() => { dispatch({ type: "boot", ...readSessions() }); }, []);
  useEffect(() => { locks.current.delete("new"); }, [state.activeId]);
  useEffect(() => {
    if (state.ready && !saveSessions(state.sessions, state.activeId)) dispatch({ type: "storage-error" });
  }, [state.ready, state.sessions, state.activeId]);

  const loadHistory = useCallback(async (id: string) => {
    if (locks.current.has(id)) return;
    controllers.current.get(id)?.abort();
    const controller = new AbortController();
    controllers.current.set(id, controller);
    dispatch({ type: "thread", id, patch: { loading: true, error: undefined } });
    try {
      const history = await getHistory(id, controller.signal);
      if (controller.signal.aborted) return;
      dispatch({ type: "thread", id, patch: { loaded: true, loading: false,
        messages: history.messages.map((m) => ({ ...m, id: crypto.randomUUID() })) } });
    } catch (error) {
      if (!controller.signal.aborted) dispatch({ type: "thread", id, patch: { loading: false, loaded: true,
        error: error instanceof Error ? error.message : "History could not be loaded." } });
    } finally {
      if (controllers.current.get(id) === controller) controllers.current.delete(id);
    }
  }, []);

  const activeThread = state.activeId ? threadAt(state, state.activeId) : undefined;
  useEffect(() => {
    if (state.ready && state.activeId && !activeThread?.loaded && !activeThread?.loading) void loadHistory(state.activeId);
  }, [state.ready, state.activeId, activeThread?.loaded, activeThread?.loading, loadHistory]);
  useEffect(() => () => { controllers.current.forEach((controller) => controller.abort()); }, []);

  async function send(query: string) {
    query = query.trim();
    const key = state.activeId || "new";
    if (!state.ready || !query || query.length > 12000 || locks.current.has(key) || activeThread?.pending || activeThread?.loading || activeThread?.error) return;
    const id = state.activeId || crypto.randomUUID();
    locks.current.add(key); locks.current.add(id);
    const existing = state.sessions.find((s) => s.id === id);
    const session: Session = { id, title: existing?.title || query.slice(0, 64), updatedAt: Date.now() };
    dispatch({ type: "send", session, message: { id: crypto.randomUUID(), role: "user", content: query } });
    try {
      const response = await sendMessage(query, id);
      dispatch({ type: "answer", id, message: { id: crypto.randomUUID(), role: "ai", content: response.answer } });
    } catch (error) {
      dispatch({ type: "thread", id, patch: { pending: false,
        error: error instanceof Error ? error.message : "The message could not be sent. Reload history to check its status." } });
      dispatch({ type: "draft", id, value: query });
    } finally { locks.current.delete(key); locks.current.delete(id); }
  }

  function remove(id: string) {
    if (locks.current.has(id)) return;
    controllers.current.get(id)?.abort();
    dispatch({ type: "remove", id });
  }

  return {
    ...state, thread: activeThread || emptyThread(),
    draft: Object.hasOwn(state.drafts, state.activeId || "new") ? state.drafts[state.activeId || "new"] : "",
    activeSession: state.sessions.find((s) => s.id === state.activeId),
    send, remove,
    setDraft: (value: string) => dispatch({ type: "draft", id: state.activeId || "new", value }),
    select: (id: string | null) => dispatch({ type: "select", id }),
    rename: (id: string, title: string) => dispatch({ type: "rename", id, title }),
    restore: (id: string) => {
      dispatch({ type: "add", session: state.sessions.find((s) => s.id === id) || { id, title: `Restored conversation · ${id.slice(0, 8)}`, updatedAt: Date.now() } });
      void loadHistory(id);
    },
    reload: () => { if (state.activeId) void loadHistory(state.activeId); },
  };
}
