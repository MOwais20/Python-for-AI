"use client";

import { Asterisk, ArrowDown, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { Message } from "@/lib/contracts";
import { Markdown } from "./markdown";
import { CopyButton } from "./copy-button";

export function MessageList({ messages, pending, error, reload, scrollRef }: {
  messages: Message[]; pending: boolean; error?: string; reload: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const end = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const [showJump, setShowJump] = useState(false);
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const onScroll = () => {
      following.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 120;
      setShowJump(!following.current);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [scrollRef]);
  useEffect(() => {
    if (following.current || messages.at(-1)?.role === "user") end.current?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "end",
    });
  }, [messages, pending, error]);

  return <div className="message-list" role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions">
    <p className="conversation-start">The start of your conversation</p>
    {messages.map((message) => <article className={`message message-${message.role}`} key={message.id} aria-label={message.role === "user" ? "You" : "Xander assistant"}>
      {message.role === "ai" && <div className="message-author"><span className="assistant-avatar"><Asterisk size={19} /></span><span>Xander’s</span><span className="ai-label">Assistant</span></div>}
      <div className="message-content">{message.role === "ai" ? <Markdown content={message.content} /> : <p>{message.content}</p>}</div>
      {message.role === "ai" && <div className="message-tools"><CopyButton text={message.content} /></div>}
    </article>)}
    {pending && <div className="thinking" role="status"><span className="thinking-symbol"><Asterisk size={20} /></span><span>Xander’s is thinking<span className="thinking-dots"><i /><i /><i /></span></span></div>}
    {error && <div className="error-notice" role="alert"><TriangleAlert size={18} /><div><strong>Let’s reconnect</strong><p>{error}</p><button onClick={reload}><RefreshCw size={14} /> Reload history</button><small>Check whether your message was saved before sending it again.</small></div></div>}
    <div ref={end} className="scroll-anchor" />
    {showJump && <button className="jump-button" onClick={() => { following.current = true; end.current?.scrollIntoView({ behavior: "smooth" }); }} aria-label="Scroll to latest message"><ArrowDown size={17} /></button>}
  </div>;
}
