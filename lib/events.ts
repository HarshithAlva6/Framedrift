import type { TrackedEvent } from './store';
import type { BehaviorSummary, Persona } from './simulation';
import { MIN_SESSIONS_FOR_LIVE } from './constants';

type Session = {
  variantId: string;
  persona: Persona;
  maxScroll: number;
  timeOnPage: number;
  ctaClicked: boolean;
  eventCount: number;
};

export function aggregateEvents(events: TrackedEvent[]): BehaviorSummary[] {
  const sessionMap = new Map<string, Session>();

  for (const e of events) {
    const persona: Persona =
      e.persona === 'founding' || e.persona === 'transitioning' ? e.persona : 'founding';

    const key = `${e.sessionId}`;
    if (!sessionMap.has(key)) {
      sessionMap.set(key, {
        variantId: e.variantId,
        persona,
        maxScroll: 0,
        timeOnPage: 0,
        ctaClicked: false,
        eventCount: 0,
      });
    }

    const s = sessionMap.get(key)!;
    s.eventCount++;

    if (e.type === 'scroll' && e.value !== undefined) {
      s.maxScroll = Math.max(s.maxScroll, e.value);
    }
    if (e.type === 'time_spent' && e.value !== undefined) {
      s.timeOnPage = e.value;
    }
    if (e.type === 'cta_click') {
      s.ctaClicked = true;
    }
  }

  // Group sessions by variantId + persona
  const groups = new Map<string, Session[]>();
  for (const s of sessionMap.values()) {
    const k = `${s.variantId}-${s.persona}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(s);
  }

  const summaries: BehaviorSummary[] = [];

  for (const [, sessions] of groups) {
    const n = sessions.length;
    if (n === 0) continue;

    const avgScrollDepth = Math.round(sessions.reduce((a, s) => a + s.maxScroll, 0) / n);
    const avgTimeOnPage = Math.round(sessions.reduce((a, s) => a + s.timeOnPage, 0) / n);
    const ctaClickRate = parseFloat((sessions.filter((s) => s.ctaClicked).length / n).toFixed(3));
    const bounceRate = parseFloat(
      (sessions.filter((s) => s.maxScroll < 25 && s.timeOnPage < 20).length / n).toFixed(3)
    );

    const heroAvg = Math.round(avgTimeOnPage * 0.35);
    const featuresAvg = Math.round(avgTimeOnPage * 0.45);

    summaries.push({
      variantId: sessions[0].variantId,
      persona: sessions[0].persona,
      avgScrollDepth,
      avgTimeOnPage,
      ctaClickRate,
      bounceRate,
      avgSectionEngagement: {
        hero: heroAvg,
        features: featuresAvg,
        cta: Math.max(avgTimeOnPage - heroAvg - featuresAvg, 2),
      },
    });
  }

  return summaries;
}

export function hasEnoughData(events: TrackedEvent[]): boolean {
  const sessions = new Set(events.map((e) => e.sessionId));
  return sessions.size >= MIN_SESSIONS_FOR_LIVE;
}
