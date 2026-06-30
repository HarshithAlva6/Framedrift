'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { variants } from '@/lib/variants';
import type { Variant } from '@/lib/variants';
import { simulateSessions, simulateV2Sessions, summarizeSessions } from '@/lib/simulation';
import type { BehaviorSignal, BehaviorSummary, Persona } from '@/lib/simulation';
import { computeScores } from '@/lib/scoring';
import type { VariantScore } from '@/lib/scoring';
import { POLL_INTERVAL_MS } from '@/lib/constants';
import LandingPageCard from './LandingPageCard';
import BehaviorChart from './BehaviorChart';
import WinnerPanel from './WinnerPanel';
import V2Panel from './V2Panel';

type Phase = 'idle' | 'simulating' | 'simulated' | 'analyzing' | 'complete';
type DataMode = 'live' | 'mixed' | 'simulated';

type AIAnalysis = {
  winnerByPersona: {
    transitioning: { variantId: string; reasoning: string };
    founding: { variantId: string; reasoning: string };
  };
  keyInsights: string[];
  v2Variant: Variant;
  v2Rationale: string;
};

function mergeSummaries(real: BehaviorSummary[], sim: BehaviorSummary[]): BehaviorSummary[] {
  const keys = new Set([
    ...real.map((s) => `${s.variantId}-${s.persona}`),
    ...sim.map((s) => `${s.variantId}-${s.persona}`),
  ]);

  return Array.from(keys).map((key) => {
    const [variantId, persona] = key.split('-');
    const r = real.find((s) => s.variantId === variantId && s.persona === persona);
    const s = sim.find((s) => s.variantId === variantId && s.persona === persona);

    if (r && s) {
      return {
        variantId,
        persona: persona as Persona,
        avgScrollDepth: Math.round((r.avgScrollDepth + s.avgScrollDepth) / 2),
        avgTimeOnPage: Math.round((r.avgTimeOnPage + s.avgTimeOnPage) / 2),
        ctaClickRate: parseFloat(((r.ctaClickRate + s.ctaClickRate) / 2).toFixed(3)),
        bounceRate: parseFloat(((r.bounceRate + s.bounceRate) / 2).toFixed(3)),
        avgSectionEngagement: {
          hero: Math.round((r.avgSectionEngagement.hero + s.avgSectionEngagement.hero) / 2),
          features: Math.round((r.avgSectionEngagement.features + s.avgSectionEngagement.features) / 2),
          cta: Math.round((r.avgSectionEngagement.cta + s.avgSectionEngagement.cta) / 2),
        },
      };
    }
    return (r ?? s)!;
  });
}

