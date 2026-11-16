"use client";

import { Asterisk, ChevronDown, Info, LoaderCircle, Menu, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { useTheme } from "@/hooks/use-theme";
import { Composer } from "./composer";
import { Dialog } from "./dialog";
import { CopyButton } from "./copy-button";
import { MessageList } from "./message-list";
import { Sidebar } from "./sidebar";
import { Welcome } from "./welcome";

type Modal = "restore" | "details" | "rename" | "remove" | null;

export function ChatApp() {
  const chat = useChat();
  const theme = useTheme();
  const [sidebar, setSidebar] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [field, setField] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const closeOnDesktop = () => { if (!media.matches) setSidebar(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);
  function newChat() { chat.select(null); setSidebar(false); }
  function openModal(value: Modal) { setField(value === "rename" ? chat.activeSession?.title || "" : ""); setModal(value); }

  useEffect(() => {
    if (!sidebar) return;
    const drawer = drawerRef.current;
    const previous = document.activeElement as HTMLElement | null;
    if (!matchMedia("(max-width: 767px)").matches) return;
    drawer?.querySelector<HTMLElement>("button")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setSidebar(false); menuRef.current?.focus(); }
      if (event.key === "Tab") {
        const elements = Array.from(drawer?.querySelectorAll<HTMLElement>("a,button:not(:disabled),input") || []);
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [sidebar]);

  return <div className={`chat-app ${sidebar ? "sidebar-open" : ""}`}>
    <a href="#message" className="skip-link">Skip to message composer</a>
    {sidebar && <button className="sidebar-backdrop" onClick={() => setSidebar(false)} aria-label="Close conversation navigation" />}
    <aside ref={drawerRef} className="sidebar" id="conversation-sidebar" aria-label="Conversations">
      <Sidebar sessions={chat.sessions} activeId={chat.activeId} ready={chat.ready} storageError={chat.storageError}
        select={(id) => { chat.select(id); setSidebar(false); }} newChat={newChat} close={() => setSidebar(false)} restore={() => { setSidebar(false); openModal("restore"); }} {...theme} />
    </aside>
    <main className="workspace" inert={sidebar || undefined}>
      <header className="topbar">
        <div className="header-title"><button ref={menuRef} className="icon-button mobile-menu" onClick={() => setSidebar(true)} aria-label="Open conversation sidebar" aria-expanded={sidebar} aria-controls="conversation-sidebar"><Menu size={20} /></button>
          <button className="assistant-selector" onClick={() => openModal("details")} aria-label="About Xander’s assistant"><span>Xander’s</span><span className="header-assistant">Assistant</span><ChevronDown size={14} /></button></div>
        <div className="header-right"><span className="support-label">Restaurant support</span><button className="icon-button" onClick={() => openModal("details")} aria-label="Conversation information"><Info size={18} /></button></div>
      </header>
      {chat.activeSession && <div className="thread-toolbar"><span title={chat.activeSession.title}>{chat.activeSession.title}</span><div>
        <button className="icon-button" onClick={() => openModal("rename")} aria-label="Rename conversation"><Pencil size={14} /></button>
        <button className="icon-button" onClick={chat.reload} disabled={chat.thread.pending || chat.thread.loading} aria-label="Reload conversation history"><RefreshCw size={14} className={chat.thread.loading ? "spin" : ""} /></button>
        <button className="icon-button" onClick={() => openModal("remove")} disabled={chat.thread.pending} aria-label="Remove conversation shortcut"><Trash2 size={14} /></button>
      </div></div>}
      <div className="chat-scroll" ref={scrollRef}>
        {!chat.ready || chat.thread.loading ? <div className="history-loading" role="status"><LoaderCircle size={23} className="spin" /><span>Opening your conversation…</span></div>
          : chat.thread.messages.length || chat.thread.error || chat.thread.pending ? <MessageList key={chat.activeId} messages={chat.thread.messages} pending={chat.thread.pending} error={chat.thread.error} reload={chat.reload} scrollRef={scrollRef} />
          : <Welcome disabled={!chat.ready} onPrompt={(query) => { chat.setDraft(query); document.getElementById("message")?.focus(); }} />}
      </div>
      <Composer value={chat.draft} onChange={chat.setDraft} onSend={() => void chat.send(chat.draft)} disabled={!chat.ready || chat.thread.loading} pending={chat.thread.pending} hasError={!!chat.thread.error} />
    </main>
    {modal && <Dialog title={modal === "restore" ? "Pick up a conversation" : modal === "rename" ? "Rename conversation" : modal === "remove" ? "Remove this shortcut?" : "A little about your assistant"} onClose={() => setModal(null)}>
      {modal === "details" && <><div className="about-mark"><Asterisk size={29} /><span>Xander’s assistant</span></div><p className="dialog-description">A little help with the menu, prices, and concerns about your order. Your conversation gives the assistant context as you chat.</p>
        {chat.activeId && <div className="session-details"><label>Conversation ID</label><div><code>{chat.activeId}</code><CopyButton text={chat.activeId} label="Copy conversation ID" /></div><p>Keep this ID to reopen your conversation on another device.</p></div>}
        <p className="dialog-note">Messages are stored by the restaurant’s assistant service. This browser remembers your conversation shortcuts. Anyone with a conversation ID can use it to retrieve that history.</p><button className="dialog-primary" onClick={() => setModal(null)}>Back to conversation</button></>}
      {modal === "restore" && <form onSubmit={(e) => { e.preventDefault(); if (field.trim()) { chat.restore(field.trim()); setModal(null); } }}><p className="dialog-description">Have a conversation ID? Enter it to load the messages saved by the assistant.</p><label className="field-label" htmlFor="session-id">Conversation ID</label><input id="session-id" className="dialog-input" value={field} onChange={(e) => setField(e.target.value)} placeholder="e.g. 12345" maxLength={200} required autoFocus /><p className="dialog-note">You can find the ID in the information panel of an existing conversation.</p><button className="dialog-primary" disabled={!field.trim()}>Restore conversation</button></form>}
      {modal === "rename" && <form onSubmit={(e) => { e.preventDefault(); if (field.trim() && chat.activeId) { chat.rename(chat.activeId, field.trim()); setModal(null); } }}><label className="field-label" htmlFor="conversation-name">Conversation name</label><input id="conversation-name" className="dialog-input" value={field} onChange={(e) => setField(e.target.value)} maxLength={80} required autoFocus /><button className="dialog-primary" disabled={!field.trim()}>Save name</button></form>}
      {modal === "remove" && <><p className="dialog-description">This removes the conversation from this browser’s sidebar. Messages remain saved on the assistant service.</p><div className="session-details"><label>Save the ID if you want to restore it later</label><div><code>{chat.activeId}</code><CopyButton text={chat.activeId || ""} label="Copy conversation ID" /></div></div><div className="dialog-actions"><button className="dialog-secondary" onClick={() => setModal(null)}>Keep conversation</button><button className="dialog-primary danger" onClick={() => { if (chat.activeId) chat.remove(chat.activeId); setModal(null); }}>Remove shortcut</button></div></>}
    </Dialog>}
  </div>;
}
