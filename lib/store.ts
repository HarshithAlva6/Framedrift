import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export type TrackedEvent = {
  variantId: string;
  sessionId: string;
  type: 'pageview' | 'scroll' | 'cta_click' | 'time_spent';
  value?: number;
  persona: 'transitioning' | 'founding' | 'unknown';
  ts: number;
};

declare global {
  var __eventStore: TrackedEvent[] | undefined;
}

// process.cwd() is read-only on Vercel's serverless runtime; only os.tmpdir()
// (/tmp) is writable there. Locally this still resolves to a stable temp path.
// Note: /tmp on Vercel is ephemeral per instance, not shared across concurrent
// lambdas — fine for a local demo or a single warm instance, not a substitute
// for a real database in production.
const DATA_DIR = process.env.VERCEL ? join(tmpdir(), 'framedrift-data') : join(process.cwd(), 'data');
const EVENTS_FILE = join(DATA_DIR, 'events.json');

function loadFromDisk(): TrackedEvent[] {
  try {
    if (!existsSync(EVENTS_FILE)) return [];
    return JSON.parse(readFileSync(EVENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveToDisk(events: TrackedEvent[]) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(EVENTS_FILE, JSON.stringify(events));
  } catch {
    // Filesystem write failed (e.g. read-only runtime) — fall back to
    // in-memory only for this instance rather than crashing the request.
  }
}

function getStore(): TrackedEvent[] {
  if (!global.__eventStore) global.__eventStore = loadFromDisk();
  return global.__eventStore;
}

export function addEvent(e: TrackedEvent) {
  const store = getStore();
  store.push(e);
  saveToDisk(store);
}

export function getAllEvents(): TrackedEvent[] {
  return getStore();
}

export function clearEvents() {
  global.__eventStore = [];
  saveToDisk([]);
}
