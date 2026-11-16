export type Message = { id: string; role: "user" | "ai"; content: string };
export type Session = { id: string; title: string; updatedAt: number };
export type ChatResponse = { session_id: string; answer: string };
export type HistoryResponse = {
  session_id: string;
  messages: { role: "user" | "ai"; content: string }[];
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseChat(value: unknown, sessionId: string): ChatResponse {
  if (!record(value) || value.session_id !== sessionId || typeof value.answer !== "string") {
    throw new Error("The assistant returned an unexpected response. Reload history before sending again.");
  }
  return { session_id: sessionId, answer: value.answer };
}

export function parseHistory(value: unknown, sessionId: string): HistoryResponse {
  if (!record(value) || value.session_id !== sessionId || !Array.isArray(value.messages) ||
    !value.messages.every((m) => record(m) && (m.role === "user" || m.role === "ai") && typeof m.content === "string")) {
    throw new Error("Conversation history could not be read. Please try loading it again.");
  }
  return value as HistoryResponse;
}
