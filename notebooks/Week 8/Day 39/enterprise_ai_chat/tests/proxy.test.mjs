import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

// Exercises the production Next server against an isolated HTTP fixture.
// No model calls or writes to the real FastAPI database.
test('production proxy: real forwarding, validation and safe failures', { timeout: 45000 }, async (t) => {
  const requests = [];
  let backendStatus = 200;
  const fixture = http.createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    requests.push({ url: req.url, body: raw ? JSON.parse(raw) : null });
    res.writeHead(backendStatus, { 'Content-Type': 'application/json' });
    if (backendStatus !== 200) { res.end(JSON.stringify({ detail: 'secret-provider-token' })); return; }
    const url = new URL(req.url, 'http://fixture');
    res.end(JSON.stringify(req.method === 'POST'
      ? { session_id: JSON.parse(raw).session_id, answer: 'A real fixture response' }
      : { session_id: url.searchParams.get('session_id'), messages: [{ role: 'ai', content: 'Saved message' }] }));
  });
  await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve));
  const probe = http.createServer();
  await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${fixture.address().port}`, NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = ''; next.stdout.on('data', (d) => { output += d; }); next.stderr.on('data', (d) => { output += d; });
  t.after(async () => {
    next.kill('SIGTERM');
    await new Promise((resolve) => fixture.close(resolve));
  });
  let ready = false;
  for (let i = 0; i < 150; i++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* Wait for the test server. */ }
    if (next.exitCode !== null) break;
    await delay(100);
  }
  assert.ok(ready, output);
  const post = (body) => fetch(`${base}/api/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  await t.test('forwards the exact FastAPI chat contract', async () => {
    const res = await post({ query: 'Menu?', session_id: 'test abc', ignored: 'drop me' });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { session_id: 'test abc', answer: 'A real fixture response' });
    assert.deepEqual(requests.at(-1).body, { query: 'Menu?', session_id: 'test abc' });
    assert.equal(res.headers.get('cache-control'), 'no-store');
  });
  await t.test('encodes history session IDs without query injection', async () => {
    const id = 'abc &other=value/?';
    const res = await fetch(`${base}/api/ai/history?${new URLSearchParams({ session_id: id })}`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).session_id, id);
    const upstream = new URL(requests.at(-1).url, 'http://fixture');
    assert.equal(upstream.searchParams.get('session_id'), id);
    assert.equal(upstream.searchParams.has('other'), false);
  });
  await t.test('rejects empty, oversized and malformed requests before the backend', async () => {
    const count = requests.length;
    for (const body of [{ query: '', session_id: 'a' }, { query: 'x'.repeat(12001), session_id: 'a' }, { query: 'Hi', session_id: '' }]) {
      assert.equal((await post(body)).status, 400);
    }
    assert.equal((await fetch(`${base}/api/ai/chat`, { method: 'POST', body: '{invalid' })).status, 400);
    assert.equal((await fetch(`${base}/api/ai/history`)).status, 400);
    assert.equal(requests.length, count);
  });
  await t.test('does not expose upstream errors or credentials', async () => {
    for (const [status, expected] of [[500, 502], [429, 429], [422, 422]]) {
      backendStatus = status;
      const res = await post({ query: 'Hi', session_id: 'a' });
      assert.equal(res.status, expected);
      const text = await res.text();
      assert.ok(!text.includes('secret-provider-token'));
      assert.ok(JSON.parse(text).error);
    }
  });
  await t.test('unavailable backend yields a helpful service error', async () => {
    await new Promise((resolve) => fixture.close(resolve));
    const res = await post({ query: 'Hi', session_id: 'a' });
    assert.equal(res.status, 503);
    assert.match((await res.json()).error, /FastAPI/);
  });
});
