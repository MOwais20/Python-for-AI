import "server-only";

export async function forward(path: string, init?: RequestInit): Promise<Response> {
  const configured = process.env.BACKEND_URL || "http://localhost:8000";
  let base: URL;
  try {
    base = new URL(configured.endsWith("/") ? configured : `${configured}/`);
    if (!["http:", "https:"].includes(base.protocol)) throw new Error();
  } catch {
    return Response.json({ error: "The assistant service URL is not configured correctly." }, { status: 503 });
  }
  try {
    const response = await fetch(new URL(path, base), {
      ...init, cache: "no-store", signal: AbortSignal.timeout(180_000),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const error = response.status === 429
        ? "The assistant is busy. Please wait a moment, then reload history."
        : "The assistant couldn’t complete this request. Reload history before sending again.";
      // Do not expose provider errors, stack traces or credentials from the backend.
      return Response.json({ error }, { status: response.status >= 500 ? 502 : response.status });
    }
    const body: unknown = await response.json();
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const timedOut = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
    return Response.json({ error: timedOut
      ? "The assistant took longer than expected. Your message may still be processing. Wait a moment and reload history."
      : "We couldn’t connect to the assistant service. Make sure FastAPI is running and reload history." },
    { status: timedOut ? 504 : 503 });
  }
}
