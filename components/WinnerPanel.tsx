'use client';

import type { Variant } from '@/lib/variants';

type WinnerByPersona = {
  transitioning: { variantId: string; reasoning: string };
  founding: { variantId: string; reasoning: string };
};

type Props = {
  winnerByPersona: WinnerByPersona;
  keyInsights: string[];
  variants: Variant[];
};

export default function WinnerPanel({ winnerByPersona, keyInsights, variants }: Props) {
  const transitioningVariant = variants.find((v) => v.id === winnerByPersona.transitioning.variantId);
  const foundingVariant = variants.find((v) => v.id === winnerByPersona.founding.variantId);

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">What the data says</h2>
        <p className="mt-0.5 text-sm text-white/35">Claude read through the behavior signals and explained what drove the gap</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <WinnerCard
          persona="Transitioning Engineers"
          color="amber"
          variantId={winnerByPersona.transitioning.variantId}
          variantName={transitioningVariant?.name ?? ''}
          headline={transitioningVariant?.headline ?? ''}
          reasoning={winnerByPersona.transitioning.reasoning}
        />
        <WinnerCard
          persona="Founding Engineers"
          color="stone"
          variantId={winnerByPersona.founding.variantId}
          variantName={foundingVariant?.name ?? ''}
          headline={foundingVariant?.headline ?? ''}
          reasoning={winnerByPersona.founding.reasoning}
        />
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Patterns Claude noticed</h3>
        <ul className="flex flex-col gap-2">
          {keyInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
              <span className="mt-0.5 text-yellow-400 font-bold">{i + 1}.</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type WinnerCardProps = {
  persona: string;
  color: 'amber' | 'stone';
  variantId: string;
  variantName: string;
  headline: string;
  reasoning: string;
};

function WinnerCard({ persona, color, variantId, variantName, headline, reasoning }: WinnerCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{background:'rgba(192,120,48,0.15)',color:'#d4944e'}}>{persona}</span>
        <span className="font-mono text-sm font-bold" style={{color:'#d4944e'}}>Variant {variantId}</span>
      </div>
      <p className="mb-1 text-xs font-medium text-white/40">{variantName}</p>
      <p className="mb-3 text-sm font-semibold text-white leading-snug">{headline}</p>
      <p className="text-xs leading-relaxed text-white/60">{reasoning}</p>
    </div>
  );
}
