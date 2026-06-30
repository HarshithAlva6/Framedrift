'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { BehaviorSummary } from '@/lib/simulation';
import type { VariantScore } from '@/lib/scoring';

type Props = {
  summaries: BehaviorSummary[];
  scores: VariantScore[];
  v2Summaries?: BehaviorSummary[];
  v2Scores?: VariantScore[];
};

export default function BehaviorChart({ summaries, scores, v2Summaries = [], v2Scores = [] }: Props) {
  const variantIds = ['A', 'B', 'C', 'D', 'E'];
  const showV2 = v2Summaries.length > 0;

  function buildData(
    getValue: (sum: BehaviorSummary) => number,
    getV2Value?: (sum: BehaviorSummary) => number
  ) {
    const rows = variantIds.map((id) => {
      const t = summaries.find((s) => s.variantId === id && s.persona === 'transitioning');
      const f = summaries.find((s) => s.variantId === id && s.persona === 'founding');
      return {
        variant: id,
        Transitioning: t ? getValue(t) : 0,
        Founding: f ? getValue(f) : 0,
      };
    });

    if (showV2 && getV2Value) {
      const t2 = v2Summaries.find((s) => s.persona === 'transitioning');
      const f2 = v2Summaries.find((s) => s.persona === 'founding');
      rows.push({
        variant: 'V2',
        Transitioning: t2 ? getV2Value(t2) : 0,
        Founding: f2 ? getV2Value(f2) : 0,
      });
    }
    return rows;
  }

  const scrollData = buildData(
    (s) => s.avgScrollDepth,
    (s) => s.avgScrollDepth
  );
  const timeData = buildData(
    (s) => s.avgTimeOnPage,
    (s) => s.avgTimeOnPage
  );
  const ctaData = buildData(
    (s) => Math.round(s.ctaClickRate * 100),
    (s) => Math.round(s.ctaClickRate * 100)
  );

  const scoreData = variantIds.map((id) => {
    const t = scores.find((s) => s.variantId === id && s.persona === 'transitioning');
    const f = scores.find((s) => s.variantId === id && s.persona === 'founding');
    return { variant: id, Transitioning: t?.compositeScore ?? 0, Founding: f?.compositeScore ?? 0 };
  });
  if (showV2 && v2Scores.length > 0) {
    const t2 = v2Scores.find((s) => s.persona === 'transitioning');
    const f2 = v2Scores.find((s) => s.persona === 'founding');
    scoreData.push({ variant: 'V2', Transitioning: t2?.compositeScore ?? 0, Founding: f2?.compositeScore ?? 0 });
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <ChartCard title="Scroll depth (%)" data={scrollData} domain={[0, 100]} />
      <ChartCard title="Avg time on page (sec)" data={timeData} domain={[0, 140]} />
      <ChartCard title="CTA click rate (%)" data={ctaData} domain={[0, 55]} />
      <ChartCard title="Composite score" data={scoreData} domain={[0, 100]} highlight />
    </div>
  );
}

type ChartCardProps = {
  title: string;
  data: { variant: string; Transitioning: number; Founding: number }[];
  domain: [number, number];
  highlight?: boolean;
};

function ChartCard({ title, data, domain, highlight }: ChartCardProps) {
  return (
    <div
      className="rounded-xl border p-4 bg-[#0d1117]"
      style={{borderColor: highlight ? 'rgba(192,120,48,0.2)' : 'rgba(255,255,255,0.06)'}}
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">{title}</h3>
      <ResponsiveContainer width="100%" height={185}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="variant"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={domain}
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111318',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: 12,
            }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }} />
          <Bar dataKey="Transitioning" fill="rgba(255,255,255,0.35)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Founding" fill="#c07830" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
