import type { Session } from "./contracts";

const KEY = "xander.sessions.v1";
export function readSessions(): { sessions: Session[]; activeId: string | null } {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!value || !Array.isArray(value.sessions)) return { sessions: [], activeId: null };
    const sessions: Session[] = value.sessions.filter((s: Session) => s && typeof s.id === "string" &&
      s.id.length > 0 && s.id.length <= 200 && typeof s.title === "string" && typeof s.updatedAt === "number");
    return { sessions, activeId: sessions.some((s) => s.id === value.activeId) ? value.activeId : null };
  } catch { return { sessions: [], activeId: null }; }
}

export function saveSessions(sessions: Session[], activeId: string | null): boolean {
  try { localStorage.setItem(KEY, JSON.stringify({ sessions, activeId })); return true; }
  catch { return false; }
}
