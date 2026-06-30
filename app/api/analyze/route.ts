import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

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

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);

    return Response.json(result);
  } catch (err) {
    console.error('Analyze route error:', err);
    return Response.json(
      { error: 'Analysis failed. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
