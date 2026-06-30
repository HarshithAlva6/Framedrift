import { addEvent } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { variantId, sessionId, type, value, persona, ts } = body;

    if (!variantId || !sessionId || !type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    addEvent({ variantId, sessionId, type, value, persona: persona ?? 'unknown', ts: ts ?? Date.now() });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
}
