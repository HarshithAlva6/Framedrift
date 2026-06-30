import { getAllEvents } from '@/lib/store';
import { aggregateEvents, hasEnoughData } from '@/lib/events';
import { computeScores } from '@/lib/scoring';

export async function GET() {
  const events = getAllEvents();
  const summaries = aggregateEvents(events);
  const scores = computeScores(summaries);

  return Response.json({
    sessionCount: new Set(events.map((e) => e.sessionId)).size,
    eventCount: events.length,
    hasEnoughData: hasEnoughData(events),
    summaries,
    scores,
  });
}

export async function DELETE() {
  const { clearEvents } = await import('@/lib/store');
  clearEvents();
  return Response.json({ ok: true });
}
