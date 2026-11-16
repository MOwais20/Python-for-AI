# Xander’s Assistant

A separate Next.js 16.4.6 application for the existing FastAPI + LangGraph agent.
TypeScript, App Router, Tailwind CSS, Lucide icons and locally bundled fonts.
The Python backend is unchanged.

## Run locally

Requires Node.js 22.17 or newer and the existing backend listening on port 8000.

```bash
# From this directory
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Set `BACKEND_URL` in `.env.local` if the backend is
elsewhere, then restart Next.js. The value is server-only: the browser calls
`/api/ai/chat` and `/api/ai/history`, and Next.js forwards to FastAPI. This avoids
requiring CORS changes to the existing backend. Keep Next.js running as a Node
server; this application does not use a static export.

In a second terminal, start the existing backend as usual:

```bash
cd ../enterprise_ai_agent
uv run fastapi dev
```

For a production build:

```bash
npm run build
npm start
```

## Conversations

- A new conversation gets a UUID on its first send. That same ID accompanies every
  subsequent message, so the backend can maintain its LangGraph context.
- The browser stores conversation IDs, names, and last-activity timestamps.
  Messages are fetched from FastAPI and kept only in memory on the frontend.
- Reopening the app restores the selected conversation from the backend. Search,
  rename and remove manage this browser’s shortcuts. Removing a shortcut does
  **not** delete backend history: there is no delete endpoint.
- Use **Restore a conversation** to enter an older session ID such as `12345`.
  Get an existing conversation’s ID from the information button in the header.
  The backend has no list endpoint, so previously unknown sessions cannot be
  discovered automatically. An unknown ID returns an empty conversation.
- Requests continue when you switch conversations; each session has its own
  pending state. A session cannot send two messages concurrently in this app.
- Errors retain your draft and require you to reload history before sending again.
  A timeout can mean the backend is still running. Wait before reloading and check
  whether the message was already saved. POST requests never retry automatically.
- The API returns complete answers, so the UI shows a generic thinking state and
  then the final answer. No fake streaming, tool events or execution traces.

Light/dark theme follows the system initially and can be changed in the sidebar.
Enter sends; Shift+Enter adds a line. Markdown supports tables, lists, highlighted
code and copy controls. Raw HTML and remote Markdown images are not rendered.

## API contract

Inspected directly in `../enterprise_ai_agent/modules/ai_agent/`:

```text
POST /ai/chat
body:     { "query": "...", "session_id": "..." }
response: { "session_id": "...", "answer": "..." }

GET /ai/history?session_id=...
response: { "session_id": "...", "messages": [
  { "role": "user", "content": "..." },
  { "role": "ai", "content": "..." }
] }
```

The UI validates response shapes and session identity. The proxy validates inputs,
uses uncached requests with a three-minute timeout, and hides internal provider
errors. Frontend limits are 12,000 characters per message and 200 per session ID.

## Structure

```text
src/app/api/ai/   Same-origin FastAPI proxy routes
src/components/  Workspace, sidebar, composer, messages, Markdown, dialogs
src/hooks/       Conversation state and theme preference
src/lib/         API client, validated contracts, session storage, server forwarding
tests/           Contract/storage tests and isolated production proxy tests
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Tests require a completed production build. The proxy tests start an ephemeral
Next.js server and isolated HTTP fixture; they do not invoke a model or write to
FastAPI. See `QA.md` for live integration results and browser verification limits.

The requested `Leonxlnx/taste-skill` was installed at the repository root in
`.agents/skills/design-taste-frontend`. See `DESIGN.md` for the applied direction
and how the functional chat brief differs from the skill’s marketing templates.

## Deployment boundary

The existing backend has no user authentication or session ownership checks.
Anyone with a session ID can retrieve its history; the UI makes this explicit in
the information panel. Before exposing customer conversations publicly, provide
server-side authentication and authorization. The current app targets your
existing local development backend. In hosted environments, `localhost:8000`
refers to the Next.js server’s machine; configure a reachable `BACKEND_URL`.
