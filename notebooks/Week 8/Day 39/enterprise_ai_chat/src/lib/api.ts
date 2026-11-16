import { parseChat, parseHistory } from "./contracts";

async function request(path: string, options: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`/api/ai/${path}`, { ...options, cache: "no-store" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("We couldn’t reach the assistant. Check your connection, then reload history.");
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error : "The assistant couldn’t complete this request. Please try again shortly.";
    throw new Error(message);
  }
  return body;
}

export async function sendMessage(query: string, sessionId: string) {
  return parseChat(await request("chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, session_id: sessionId }),
  }), sessionId);
}

export async function getHistory(sessionId: string, signal?: AbortSignal) {
  return parseHistory(await request(`history?${new URLSearchParams({ session_id: sessionId })}`, {
    method: "GET", signal,
  }), sessionId);
}
