"use client";

import { Asterisk, ArrowUpRight, MessageSquare, Moon, PanelLeftClose, Plus, Search, Sun } from "lucide-react";
import { useState } from "react";
import type { Session } from "@/lib/contracts";

export function Sidebar({ sessions, activeId, select, newChat, close, restore, dark, toggleTheme, storageError, ready }: {
  sessions: Session[]; activeId: string | null; select: (id: string) => void;
  newChat: () => void; close: () => void; restore: () => void;
  dark: boolean; toggleTheme: () => void; storageError: boolean; ready: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = sessions.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
  const today = new Date().setHours(0, 0, 0, 0);
  const groups = [
    { label: "Today", sessions: filtered.filter((s) => s.updatedAt >= today) },
    { label: "Earlier", sessions: filtered.filter((s) => s.updatedAt < today) },
  ];
  return <>
    <div className="sidebar-brand"><button className="wordmark" onClick={newChat} aria-label="Xander home">xander<span>’s</span><span className="brand-dot">.</span></button>
      <button className="icon-button sidebar-close" onClick={close} aria-label="Close sidebar"><PanelLeftClose size={18} /></button></div>
    <div className="sidebar-content">
      <button className="new-chat" onClick={newChat} disabled={!ready}><Plus size={18} /><span>New conversation</span><span className="new-chat-mark">↗</span></button>
      <label className="search"><Search size={16} /><input aria-label="Search conversations" placeholder="Search conversations" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      <div className="history-list">
        {groups.map((group) => group.sessions.length > 0 && <div className="history-group" key={group.label}><h2>{group.label}</h2>
          {group.sessions.map((session) => <button key={session.id} className={`history-item ${activeId === session.id ? "active" : ""}`}
            aria-current={activeId === session.id ? "page" : undefined} onClick={() => select(session.id)} title={session.title}>
            <MessageSquare size={15} /><span>{session.title}</span></button>)}
        </div>)}
        {!ready ? <p className="sidebar-note">Loading conversations…</p> : !sessions.length ? <div className="history-empty"><MessageSquare size={22} strokeWidth={1.3} /><p>A fresh start</p><span>Your conversations will<br />find a home here.</span></div> : !filtered.length ? <p className="sidebar-note">No conversations found.</p> : null}
      </div>
      <button className="restore-link" onClick={restore} disabled={!ready}>Restore a conversation <ArrowUpRight size={14} /></button>
    </div>
    <div className="sidebar-footer">
      <div className="assistant-profile"><span className="profile-icon"><Asterisk size={23} strokeWidth={1.5} /></span><div><strong>Xander assistant</strong><span>Here to help with your visit</span></div>
        <button className="icon-button" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Light theme" : "Dark theme"}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button></div>
      <p className="device-note">{storageError ? "Storage unavailable. Save your session ID before leaving." : "Conversation shortcuts stay on this device."}</p>
    </div>
  </>;
}
