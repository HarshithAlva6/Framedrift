'use client';

import { useEffect, useRef } from 'react';
import type { Variant } from '@/lib/variants';

function genSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type Props = {
  variant: Variant;
  persona: string;
};

export default function LiveLandingPage({ variant, persona }: Props) {
  const sessionId = useRef(genSessionId());
  const startTime = useRef(Date.now());
  const milestones = useRef(new Set<number>());

  function track(type: string, value?: number) {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variantId: variant.id,
        sessionId: sessionId.current,
        type,
        value,
        persona,
        ts: Date.now(),
      }),
    }).catch(() => {});
  }

  useEffect(() => {
    track('pageview');

    const onScroll = () => {
      const el = document.documentElement;
      const pct = Math.round((el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1)) * 100);
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !milestones.current.has(m)) {
          milestones.current.add(m);
          track('scroll', m);
        }
      }
    };

    const onUnload = () => {
      const seconds = Math.round((Date.now() - startTime.current) / 1000);
      navigator.sendBeacon(
        '/api/track',
        JSON.stringify({
          variantId: variant.id,
          sessionId: sessionId.current,
          type: 'time_spent',
          value: seconds,
          persona,
          ts: Date.now(),
        })
      );
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  function handleCta() {
    track('cta_click');
    alert('Thanks for your interest — you are on the list.');
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-white/6 bg-[#0d1117]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-white">FrameDrift</span>
          <button
            onClick={handleCta}
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-white"
            style={{ background: '#c07830' }}
          >
            {variant.cta}
          </button>
        </div>
      </nav>

      {/* Layout */}
      <main className="mx-auto max-w-5xl px-6">
        <Layout variant={variant} onCta={handleCta} />
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/6 px-6 py-6 text-center text-xs text-white/15">
        FrameDrift · <a href="/admin" className="underline underline-offset-2 hover:text-white/30">Admin</a>
      </footer>
    </div>
  );
}

function Cta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onClick}
        className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: '#c07830' }}
      >
        {label}
      </button>
      <span className="text-xs text-white/20">No credit card required</span>
    </div>
  );
}

function PersonaBadge({ persona }: { persona: string }) {
  const labels: Record<string, string> = {
    founding: 'founding engineers',
    transitioning: 'engineers moving into AI',
    both: 'AI engineers',
    unknown: 'engineers',
  };
  return (
    <div className="mb-5 inline-block rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/35">
      {labels[persona] ?? 'engineers'}
    </div>
  );
}

function Layout({ variant, onCta }: { variant: Variant; onCta: () => void }) {
  switch (variant.id) {
    case 'A': return <LayoutA variant={variant} onCta={onCta} />;
    case 'B': return <LayoutB variant={variant} onCta={onCta} />;
    case 'C': return <LayoutC variant={variant} onCta={onCta} />;
    case 'D': return <LayoutD variant={variant} onCta={onCta} />;
    case 'E': return <LayoutE variant={variant} onCta={onCta} />;
    default:  return <LayoutA variant={variant} onCta={onCta} />;
  }
}

// A: Pain-first — starts with a terminal incident, then the relief
function LayoutA({ variant, onCta }: { variant: Variant; onCta: () => void }) {
  return (
    <>
      <section className="pb-16 pt-20">
        <PersonaBadge persona={variant.targetPersona} />
        <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl font-display">
          {variant.headline}
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-white/45">{variant.subheadline}</p>
        <div className="mb-10 max-w-xl rounded-lg border border-white/8 bg-black/40 p-5 font-mono text-sm">
          <div className="mb-2 text-white/25">$ npm run build</div>
          <div className="mb-1 text-red-400/80">✖  Cannot find module &apos;langchain/vectorstores/chroma&apos;</div>
          <div className="mb-1 text-white/25">   at rag.ts:3:24 — changed in langchain@0.2.17</div>
          <div className="mt-4 border-t border-white/6 pt-3 text-sm" style={{ color: '#c07830' }}>
            ↳ FrameDrift flagged this 6 hours before you shipped.
          </div>
        </div>
        <Cta label={variant.cta} onClick={onCta} />
      </section>
      <FeatureGrid points={variant.bodyPoints} />
    </>
  );
}

// B: Speed-first — lead with stats
function LayoutB({ variant, onCta }: { variant: Variant; onCta: () => void }) {
  const stats = [
    { value: '2.4 days', label: 'avg lost when something breaks' },
    { value: '47+', label: 'AI releases tracked per month' },
    { value: '< 5 min', label: 'to know if your code is affected' },
  ];
  return (
    <>
      <section className="border-b border-white/6 py-8">
        <div className="grid grid-cols-3 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-xs text-white/30">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16">
        <PersonaBadge persona={variant.targetPersona} />
        <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl font-display">
          {variant.headline}
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-white/45">{variant.subheadline}</p>
        <Cta label={variant.cta} onClick={onCta} />
      </section>
      <FeatureGrid points={variant.bodyPoints} />
    </>
  );
}

