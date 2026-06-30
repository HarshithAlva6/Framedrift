'use client';

import type { Variant } from '@/lib/variants';

type Props = {
  v2Variant: Variant;
  v2Rationale: string;
  winnerTransitioning: Variant | undefined;
  winnerFounding: Variant | undefined;
  v2TransScore?: number;
  v2FoundScore?: number;
  bestTransScore?: number;
  bestFoundScore?: number;
};

export default function V2Panel({
  v2Variant,
  v2Rationale,
  winnerTransitioning,
  winnerFounding,
  v2TransScore,
  v2FoundScore,
  bestTransScore,
  bestFoundScore,
}: Props) {
  const transLift = v2TransScore && bestTransScore ? v2TransScore - bestTransScore : null;
  const foundLift = v2FoundScore && bestFoundScore ? v2FoundScore - bestFoundScore : null;

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.015] p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">What Claude thinks to try next</h2>
          <p className="mt-0.5 text-sm text-white/30">Built from patterns in the winners, then run through the same simulation to see if it holds up</p>
        </div>
        {/* Score lift badges */}
        {(transLift !== null || foundLift !== null) && (
          <div className="flex gap-2">
            {transLift !== null && (
              <div className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-center">
                <div className="text-xs text-white/30 mb-0.5">Transitioning</div>
                <div className="text-sm font-bold" style={{color:'#d4944e'}}>+{transLift} pts</div>
              </div>
            )}
            {foundLift !== null && (
              <div className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-center">
                <div className="text-xs text-white/30 mb-0.5">Founding</div>
                <div className="text-sm font-bold" style={{color:'#d4944e'}}>+{foundLift} pts</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Three-way diff */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {winnerTransitioning && (
          <MiniCard label="Winner — Transitioning" variant={winnerTransitioning} score={bestTransScore} />
        )}
        {winnerFounding && (
          <MiniCard label="Winner — Founding" variant={winnerFounding} score={bestFoundScore} />
        )}
        <div className="rounded-lg border p-4" style={{borderColor:'rgba(192,120,48,0.3)', background:'rgba(192,120,48,0.04)'}}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{color:'#c07830'}}>V2 · Both</span>
            {v2TransScore && (
              <span className="text-xs font-mono font-bold" style={{color:'#d4944e'}}>{v2TransScore} / {v2FoundScore}</span>
            )}
          </div>
          <p className="mb-1 text-[10px] text-white/30">{v2Variant.angle}</p>
          <h3 className="text-sm font-bold leading-snug text-white">{v2Variant.headline}</h3>
          <p className="mt-2 text-xs leading-relaxed text-white/50">{v2Variant.subheadline}</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {v2Variant.bodyPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/40">
                <span style={{color:'#c07830'}}>→</span> {p}
              </li>
            ))}
          </ul>
          <div className="mt-4 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{background:'#c07830'}}>
            {v2Variant.cta}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/8 bg-white/[0.02] p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/25">Claude's thinking</h3>
        <p className="text-sm leading-relaxed text-white/55">{v2Rationale}</p>
      </div>
    </div>
  );
}

function MiniCard({ label, variant, score }: { label: string; variant: Variant; score?: number }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.02] p-4 opacity-65">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">{label}</span>
        {score && <span className="text-xs font-mono text-white/35">{score}</span>}
      </div>
      <p className="mb-1 text-[10px] text-white/25">{variant.angle}</p>
      <h3 className="text-sm font-bold leading-snug text-white">{variant.headline}</h3>
      <p className="mt-2 text-xs leading-relaxed text-white/40">{variant.subheadline}</p>
    </div>
  );
}
