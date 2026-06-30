export type Variant = {
  id: string;
  name: string;
  angle: string;
  headline: string;
  subheadline: string;
  cta: string;
  bodyPoints: string[];
  targetPersona: 'transitioning' | 'founding' | 'both';
};

export const variants: Variant[] = [
  {
    id: 'A',
    name: 'Pain-First',
    angle: 'The broken CI nightmare',
    headline: "You didn't break it. Something upstream did.",
    subheadline:
      "FrameDrift keeps an eye on your AI stack and tells you what broke before your CI does.",
    cta: 'Watch My Stack',
    bodyPoints: [
      'Watches LangChain, LlamaIndex, OpenAI SDK, LiveKit, and a handful of others',
      'Figures out which of your files actually care about the change',
      'Morning digest: what changed, what broke, why it matters to you',
    ],
    targetPersona: 'founding',
  },
  {
    id: 'B',
    name: 'Speed-First',
    angle: 'Ship faster',
    headline: 'Stop losing days to upstream surprises.',
    subheadline:
      "AI frameworks move fast. FrameDrift tells you when your stack shifts so you're dealing with it, not discovering it.",
    cta: 'Get Early Access',
    bodyPoints: [
      'Zero-config setup. Point at your repo and we handle the rest.',
      'You hear about it before your users do',
      'Works with your existing CI/CD pipeline',
    ],
    targetPersona: 'founding',
  },
  {
    id: 'C',
    name: 'Learning-First',
    angle: 'For engineers moving into AI',
    headline: 'The AI stack keeps changing. Keep up without burning out.',
    subheadline:
      "FrameDrift watches what's moving in LangChain, LlamaIndex, and the rest so you can tell what's worth your time and what isn't.",
    cta: 'Stay Current',
    bodyPoints: [
      "A weekly note on what moved and what it means for where you're at",
      "Tells you when something you're actually using has changed",
      'Built by someone who went through this exact transition',
    ],
    targetPersona: 'transitioning',
  },
  {
    id: 'D',
    name: 'Intelligence-First',
    angle: 'Not just alerts, actual reasoning',
    headline: 'Dependabot tells you what changed. FrameDrift tells you what it means.',
    subheadline:
      'Most tools tell you what changed. FrameDrift tells you whether to care, which files are affected, and what to do.',
    cta: 'See It In Action',
    bodyPoints: [
      'Looks at your actual codebase, not a generic changelog',
      'Severity scoring: skip it, watch it, or fix it now',
      'Breaking changes explained in plain English with code context',
    ],
    targetPersona: 'both',
  },
  {
    id: 'E',
    name: 'Ecosystem-First',
    angle: 'The whole AI stack, tracked',
    headline: 'No team can keep up with the AI ecosystem. FrameDrift can.',
    subheadline:
      "Not just version bumps. FrameDrift catches API rewrites, deprecations, and the kind of shifts that break things quietly.",
    cta: 'Join the Waitlist',
    bodyPoints: [
      'Covers models, frameworks, runtimes, and orchestration tools',
      'Tracks LangChain, LlamaIndex, LiveKit, Bun, OpenAI SDK, HuggingFace, and more',
      'A shared log of breaking changes, with Claude to help figure out what actually matters',
    ],
    targetPersona: 'both',
  },
];
