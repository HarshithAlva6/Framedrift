export type Persona = 'transitioning' | 'founding';

export type BehaviorSignal = {
  variantId: string;
  persona: Persona;
  scrollDepth: number;
  timeOnPage: number;
  ctaClicks: number;
  sectionEngagement: {
    hero: number;
    features: number;
    cta: number;
  };
  bounced: boolean;
};

function gaussianRandom(mean: number, stdDev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Base engagement rates per variant+persona combo
const BASE_RATES: Record<string, Record<Persona, { scroll: number; time: number; ctaRate: number }>> = {
  A: {
    founding: { scroll: 78, time: 95, ctaRate: 0.38 },
    transitioning: { scroll: 52, time: 58, ctaRate: 0.18 },
  },
  B: {
    founding: { scroll: 70, time: 82, ctaRate: 0.30 },
    transitioning: { scroll: 55, time: 62, ctaRate: 0.20 },
  },
  C: {
    founding: { scroll: 48, time: 52, ctaRate: 0.14 },
    transitioning: { scroll: 80, time: 98, ctaRate: 0.40 },
  },
  D: {
    founding: { scroll: 72, time: 88, ctaRate: 0.33 },
    transitioning: { scroll: 68, time: 80, ctaRate: 0.29 },
  },
  E: {
    founding: { scroll: 60, time: 70, ctaRate: 0.22 },
    transitioning: { scroll: 62, time: 74, ctaRate: 0.24 },
  },
};

export function simulateSessions(
  variantId: string,
  persona: Persona,
  n: number = 50
): BehaviorSignal[] {
  const base = BASE_RATES[variantId]?.[persona] ?? { scroll: 55, time: 65, ctaRate: 0.20 };
  const sessions: BehaviorSignal[] = [];

  for (let i = 0; i < n; i++) {
    const scrollDepth = clamp(gaussianRandom(base.scroll, base.scroll * 0.15), 5, 100);
    const timeOnPage = clamp(gaussianRandom(base.time, base.time * 0.15), 5, 240);

    // CTA click probability influenced by scroll depth and time
    const ctaMultiplier = (scrollDepth / 100) * 0.5 + (Math.min(timeOnPage, 120) / 120) * 0.5;
    const adjustedCtaRate = clamp(base.ctaRate * ctaMultiplier * 2, 0, 1);
    const ctaClicks = Math.random() < adjustedCtaRate ? 1 : 0;

    const bounced = scrollDepth < 25 && timeOnPage < 20;

    const heroTime = clamp(gaussianRandom(timeOnPage * 0.35, 5), 2, timeOnPage);
    const featuresTime = clamp(gaussianRandom(timeOnPage * 0.45, 5), 2, timeOnPage);
    const ctaTime = timeOnPage - heroTime - featuresTime > 2 ? timeOnPage - heroTime - featuresTime : 3;

    sessions.push({
      variantId,
      persona,
      scrollDepth: Math.round(scrollDepth),
      timeOnPage: Math.round(timeOnPage),
      ctaClicks,
      sectionEngagement: {
        hero: Math.round(heroTime),
        features: Math.round(featuresTime),
        cta: Math.round(ctaTime),
      },
      bounced,
    });
  }

  return sessions;
}

// V2 baselines — derived from synthesis of best-performing variants, ~20% boost
const V2_BASES: Record<Persona, { scroll: number; time: number; ctaRate: number }> = {
  transitioning: { scroll: 85, time: 108, ctaRate: 0.46 },
  founding: { scroll: 83, time: 102, ctaRate: 0.44 },
};

export function simulateV2Sessions(persona: Persona, n: number = 50): BehaviorSignal[] {
  const base = V2_BASES[persona];
  const sessions: BehaviorSignal[] = [];

  for (let i = 0; i < n; i++) {
    const scrollDepth = clamp(gaussianRandom(base.scroll, base.scroll * 0.13), 5, 100);
    const timeOnPage = clamp(gaussianRandom(base.time, base.time * 0.13), 5, 240);
    const ctaMultiplier = (scrollDepth / 100) * 0.5 + (Math.min(timeOnPage, 120) / 120) * 0.5;
    const adjustedCtaRate = clamp(base.ctaRate * ctaMultiplier * 2, 0, 1);
    const ctaClicks = Math.random() < adjustedCtaRate ? 1 : 0;
    const bounced = scrollDepth < 20 && timeOnPage < 15;
    const heroTime = clamp(gaussianRandom(timeOnPage * 0.35, 5), 2, timeOnPage);
    const featuresTime = clamp(gaussianRandom(timeOnPage * 0.45, 5), 2, timeOnPage);
    const ctaTime = timeOnPage - heroTime - featuresTime > 2 ? timeOnPage - heroTime - featuresTime : 3;

    sessions.push({
      variantId: 'V2',
      persona,
      scrollDepth: Math.round(scrollDepth),
      timeOnPage: Math.round(timeOnPage),
      ctaClicks,
      sectionEngagement: {
        hero: Math.round(heroTime),
        features: Math.round(featuresTime),
        cta: Math.round(ctaTime),
      },
      bounced,
    });
  }

  return sessions;
}

export type BehaviorSummary = {
  variantId: string;
  persona: Persona;
  avgScrollDepth: number;
  avgTimeOnPage: number;
  ctaClickRate: number;
  bounceRate: number;
  avgSectionEngagement: {
    hero: number;
    features: number;
    cta: number;
  };
};

export function summarizeSessions(sessions: BehaviorSignal[]): BehaviorSummary[] {
  const groups = new Map<string, BehaviorSignal[]>();

  for (const s of sessions) {
    const key = `${s.variantId}-${s.persona}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  const summaries: BehaviorSummary[] = [];
  for (const [, group] of groups) {
    const n = group.length;
    summaries.push({
      variantId: group[0].variantId,
      persona: group[0].persona,
      avgScrollDepth: Math.round(group.reduce((a, s) => a + s.scrollDepth, 0) / n),
      avgTimeOnPage: Math.round(group.reduce((a, s) => a + s.timeOnPage, 0) / n),
      ctaClickRate: parseFloat((group.reduce((a, s) => a + s.ctaClicks, 0) / n).toFixed(3)),
      bounceRate: parseFloat((group.filter((s) => s.bounced).length / n).toFixed(3)),
      avgSectionEngagement: {
        hero: Math.round(group.reduce((a, s) => a + s.sectionEngagement.hero, 0) / n),
        features: Math.round(group.reduce((a, s) => a + s.sectionEngagement.features, 0) / n),
        cta: Math.round(group.reduce((a, s) => a + s.sectionEngagement.cta, 0) / n),
      },
    });
  }

  return summaries;
}
