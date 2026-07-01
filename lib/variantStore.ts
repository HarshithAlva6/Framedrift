import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { variants as baseVariants } from './variants';
import type { Variant } from './variants';

export type PromotionRecord = {
  replacedVariantId: string;
  v2Variant: Variant;
  promotedAt: number;
};

// Same Vercel-safe pattern as lib/store.ts — process.cwd() is read-only on
// Vercel's serverless runtime, only os.tmpdir() is writable there.
const DATA_DIR = process.env.VERCEL ? join(tmpdir(), 'framedrift-data') : join(process.cwd(), 'data');
const OVERRIDES_FILE = join(DATA_DIR, 'variant-overrides.json');

function loadOverrides(): Record<string, PromotionRecord> {
  try {
    if (!existsSync(OVERRIDES_FILE)) return {};
    return JSON.parse(readFileSync(OVERRIDES_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Record<string, PromotionRecord>) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides));
  } catch {
    // Degrade to in-memory-only for this instance rather than crashing.
  }
}

// proxy.ts (Edge runtime, no filesystem) keeps assigning visitors to the
// fixed slots A–E. Promotion doesn't add a new slot — it overwrites the
// *copy* served for one existing slot, the way reallocating traffic to a
// new hypothesis would replace the worst performer rather than adding a
// 6th arm. That's what keeps this compatible with Edge middleware.
export function getActiveVariants(): Variant[] {
  const overrides = loadOverrides();
  return baseVariants.map((v) => {
    const override = overrides[v.id];
    if (!override) return v;
    return { ...override.v2Variant, id: v.id };
  });
}

export function getPromotions(): Record<string, PromotionRecord> {
  return loadOverrides();
}

export function promoteVariant(replacedVariantId: string, v2Variant: Variant): PromotionRecord {
  const overrides = loadOverrides();
  const record: PromotionRecord = { replacedVariantId, v2Variant, promotedAt: Date.now() };
  overrides[replacedVariantId] = record;
  saveOverrides(overrides);
  return record;
}

export function resetPromotions() {
  saveOverrides({});
}
