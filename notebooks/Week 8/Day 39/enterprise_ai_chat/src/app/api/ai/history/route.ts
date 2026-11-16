import { forward } from "@/lib/backend";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId?.trim() || sessionId.length > 200) {
    return Response.json({ error: "Enter a session ID up to 200 characters." }, { status: 400 });
  }
  return forward(`ai/history?${new URLSearchParams({ session_id: sessionId })}`);
}
