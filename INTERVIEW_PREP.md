# FrameDrift — Interview Prep & Build Log

## What This App Does (30-second pitch)

FrameDrift is a **self-improving landing page optimizer**. It:
1. Serves 5 real landing page variants to visitors — each person is randomly assigned one via a cookie
2. Tracks real user behavior live (scroll depth, time on page, CTA clicks) and accumulates it across restarts
3. Scores each variant using a weighted formula (conversion 45%, engagement 35%, retention 20%)
4. Sends scores + summaries to Claude, which reasons about winners and generates a V2 variant
5. Admin dashboard supports three data modes: Real, Simulated, or Mixed

---

## File Map

| File | What it does |
|---|---|
| `proxy.ts` | Assigns a random variant cookie (`fd_variant`) on first visit to `/` |
| `lib/variants.ts` | 5 variant definitions — messaging angle, headline, CTA, body points, target persona |
| `lib/simulation.ts` | Synthetic user behavior engine — Box-Muller noise, persona-matched baselines |
| `lib/scoring.ts` | Weighted composite score (engagement 35%, conversion 45%, retention 20%) |
| `lib/store.ts` | Event store — in-memory cache backed by `data/events.json` for persistence across restarts |
| `lib/events.ts` | Aggregates raw `TrackedEvent[]` into `BehaviorSummary[]` per variant/persona |
| `app/page.tsx` | Server component — reads `fd_variant` cookie, renders the assigned variant |
| `app/admin/page.tsx` | Renders the Dashboard |
| `app/api/track/route.ts` | POST — receives scroll/time/CTA events from live visitors |
| `app/api/events/route.ts` | GET — returns aggregated summaries + scores; DELETE clears all events |
| `app/api/analyze/route.ts` | POST — sends data to Claude, parses JSON response |
| `components/LiveLandingPage.tsx` | Full tracked landing page — fires pageview, scroll milestones, CTA click, time on page via sendBeacon |
| `components/Dashboard.tsx` | Admin orchestrator — polls real data every 5s, three-way data mode toggle |
| `components/LandingPageCard.tsx` | Renders a variant preview card with 5 structurally different layouts |
| `components/BehaviorChart.tsx` | 4-panel Recharts bar chart (scroll, time, CTA rate, composite score) |
| `components/WinnerPanel.tsx` | Shows Claude's winners per persona + key insights |
| `components/V2Panel.tsx` | Shows V2 variant with side-by-side diff vs. winners |

---

## The 5 Variants

| ID | Name | Angle | Layout | Target Persona |
|---|---|---|---|---|
| A | Pain-First | Broken CI nightmare | Terminal block showing a failing build | Founding |
| B | Speed-First | Ship faster | Stats strip (2.4 days / 47+ / <5 min) then hero | Founding |
| C | Learning-First | Transitioning into AI | Editorial digest preview with color-coded status dots | Transitioning |
| D | Intelligence-First | Reasoning, not just alerts | Comparison table (Other tools vs FrameDrift) | Both |
| E | Ecosystem-First | The whole AI stack | Tool mosaic (LangChain, LlamaIndex, etc.) then hero | Both |

Each variant has a genuinely different layout structure — not just copy swaps.

---

## How Real Tracking Works

**Variant assignment:**
- `proxy.ts` intercepts every request to `/`
- If no `fd_variant` cookie exists, picks one of `['A','B','C','D','E']` at random and sets it (24h expiry)
- Same visitor always sees the same variant within that window

**Event tracking (in `components/LiveLandingPage.tsx`):**
- `pageview` — fired on mount
- `scroll` — fired at 25/50/75/100% milestones, deduplicated
- `time_spent` — fired on tab close via `navigator.sendBeacon` (reliable at unload)
- `cta_click` — fired on CTA button press

**Persistence:**
- Events POST to `/api/track` → `lib/store.ts` appends to `global.__eventStore` AND writes to `data/events.json`
- On server restart, `getStore()` reads `data/events.json` back into memory — no data loss
- "Clear sessions" in the dashboard wipes both memory and the file

**Two distinct roles — cookies vs. file persistence:**
- Cookie = which variant to show this browser (lives in the browser)
- File = what visitors did (lives on the server, survives restarts)

---

## Data Mode Toggle (Admin Dashboard)

Three modes selectable at any time:

| Mode | What it uses | When to use |
|---|---|---|
| **Real** | Only live sessions from `/api/events` | When enough real visitors have come through |
| **Mixed** | Averages real + simulated per variant | Real data anchors results; simulation fills variants with no traffic yet |
| **Simulated** | 50 synthetic sessions per variant/persona | Demo, cold start, or when no real traffic exists |

Switching modes is non-destructive — real and simulated data are stored separately in state.

**Mixed mode mechanics:** `mergeSummaries()` pairs up real and simulated `BehaviorSummary` by `(variantId, persona)`. Where both exist, every metric is averaged. Where only one exists, it passes through as-is.

