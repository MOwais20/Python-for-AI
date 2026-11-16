"use client";

import { ArrowUp, Asterisk, LoaderCircle } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

export function Composer({ value, onChange, onSend, disabled, pending, hasError }: {
  value: string; onChange: (value: string) => void; onSend: () => void;
  disabled: boolean; pending: boolean; hasError: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (ref.current) { ref.current.style.height = "0px"; ref.current.style.height = `${Math.min(ref.current.scrollHeight, 192)}px`; }
  }, [value, disabled]);
  return <div className="composer-area"><form className={`composer ${pending ? "is-pending" : ""}`} onSubmit={(e) => { e.preventDefault(); onSend(); }}>
    <label htmlFor="message" className="sr-only">Message Xander’s assistant</label>
    <textarea id="message" ref={ref} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder="Ask Xander’s anything…" rows={1} maxLength={12000} disabled={disabled}
      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (!disabled && !pending && !hasError && value.trim()) onSend(); } }} />
    <div className="composer-bottom"><span className="composer-identity"><Asterisk size={16} /> Xander assistant</span>
      <div className="composer-actions">{value.length > 11000 && <span className="character-count">{value.length.toLocaleString()} / 12,000</span>}
        <button className="send-button" type="submit" disabled={disabled || pending || hasError || !value.trim()} aria-label={pending ? "Waiting for assistant" : "Send message"} title="Send message">
          {pending ? <LoaderCircle size={19} className="spin" /> : <ArrowUp size={20} strokeWidth={2} />}
        </button></div></div>
  </form><div className="composer-footnote"><span>AI can make mistakes. Please check important details.</span><span className="keyboard-hint"><kbd>↵</kbd> Send <span>·</span> <kbd>⇧ ↵</kbd> New line</span></div></div>;
}
