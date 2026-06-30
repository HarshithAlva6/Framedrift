'use client';

import type { Variant } from '@/lib/variants';

type Props = {
  variant: Variant;
  isWinner?: boolean;
};

const personaLabel: Record<string, string> = {
  founding: 'founding engineers',
  transitioning: 'engineers moving into AI',
  both: 'AI engineers',
};

function Nav({ variant }: { variant: Variant }) {
  return (
    <div className="flex items-center justify-between border-b border-white/6 px-8 py-3">
      <span className="text-sm font-semibold tracking-tight text-white">FrameDrift</span>
      <div className="flex items-center gap-6">
        <span className="hidden text-xs text-white/25 sm:block">Docs</span>
        <span className="hidden text-xs text-white/25 sm:block">Pricing</span>
        <div className="rounded border border-white/15 px-3 py-1 text-xs font-medium text-white/60">
          {variant.cta}
        </div>
      </div>
    </div>
  );
}

function Footer({ variant }: { variant: Variant }) {
  return (
    <div className="border-t border-white/6 px-8 py-3 flex items-center justify-between">
      <span className="font-mono text-[10px] text-white/12">variant-{variant.id.toLowerCase()} · {variant.name}</span>
      <span className="font-mono text-[10px] text-white/12">{variant.angle}</span>
    </div>
  );
}

function BrowserChrome() {
  return (
    <div className="flex items-center gap-2 border-b border-white/6 bg-[#090c11] px-4 py-2.5">
      <div className="flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-white/8" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/8" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/8" />
      </div>
      <div className="mx-auto flex-1 max-w-xs rounded bg-white/4 px-3 py-1 text-center text-[10px] text-white/18 font-mono">
        framedrift.dev
      </div>
    </div>
  );
}

