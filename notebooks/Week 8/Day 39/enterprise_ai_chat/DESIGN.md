Kind: software — a working restaurant AI assistant, not a marketing website.

Direction: warm paper, terracotta actions, charcoal text, editorial serif display
and a readable system sans for conversation. Dark mode mirrors the same hierarchy.
The existing backend supplies the Xander identity; no invented restaurant facts.
Voice: friendly, direct restaurant support, short labels and useful prompts.

Architecture
- Next.js App Router + TypeScript + Tailwind; small focused client components.
- Server-only FastAPI proxy, configured with BACKEND_URL; no backend changes.
- Typed API contract validation at the network boundary.
- Browser stores session shortcuts and active session, never message history.
- FastAPI SQLite remains the source of truth for messages. Import by session ID
  makes older sessions accessible without a backend session-list endpoint.
- Per-session request locks, abortable history reads, draft retention, explicit
  recovery after ambiguous failures. Never automatically repeat a POST.
- Markdown/GFM, highlighted code with copy, accessible mobile drawer and dialogs.

API contracts inspected in the existing schema.py, router.py and service.py:
- POST /ai/chat: {query: string, session_id: string} -> {session_id, answer: string}
- GET /ai/history?session_id=... -> {session_id, messages: {role: 'user'|'ai', content: string}[]}
- History excludes tool steps. The UI shows only a generic processing state.

Taste skill installed with npx skills add Leonxlnx/taste-skill and read before
implementation. Its typography, alignment, motion, truthful copy, focus and
responsive principles apply. Marketing section recipes, photo quotas, shader
scenes and static-export requirements do not fit this brief's functional chat
application; server route handlers are required for the FastAPI proxy.

Screens: one full-height workspace; sidebar, header, scrollable reading column,
bottom composer. Welcome screen uses generous space and four real task prompts.
Motion: once-only welcome entrance, short message appearance and button feedback;
reduced-motion preference disables animation. No fabricated tool events or chats.
