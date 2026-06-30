import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function POST(request: Request) {
  try {
    const { scores, variants, behaviorSummary } = await request.json();

    const prompt = `
You are a growth engineer analyzing A/B test results for FrameDrift, an AI stack drift intelligence tool.

Here are the 5 landing page variants that were tested:
${JSON.stringify(variants, null, 2)}

Here are the simulated behavior scores across two personas (transitioning engineers and founding engineers):
${JSON.stringify(scores, null, 2)}

Here is a summary of behavioral signals:
${JSON.stringify(behaviorSummary, null, 2)}

Please:
1. Identify the winning variant for each persona and explain WHY based on the behavioral signals
2. Identify patterns across variants — what messaging elements drove engagement?
3. Generate a new V2 variant that synthesizes the best-performing elements
4. Explain specifically what changed in V2 and the hypothesis behind each change

When writing the V2 variant (name, angle, headline, subheadline, cta, bodyPoints), match the voice of the existing 5 variants exactly:
- Concrete and specific, not abstract. "Stop losing days to upstream surprises" not "Optimize your workflow efficiency."
- Plain conversational English, like a developer explaining something to another developer.
- No em-dashes.
- Do NOT use these words or their variants: proactive, predictive, intelligent, intelligence, seamless, unlock, empower, revolutionize, leverage, robust, cutting-edge, supercharge, transform, elevate, streamline, synergy, holistic, ecosystem (unless referring to the actual AI/ML tooling ecosystem), game-changing, next-generation.
- The headline should name a real, specific problem or outcome, not a vague capability.

Format your response as JSON with this structure:
{
  "winnerByPersona": {
    "transitioning": { "variantId": "X", "reasoning": "..." },
    "founding": { "variantId": "X", "reasoning": "..." }
  },
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "v2Variant": {
    "id": "V2",
    "name": "...",
    "angle": "...",
    "headline": "...",
    "subheadline": "...",
    "cta": "...",
    "bodyPoints": ["...", "...", "..."],
    "targetPersona": "both"
  },
  "v2Rationale": "A paragraph explaining what changed from the winners and why"
}
`;

    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const result = JSON.parse(text);

    return Response.json(result);
  } catch (err) {
    console.error('Analyze route error:', err);
    return Response.json(
      { error: 'Analysis failed. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