// Variant A: Pain-First — narrative / incident report style
function LayoutA({ variant }: { variant: Variant }) {
  return (
    <>
      <div className="px-8 pb-8 pt-10">
        <div className="mb-4 inline-block rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/35">
          {personaLabel[variant.targetPersona]}
        </div>
        <h1 className="mb-4 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white">
          {variant.headline}
        </h1>
        <p className="mb-7 max-w-md text-base leading-relaxed text-white/45">{variant.subheadline}</p>

        {/* Terminal block */}
        <div className="mb-7 rounded-lg border border-white/8 bg-black/40 p-4 font-mono text-xs">
          <div className="mb-2 text-white/25">$ npm run build</div>
          <div className="mb-1 text-red-400/80">✖ Error: Cannot find module &apos;langchain/vectorstores/chroma&apos;</div>
          <div className="mb-1 text-white/25">  at Object.&lt;anonymous&gt; (/app/src/rag.ts:3:24)</div>
          <div className="text-white/25">  Module changed in langchain@0.2.17</div>
          <div className="mt-3 border-t border-white/6 pt-3 text-[11px]" style={{color:'#c07830'}}>
            ↳ FrameDrift flagged this 6 hours before you shipped.
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{background:'#c07830'}}>
            {variant.cta}
          </button>
          <span className="text-xs text-white/20">No credit card required</span>
        </div>
      </div>

      <div className="mx-8 border-t border-white/6" />
      <div className="px-8 py-7">
        <p className="mb-5 text-xs font-medium uppercase tracking-widest text-white/20">Three things</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {variant.bodyPoints.map((point, i) => (
            <div key={i} className="rounded-lg border border-white/6 bg-white/[0.02] p-4">
              <div className="mb-2 text-xs font-mono" style={{color:'rgba(192,120,48,0.6)'}}>0{i + 1}</div>
              <p className="text-sm leading-snug text-white/55">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Variant B: Speed-First — metrics-led, stats above the fold
function LayoutB({ variant }: { variant: Variant }) {
  const stats = [
    { value: '2.4 days', label: 'avg days lost when something breaks' },
    { value: '47+', label: 'AI framework releases tracked per month' },
    { value: '< 5 min', label: 'to know if your code is affected' },
  ];
  return (
    <>
      {/* Stats strip */}
      <div className="border-b border-white/6 bg-white/[0.015] px-8 py-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-white/30 leading-tight mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 pb-8 pt-8">
        <div className="mb-3 inline-block rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/35">
          {personaLabel[variant.targetPersona]}
        </div>
        <h1 className="mb-4 max-w-lg text-3xl font-bold leading-tight tracking-tight text-white">
          {variant.headline}
        </h1>
        <p className="mb-7 max-w-md text-base leading-relaxed text-white/45">{variant.subheadline}</p>
        <div className="flex items-center gap-4">
          <button className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{background:'#c07830'}}>
            {variant.cta}
          </button>
          <span className="text-xs text-white/20">No credit card required</span>
        </div>
      </div>

      <div className="mx-8 border-t border-white/6" />
      <div className="px-8 py-7">
        <p className="mb-5 text-xs font-medium uppercase tracking-widest text-white/20">Three things</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {variant.bodyPoints.map((point, i) => (
            <div key={i} className="rounded-lg border border-white/6 bg-white/[0.02] p-4">
              <div className="mb-2 text-xs font-mono" style={{color:'rgba(192,120,48,0.6)'}}>0{i + 1}</div>
              <p className="text-sm leading-snug text-white/55">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Variant C: Learning-First — editorial / digest preview
function LayoutC({ variant }: { variant: Variant }) {
  const digest = [
    { status: 'breaking', color: '#ef4444', label: 'LangChain 0.2.18', note: 'VectorStore interface removed' },
    { status: 'watch', color: '#c07830', label: 'OpenAI SDK 4.28', note: 'response_format field renamed' },
    { status: 'safe', color: '#4ade80', label: 'LlamaIndex 0.10.4', note: 'documentation update only' },
  ];
  return (
    <>
      <div className="px-8 pb-8 pt-10">
        <div className="mb-4 inline-block rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/35">
          {personaLabel[variant.targetPersona]}
        </div>
        <h1 className="mb-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-white">
          {variant.headline}
        </h1>
        <p className="mb-7 max-w-lg text-base leading-relaxed text-white/45">{variant.subheadline}</p>

        {/* Digest preview */}
        <div className="mb-7 rounded-lg border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/6 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40">This week in your stack</span>
            <span className="text-[10px] text-white/20 font-mono">Jun 28, 2025</span>
          </div>
          {digest.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/4 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background: item.color}} />
              <span className="text-xs font-mono text-white/60 w-36 flex-shrink-0">{item.label}</span>
              <span className="text-xs text-white/35">{item.note}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{background:'#c07830'}}>
            {variant.cta}
          </button>
          <span className="text-xs text-white/20">Weekly digest, free</span>
        </div>
      </div>

      <div className="mx-8 border-t border-white/6" />
      <div className="px-8 py-7">
        <div className="flex flex-col gap-3">
          {variant.bodyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 text-sm" style={{color:'rgba(192,120,48,0.7)'}}>→</div>
              <p className="text-sm leading-snug text-white/50">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Variant D: Intelligence-First — comparison table
function LayoutD({ variant }: { variant: Variant }) {
  const rows = [
    { feature: 'Detects version changes', others: true, fd: true },
    { feature: 'Explains what changed', others: true, fd: true },
    { feature: 'Impact on your specific files', others: false, fd: true },
    { feature: 'Severity scoring', others: false, fd: true },
    { feature: 'Plain-English reasoning', others: false, fd: true },
  ];
  return (
    <>
      <div className="px-8 pb-8 pt-10">
        <div className="mb-4 inline-block rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/35">
          {personaLabel[variant.targetPersona]}
        </div>
        <h1 className="mb-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-white">
          {variant.headline}
        </h1>
        <p className="mb-7 max-w-lg text-base leading-relaxed text-white/45">{variant.subheadline}</p>

        {/* Comparison table */}
        <div className="mb-7 rounded-lg border border-white/8 overflow-hidden">
          <div className="grid grid-cols-3 border-b border-white/8 bg-white/[0.02]">
            <div className="px-4 py-2.5 text-xs text-white/25"></div>
            <div className="px-4 py-2.5 text-xs font-medium text-white/35 text-center">Other tools</div>
            <div className="px-4 py-2.5 text-xs font-medium text-center" style={{color:'#c07830'}}>FrameDrift</div>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-b border-white/5 last:border-0">
              <div className="px-4 py-2.5 text-xs text-white/45">{row.feature}</div>
              <div className="px-4 py-2.5 text-center">
                {row.others
                  ? <span className="text-xs text-white/30">✓</span>
                  : <span className="text-xs text-white/15">✗</span>}
              </div>
              <div className="px-4 py-2.5 text-center">
                <span className="text-xs font-semibold" style={{color:'#c07830'}}>✓</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{background:'#c07830'}}>
            {variant.cta}
          </button>
          <span className="text-xs text-white/20">No credit card required</span>
        </div>
      </div>
    </>
  );
}

// Variant E: Ecosystem-First — coverage mosaic
function LayoutE({ variant }: { variant: Variant }) {
  const tools = [
    'LangChain', 'LlamaIndex', 'OpenAI SDK', 'LiveKit',
    'Bun', 'HuggingFace', 'Anthropic SDK', 'LiteLLM',
    'ChromaDB', 'Pinecone', 'Weaviate', 'CrewAI',
  ];
  return (
    <>
      <div className="px-8 pb-8 pt-10">
        {/* Ecosystem mosaic first */}
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/20">What we watch</p>
        <div className="mb-8 flex flex-wrap gap-2">
          {tools.map((t) => (
            <span key={t} className="rounded border border-white/8 bg-white/[0.03] px-2.5 py-1 text-xs text-white/40 font-mono">
              {t}
            </span>
          ))}
          <span className="rounded border border-white/6 bg-white/[0.01] px-2.5 py-1 text-xs text-white/20 font-mono">
            +more
          </span>
        </div>

        <div className="mb-4 inline-block rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/35">
          {personaLabel[variant.targetPersona]}
        </div>
        <h1 className="mb-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-white">
          {variant.headline}
        </h1>
        <p className="mb-7 max-w-lg text-base leading-relaxed text-white/45">{variant.subheadline}</p>

        <div className="flex items-center gap-4">
          <button className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{background:'#c07830'}}>
            {variant.cta}
          </button>
          <span className="text-xs text-white/20">No credit card required</span>
        </div>
      </div>

      <div className="mx-8 border-t border-white/6" />
      <div className="px-8 py-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {variant.bodyPoints.map((point, i) => (
            <div key={i} className="rounded-lg border border-white/6 bg-white/[0.02] p-4">
              <div className="mb-2 text-xs font-mono" style={{color:'rgba(192,120,48,0.6)'}}>0{i + 1}</div>
              <p className="text-sm leading-snug text-white/55">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const LAYOUTS: Record<string, React.ComponentType<{ variant: Variant }>> = {
  A: LayoutA,
  B: LayoutB,
  C: LayoutC,
  D: LayoutD,
  E: LayoutE,
};

export default function LandingPageCard({ variant, isWinner }: Props) {
  const Layout = LAYOUTS[variant.id] ?? LayoutA;

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
      {isWinner && (
        <div className="absolute top-12 right-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-black" style={{background:'#c07830'}}>
          Winner
        </div>
      )}
      <BrowserChrome />
      <Nav variant={variant} />
      <Layout variant={variant} />
      <Footer variant={variant} />
    </div>
  );
}