// C: Learning-first — editorial with digest preview
function LayoutC({ variant, onCta }: { variant: Variant; onCta: () => void }) {
  const digest = [
    { dot: '#ef4444', pkg: 'langchain@0.2.18', note: 'VectorStore interface removed' },
    { dot: '#c07830', pkg: 'openai@4.28.0',    note: 'response_format field renamed' },
    { dot: '#4ade80', pkg: 'llama-index@0.10.4', note: 'documentation update only' },
  ];
  return (
    <>
      <section className="py-16">
        <PersonaBadge persona={variant.targetPersona} />
        <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl font-display">
          {variant.headline}
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-white/45">{variant.subheadline}</p>
        <div className="mb-10 max-w-md overflow-hidden rounded-lg border border-white/8 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
            <span className="text-xs font-medium text-white/40">This week in your stack</span>
            <span className="font-mono text-[10px] text-white/20">Jun 28, 2025</span>
          </div>
          {digest.map((d, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-white/4 px-4 py-3 last:border-0">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: d.dot }} />
              <span className="w-44 flex-shrink-0 font-mono text-xs text-white/50">{d.pkg}</span>
              <span className="text-xs text-white/30">{d.note}</span>
            </div>
          ))}
        </div>
        <Cta label={variant.cta} onClick={onCta} />
      </section>
      <FeatureList points={variant.bodyPoints} />
    </>
  );
}

// D: Intelligence-first — comparison table
function LayoutD({ variant, onCta }: { variant: Variant; onCta: () => void }) {
  const rows = [
    { label: 'Detects version changes',           others: true,  fd: true },
    { label: 'Explains what changed',             others: true,  fd: true },
    { label: 'Impact on your specific files',     others: false, fd: true },
    { label: 'Severity scoring',                  others: false, fd: true },
    { label: 'Plain-English reasoning',           others: false, fd: true },
  ];
  return (
    <>
      <section className="py-16">
        <PersonaBadge persona={variant.targetPersona} />
        <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl font-display">
          {variant.headline}
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-white/45">{variant.subheadline}</p>
        <div className="mb-10 max-w-lg overflow-hidden rounded-lg border border-white/8">
          <div className="grid grid-cols-3 border-b border-white/8 bg-white/[0.02]">
            <div className="px-4 py-2.5 text-xs text-white/20" />
            <div className="px-4 py-2.5 text-center text-xs font-medium text-white/30">Other tools</div>
            <div className="px-4 py-2.5 text-center text-xs font-medium" style={{ color: '#c07830' }}>FrameDrift</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-3 border-b border-white/5 last:border-0">
              <div className="px-4 py-3 text-sm text-white/45">{r.label}</div>
              <div className="px-4 py-3 text-center text-sm text-white/25">{r.others ? '✓' : '✗'}</div>
              <div className="px-4 py-3 text-center text-sm font-semibold" style={{ color: r.fd ? '#c07830' : 'rgba(255,255,255,0.2)' }}>✓</div>
            </div>
          ))}
        </div>
        <Cta label={variant.cta} onClick={onCta} />
      </section>
    </>
  );
}

// E: Ecosystem-first — tool mosaic then pitch
function LayoutE({ variant, onCta }: { variant: Variant; onCta: () => void }) {
  const tools = ['LangChain', 'LlamaIndex', 'OpenAI SDK', 'LiveKit', 'Bun', 'HuggingFace', 'Anthropic SDK', 'LiteLLM', 'ChromaDB', 'Pinecone', 'Weaviate', 'CrewAI'];
  return (
    <>
      <section className="py-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/20">What we watch</p>
        <div className="mb-12 flex flex-wrap gap-2">
          {tools.map((t) => (
            <span key={t} className="rounded border border-white/8 bg-white/[0.03] px-3 py-1.5 font-mono text-sm text-white/40">
              {t}
            </span>
          ))}
          <span className="rounded border border-white/5 bg-white/[0.01] px-3 py-1.5 font-mono text-sm text-white/15">+more</span>
        </div>
        <PersonaBadge persona={variant.targetPersona} />
        <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl font-display">
          {variant.headline}
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-white/45">{variant.subheadline}</p>
        <Cta label={variant.cta} onClick={onCta} />
      </section>
      <FeatureGrid points={variant.bodyPoints} />
    </>
  );
}

function FeatureGrid({ points }: { points: string[] }) {
  return (
    <section className="border-t border-white/6 py-16">
      <p className="mb-8 text-xs font-medium uppercase tracking-widest text-white/20">Three things</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {points.map((p, i) => (
          <div key={i} className="rounded-lg border border-white/6 bg-white/[0.02] p-5">
            <div className="mb-3 font-mono text-xs" style={{ color: 'rgba(192,120,48,0.6)' }}>0{i + 1}</div>
            <p className="text-sm leading-relaxed text-white/55">{p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureList({ points }: { points: string[] }) {
  return (
    <section className="border-t border-white/6 py-16">
      <div className="flex flex-col gap-4">
        {points.map((p, i) => (
          <div key={i} className="flex items-start gap-4">
            <span className="font-mono text-xs" style={{ color: 'rgba(192,120,48,0.6)' }}>0{i + 1}</span>
            <p className="text-sm leading-relaxed text-white/55">{p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
