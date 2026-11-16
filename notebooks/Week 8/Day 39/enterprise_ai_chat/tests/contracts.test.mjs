import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChat, parseHistory } from '../src/lib/contracts.ts';
import { readSessions, saveSessions } from '../src/lib/storage.ts';

test('accepts actual FastAPI roles and rejects mismatched sessions and tool events', () => {
  assert.deepEqual(parseChat({ session_id: 'abc', answer: 'Hello' }, 'abc'), { session_id: 'abc', answer: 'Hello' });
  assert.throws(() => parseChat({ session_id: 'another', answer: 'Hello' }, 'abc'));
  assert.throws(() => parseChat({ session_id: 'abc', answer: null }, 'abc'));
  const messages = [{ role: 'user', content: 'Menu?' }, { role: 'ai', content: 'Here it is.' }];
  assert.deepEqual(parseHistory({ session_id: 'abc', messages }, 'abc').messages, messages);
  for (const invalid of [null, { session_id: 'abc', messages: [{ role: 'tool', content: 'private' }] },
    { session_id: 'abc', messages: [{ role: 'ai', content: {} }] }, { session_id: 'other', messages: [] }]) {
    assert.throws(() => parseHistory(invalid, 'abc'));
  }
});

test('corrupt or blocked storage does not prevent a conversation', () => {
  let data = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value),
  } });
  const sessions = [{ id: 'abc', title: 'Menu', updatedAt: 1 }];
  assert.equal(saveSessions(sessions, 'abc'), true);
  assert.deepEqual(readSessions(), { sessions, activeId: 'abc' });
  data.set('xander.sessions.v1', '{corrupt');
  assert.deepEqual(readSessions(), { sessions: [], activeId: null });
  data.set('xander.sessions.v1', JSON.stringify({ sessions: [null, {}, ...sessions], activeId: 'missing' }));
  assert.deepEqual(readSessions(), { sessions, activeId: null });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Blocked'); } });
  assert.equal(saveSessions(sessions, 'abc'), false);
  assert.deepEqual(readSessions(), { sessions: [], activeId: null });
  delete globalThis.localStorage;
});
