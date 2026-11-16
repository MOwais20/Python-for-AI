import { forward } from "@/lib/backend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.query !== "string" || !body.query.trim() || body.query.length > 12000 ||
    typeof body.session_id !== "string" || !body.session_id.trim() || body.session_id.length > 200) {
    return Response.json({ error: "Enter a message up to 12,000 characters and a valid session ID." }, { status: 400 });
  }
  return forward("ai/chat", { method: "POST", body: JSON.stringify({ query: body.query, session_id: body.session_id }) });
}
