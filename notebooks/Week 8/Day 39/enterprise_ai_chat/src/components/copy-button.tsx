"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, label = "Copy message", showLabel = false }: { text: string | (() => string); label?: string; showLabel?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(typeof text === "function" ? text() : text); setStatus("copied"); }
    catch { setStatus("failed"); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2200);
  }
  return <button type="button" className={`copy-button ${showLabel ? "with-label" : ""}`} onClick={copy}
    aria-label={status === "copied" ? "Copied" : status === "failed" ? "Copy failed; select and copy the text" : label}
    title={status === "failed" ? "Copy unavailable; select and copy the text" : label}>
    {status === "copied" ? <Check size={14} /> : <Copy size={14} />}
    {showLabel && <span>{status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy"}</span>}
    <span className="sr-only" role="status">{status === "copied" ? "Copied to clipboard" : status === "failed" ? "Copy failed" : ""}</span>
  </button>;
}