---

## Simulation Logic (key for interview)

- **50 sessions** per variant per persona = 500 total sessions
- Base engagement rates are hardcoded to reflect messaging-persona fit (e.g. Variant A performs ~40% better with founding engineers)
- **Box-Muller transform** adds ±15% Gaussian noise so results look realistic, not fake
- CTA click rate is gated on scroll depth AND time on page (deeper + longer = higher probability)
- Bounce is triggered when scroll < 25% AND time < 20 seconds

---

## Scoring Formula

```
compositeScore =
  engagementScore * 0.35 +   // (scrollDepth + normalized timeOnPage) / 2
  conversionScore * 0.45 +   // ctaClickRate * 100
  retentionScore  * 0.20     // (1 - bounceRate) * 100
```

CTA click rate is weighted highest (0.45) because it's the most direct signal of purchase intent.

---

## Claude Prompt Structure

The `/api/analyze` route sends Claude:
- All 5 variant definitions (JSON)
- Composite scores per variant per persona (JSON)
- Behavioral summaries per variant per persona (JSON)

Claude is asked to:
1. Pick a winner per persona and explain WHY using the data
2. Surface 3 key insights about what messaging elements worked
3. Generate a V2 variant synthesizing the best elements
4. Write a rationale paragraph explaining V2's hypothesis

Response is returned as structured JSON and parsed client-side.

---

## Dashboard State Machine

```
idle
  → [real sessions come in via polling] → simulated (auto)
  → [Simulate visitors] → simulating → simulated
  → [Ask Claude what won] → analyzing → complete
```

Error state falls back to `simulated` so the user can retry without re-running.

---

## Tech Stack Decisions (be ready to justify)

| Choice | Why |
|---|---|
| Next.js App Router | API routes co-located with UI, no separate backend needed |
| `proxy.ts` (Next.js 16) | Replaces `middleware.ts` — runs before page render, perfect for cookie-based variant assignment |
| `navigator.sendBeacon` | Only reliable way to fire a request at tab close — fetch would get cancelled |
| File-based event store | Zero dependencies, survives restarts — swap for Redis/Postgres in production |
| Recharts | Lightweight, React-native charting — no D3 complexity |
| Claude claude-sonnet-4-6 | Best reasoning-to-cost ratio for structured JSON output |
| Tailwind v4 | New CSS-first config — `@import "tailwindcss"` instead of config file |

---

## What Makes This Impressive (say this in the interview)

1. **Operationally real** — actual visitors get randomly assigned variants; actual behavior is tracked and persists
2. **Three data modes** — Real, Mixed, Simulated; shows understanding of cold-start problem in A/B testing
3. **The AI layer reasons, not just reports** — Claude explains WHY a variant won using behavioral evidence
4. **Two-persona insight** — surfaces that founding vs. transitioning engineers respond to different messages
5. **V2 generation** — the system doesn't just evaluate, it learns and proposes the next iteration
6. **Self-referential** — the tool used to build the landing page IS the tool being marketed

---

## Common Interview Questions

**Q: Why cookies for variant assignment instead of a database?**
A: Cookies are the right tool for this job — they live in the browser, ensuring the same visitor always sees the same variant. A database would track user identity server-side, which you'd add for cross-device consistency or to survive cookie clearing. For this prototype, cookies are sufficient and correct.

**Q: Why not just store everything in the database and skip cookies?**
A: They solve different problems. Cookie = which variant to show this browser. Database/file = what visitors did. You need both. Without the cookie, the same person might see a different variant on each visit, which would corrupt your data by splitting one user's session across multiple variants.

**Q: Why simulate behavior instead of waiting for real traffic?**
A: Simulation lets the evaluator see the full loop in 20 minutes rather than waiting days for traffic. The challenge explicitly permits it. Real tracking is already wired up — simulation is just the fallback when sessions are sparse.

**Q: What does "Mixed" mode mean?**
A: It averages real and simulated behavioral metrics per variant. If variant A has 3 real sessions and variant B has none, Mixed uses real data for A and simulated for B. It's useful early in a test when some variants have real signal and others don't yet.

**Q: How would you scale this for real users?**
A: Replace `data/events.json` with Postgres or Redis. The scoring and Claude analysis layers are already production-ready. Add proper user identification (fingerprint or auth) to handle cookie clearing. Add statistical significance checks before declaring a winner.

**Q: Why is conversion weighted at 45%?**
A: CTA clicks are the most direct signal of intent. Scroll depth and time on page are engagement proxies — necessary but not sufficient. A variant that keeps users reading but never converts is worse than one with shorter time but higher CTA rate.

**Q: What would V3 look like?**
A: Run V2 against real users, feed actual behavioral data back into Claude, and iterate. Over time you'd build a corpus of what messaging patterns work for this audience — a self-improving GTM engine.
