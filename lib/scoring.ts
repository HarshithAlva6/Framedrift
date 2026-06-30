import type { Persona } from './simulation';
import type { BehaviorSummary } from './simulation';
import { WEIGHT_CONVERSION, WEIGHT_ENGAGEMENT, WEIGHT_RETENTION } from './constants';

export type VariantScore = {
  variantId: string;
  persona: Persona;
  compositeScore: number;
  breakdown: {
    engagementScore: number;
    conversionScore: number;
    retentionScore: number;
  };
};

const WEIGHTS = {
  engagement: WEIGHT_ENGAGEMENT,
  conversion: WEIGHT_CONVERSION,
  retention: WEIGHT_RETENTION,
};

function normalize(value: number, min: number, max: number): number {
  return Math.round(((value - min) / (max - min)) * 100);
}

export function computeScores(summaries: BehaviorSummary[]): VariantScore[] {
  return summaries.map((s) => {
    // Engagement: blend scroll depth (0-100) and time on page (cap at 180s → 100)
    const scrollNorm = clamp(s.avgScrollDepth, 0, 100);
    const timeNorm = clamp(normalize(s.avgTimeOnPage, 0, 180), 0, 100);
    const engagementScore = Math.round(scrollNorm * 0.5 + timeNorm * 0.5);

    // Conversion: CTA click rate 0–1 → 0–100
    const conversionScore = Math.round(s.ctaClickRate * 100);

    // Retention: inverse bounce rate
    const retentionScore = Math.round((1 - s.bounceRate) * 100);

    const compositeScore = Math.round(
      engagementScore * WEIGHTS.engagement +
        conversionScore * WEIGHTS.conversion +
        retentionScore * WEIGHTS.retention
    );

    return {
      variantId: s.variantId,
      persona: s.persona,
      compositeScore,
      breakdown: {
        engagementScore,
        conversionScore,
        retentionScore,
      },
    };
  });
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