export default function Dashboard() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [dataMode, setDataMode] = useState<DataMode>('live');

  // Live data from real sessions
  const [liveSummaries, setLiveSummaries] = useState<BehaviorSummary[]>([]);
  const [liveScores, setLiveScores] = useState<VariantScore[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [hasLiveData, setHasLiveData] = useState(false);

  // Simulated data
  const [simSummaries, setSimSummaries] = useState<BehaviorSummary[]>([]);
  const [simScores, setSimScores] = useState<VariantScore[]>([]);
  const [hasSimData, setHasSimData] = useState(false);

  // V2 + AI analysis
  const [v2Summaries, setV2Summaries] = useState<BehaviorSummary[]>([]);
  const [v2Scores, setV2Scores] = useState<VariantScore[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('A');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived active data based on current mode
  const activeSummaries = useMemo<BehaviorSummary[]>(() => {
    if (dataMode === 'live') return liveSummaries;
    if (dataMode === 'simulated') return simSummaries;
    return mergeSummaries(liveSummaries, simSummaries);
  }, [dataMode, liveSummaries, simSummaries]);

  const activeScores = useMemo<VariantScore[]>(
    () => computeScores(activeSummaries),
    [activeSummaries]
  );

  async function fetchLiveData() {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setSessionCount(data.sessionCount ?? 0);
      const enough = data.hasEnoughData ?? false;
      setHasLiveData(enough);
      if (enough) {
        setLiveSummaries(data.summaries ?? []);
        setLiveScores(data.scores ?? []);
        if (phase === 'idle') setPhase('simulated');
      }
    } catch {}
  }

  useEffect(() => {
    fetchLiveData();
    pollRef.current = setInterval(fetchLiveData, POLL_INTERVAL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // Switch mode and ensure phase reflects data availability
  function switchMode(mode: DataMode) {
    setDataMode(mode);
    setAnalysis(null);
    setV2Summaries([]);
    setV2Scores([]);
    const hasData =
      mode === 'live' ? hasLiveData :
      mode === 'simulated' ? hasSimData :
      hasLiveData || hasSimData;
    setPhase(hasData ? 'simulated' : 'idle');
  }

  function runSimulation() {
    setPhase('simulating');
    setError(null);
    setTimeout(() => {
      const allSessions: BehaviorSignal[] = [];
      for (const v of variants) {
        allSessions.push(...simulateSessions(v.id, 'transitioning', 50));
        allSessions.push(...simulateSessions(v.id, 'founding', 50));
      }
      const sums = summarizeSessions(allSessions);
      const sc = computeScores(sums);
      setSimSummaries(sums);
      setSimScores(sc);
      setHasSimData(true);
      setPhase('simulated');
    }, 800);
  }

  async function analyzeWithAI() {
    setPhase('analyzing');
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: activeScores, variants, behaviorSummary: activeSummaries }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);

      const v2Sessions: BehaviorSignal[] = [
        ...simulateV2Sessions('transitioning', 50),
        ...simulateV2Sessions('founding', 50),
      ];
      const v2Sums = summarizeSessions(v2Sessions);
      const v2Sc = computeScores(v2Sums);
      setV2Summaries(v2Sums);
      setV2Scores(v2Sc);
      setPhase('complete');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error occurred');
      setPhase('simulated');
    }
  }

  async function clearLiveData() {
    await fetch('/api/events', { method: 'DELETE' });
    setSessionCount(0);
    setHasLiveData(false);
    setLiveSummaries([]);
    setLiveScores([]);
    if (dataMode === 'live') {
      setPhase('idle');
      setAnalysis(null);
      setV2Summaries([]);
      setV2Scores([]);
    }
  }

  const winnerTransitioningId = analysis?.winnerByPersona.transitioning.variantId;
  const winnerFoundingId = analysis?.winnerByPersona.founding.variantId;

  const v2TransScore = v2Scores.find((s) => s.persona === 'transitioning')?.compositeScore;
  const v2FoundScore = v2Scores.find((s) => s.persona === 'founding')?.compositeScore;
  const bestTransScore = winnerTransitioningId
    ? activeScores.find((s) => s.variantId === winnerTransitioningId && s.persona === 'transitioning')?.compositeScore
    : undefined;
  const bestFoundScore = winnerFoundingId
    ? activeScores.find((s) => s.variantId === winnerFoundingId && s.persona === 'founding')?.compositeScore
    : undefined;

  const canSimulate = dataMode === 'simulated' || dataMode === 'mixed';
  const modeLabel = dataMode === 'live' ? 'real visitors' : dataMode === 'mixed' ? 'real + simulated visitors' : 'simulated visitors';

  return (
    <div className="min-h-screen bg-[#080b11] text-white">
      <header className="border-b border-white/10 bg-[#080b11]/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg font-mono font-bold text-sm text-white" style={{ background: '#c07830' }}>F</div>
            <div>
              <span className="font-bold text-white">FrameDrift</span>
              <span className="ml-2 text-xs text-white/25">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full ${hasLiveData ? 'bg-emerald-400' : 'bg-white/20'}`}
                style={hasLiveData ? { boxShadow: '0 0 6px #34d399' } : {}}
              />
              <span className="text-xs text-white/30">
                {sessionCount === 0 ? 'No live sessions' : `${sessionCount} session${sessionCount !== 1 ? 's' : ''} live`}
              </span>
            </div>
            {phase === 'simulating' && <span className="text-xs font-medium text-amber-500">Simulating...</span>}
            {phase === 'analyzing' && <span className="text-xs font-medium text-purple-400">Asking AI...</span>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Five pages. One winner. Then a better one.</h1>
          <p className="mt-1.5 max-w-xl text-sm text-white/35">
            Real visitors land on one of five variants at{' '}
            <a href="/" className="underline underline-offset-2 hover:text-white/50">framedrift.dev</a>.
            {' '}Their behavior is tracked here as it happens.
          </p>
        </div>

        {/* Data source toggle */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
            <ModeButton
              label="Real"
              active={dataMode === 'live'}
              disabled={!hasLiveData}
              disabledHint="No sessions yet"
              color="emerald"
              onClick={() => switchMode('live')}
            />
            <ModeButton
              label="Mixed"
              active={dataMode === 'mixed'}
              disabled={!hasLiveData && !hasSimData}
              disabledHint="Need data first"
              color="amber"
              onClick={() => switchMode('mixed')}
            />
            <ModeButton
              label="Simulated"
              active={dataMode === 'simulated'}
              disabled={false}
              color="white"
              onClick={() => switchMode('simulated')}
            />
          </div>

          {/* Badges */}
          {hasLiveData && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-0.5 text-[11px] text-emerald-400">
              {sessionCount} real
            </span>
          )}
          {hasSimData && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/35">
              100 simulated
            </span>
          )}

          {sessionCount > 0 && (
            <button onClick={clearLiveData} className="ml-auto text-xs text-white/20 hover:text-white/40 transition-colors">
              Clear real sessions
            </button>
          )}
        </div>

        {/* Mixed mode explanation */}
        {dataMode === 'mixed' && (
          <div className="mb-6 rounded-lg border border-white/6 bg-white/[0.02] px-4 py-3 text-xs text-white/35 leading-relaxed">
            Mixed mode averages real and simulated signals per variant. Real sessions anchor the distribution; simulation fills variants with no real traffic yet.
          </div>
        )}

        {/* Share links — shown when no live data */}
        {!hasLiveData && (
          <div className="mb-8 rounded-xl border border-white/8 bg-white/[0.02] p-5">
            <p className="mb-3 text-xs font-medium text-white/40">Share these links to collect real sessions</p>
            <div className="flex flex-col gap-2">
              {['founding', 'transitioning'].map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-white/25 capitalize">{p} engineers</span>
                  <code className="rounded bg-white/5 px-3 py-1 font-mono text-xs text-white/40">
                    framedrift.dev/?p={p}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variant Tabs */}
        <section className="mb-8">
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveTab(v.id)}
                className={`shrink-0 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  activeTab === v.id ? 'border-white/20 bg-white/5 text-white/80' : 'border-white/8 text-white/30 hover:text-white/50'
                } ${(v.id === winnerTransitioningId || v.id === winnerFoundingId) ? 'ring-1 ring-amber-500/40' : ''}`}
              >
                <span className="mr-1 font-mono text-white/20">{v.id}</span>
                {v.name}
                {(v.id === winnerTransitioningId || v.id === winnerFoundingId) && (
                  <span className="ml-1.5 text-xs" style={{ color: '#c07830' }}>*</span>
                )}
              </button>
            ))}
            {phase === 'complete' && analysis && (
              <button
                onClick={() => setActiveTab('V2')}
                className={`shrink-0 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  activeTab === 'V2' ? 'border-white/20 bg-white/5 text-white/80' : 'border-white/8 text-white/30 hover:text-white/50'
                }`}
              >
                <span className="mr-1 font-mono" style={{ color: 'rgba(192,120,48,0.5)' }}>V2</span>
                {analysis.v2Variant.name}
              </button>
            )}
          </div>
          {activeTab === 'V2' && analysis ? (
            <LandingPageCard variant={analysis.v2Variant} isWinner={false} />
          ) : (
            variants.filter((v) => v.id === activeTab).map((v) => (
              <LandingPageCard key={v.id} variant={v} isWinner={v.id === winnerTransitioningId || v.id === winnerFoundingId} />
            ))
          )}
        </section>

        {/* Actions */}
        <section className="mb-8 flex flex-wrap gap-3">
          {canSimulate && (
            <button
              onClick={runSimulation}
              disabled={phase === 'simulating' || phase === 'analyzing'}
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {phase === 'simulating' ? <><Spinner /> Simulating...</> : hasSimData ? 'Re-simulate visitors' : 'Simulate visitors'}
            </button>
          )}
          {(phase === 'simulated' || phase === 'analyzing' || phase === 'complete') && (
            <button
              onClick={analyzeWithAI}
              disabled={phase === 'analyzing' || phase === 'complete'}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: '#c07830' }}
            >
              {phase === 'analyzing' ? <><Spinner /> Asking AI...</> : 'Ask AI what won'}
            </button>
          )}
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-300">{error}</div>
        )}

        {/* Charts */}
        {(phase === 'simulated' || phase === 'analyzing' || phase === 'complete') && activeSummaries.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/30">
                How {modeLabel} behaved
              </h2>
              <DataSourcePill mode={dataMode} sessionCount={sessionCount} />
            </div>
            <BehaviorChart summaries={activeSummaries} scores={activeScores} v2Summaries={v2Summaries} v2Scores={v2Scores} />

            {/* Score table */}
            <div className="mt-6 overflow-hidden rounded-xl border border-white/8 bg-[#0d1117]">
              <div className="border-b border-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/30">Scores</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-white/25">
                    <th className="px-4 py-2 text-left">Variant</th>
                    <th className="px-4 py-2 text-right">Transitioning</th>
                    <th className="px-4 py-2 text-right">Founding</th>
                    <th className="px-4 py-2 text-right">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => {
                    const t = activeScores.find((s) => s.variantId === v.id && s.persona === 'transitioning');
                    const f = activeScores.find((s) => s.variantId === v.id && s.persona === 'founding');
                    const isWin = v.id === winnerTransitioningId || v.id === winnerFoundingId;
                    return (
                      <tr key={v.id} className={`border-b border-white/4 ${isWin ? 'bg-white/[0.02]' : ''}`}>
                        <td className="px-4 py-2.5 font-mono text-white/55">
                          {isWin && <span className="mr-1.5" style={{ color: '#c07830' }}>*</span>}
                          V-{v.id} <span className="text-white/25">{v.name}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-white/55">{t?.compositeScore ?? '–'}</td>
                        <td className="px-4 py-2.5 text-right text-white/55">{f?.compositeScore ?? '–'}</td>
                        <td className="px-4 py-2.5 text-right text-xs capitalize text-white/30">{v.targetPersona}</td>
                      </tr>
                    );
                  })}
                  {phase === 'complete' && v2Scores.length > 0 && (
                    <tr className="border-t border-white/10" style={{ background: 'rgba(192,120,48,0.05)' }}>
                      <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: '#d4944e' }}>
                        V2 <span className="font-normal text-white/30">{analysis?.v2Variant.name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold" style={{ color: '#d4944e' }}>
                        {v2TransScore ?? '–'}
                        {v2TransScore && bestTransScore && (
                          <span className="ml-1.5 text-[10px] text-white/30">+{v2TransScore - bestTransScore}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold" style={{ color: '#d4944e' }}>
                        {v2FoundScore ?? '–'}
                        {v2FoundScore && bestFoundScore && (
                          <span className="ml-1.5 text-[10px] text-white/30">+{v2FoundScore - bestFoundScore}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-white/30">both</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {phase === 'complete' && analysis && (
          <>
            <section className="mb-8">
              <WinnerPanel winnerByPersona={analysis.winnerByPersona} keyInsights={analysis.keyInsights} variants={variants} />
            </section>
            <section className="mb-8">
              <V2Panel
                v2Variant={analysis.v2Variant}
                v2Rationale={analysis.v2Rationale}
                winnerTransitioning={variants.find((v) => v.id === winnerTransitioningId)}
                winnerFounding={variants.find((v) => v.id === winnerFoundingId)}
                v2TransScore={v2TransScore}
                v2FoundScore={v2FoundScore}
                bestTransScore={bestTransScore}
                bestFoundScore={bestFoundScore}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

type ModeButtonProps = {
  label: string;
  active: boolean;
  disabled: boolean;
  disabledHint?: string;
  color: 'emerald' | 'amber' | 'white';
  onClick: () => void;
};

function ModeButton({ label, active, disabled, disabledHint, color, onClick }: ModeButtonProps) {
  const activeStyles: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    white: 'bg-white/8 text-white/75 border border-white/15',
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={disabled ? disabledHint : undefined}
      className={`relative rounded-md px-4 py-1.5 text-xs font-medium transition-all select-none ${
        active
          ? activeStyles[color]
          : disabled
          ? 'cursor-not-allowed text-white/15'
          : 'text-white/35 hover:text-white/55'
      }`}
    >
      {label}
      {disabled && (
        <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-white/10" />
      )}
    </button>
  );
}

function DataSourcePill({ mode, sessionCount }: { mode: DataMode; sessionCount: number }) {
  if (mode === 'live') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400/60">
        <span className="h-1 w-1 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px #34d399' }} />
        {sessionCount} live sessions
      </span>
    );
  }
  if (mode === 'mixed') {
    return (
      <span className="text-xs text-amber-500/50">
        {sessionCount > 0 ? `${sessionCount} real` : '0 real'} + simulated
      </span>
    );
  }
  return <span className="text-xs text-white/20">simulated data</span>;
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
