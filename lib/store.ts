import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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

const DATA_DIR = join(process.cwd(), 'data');
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
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(EVENTS_FILE, JSON.stringify(events));
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
