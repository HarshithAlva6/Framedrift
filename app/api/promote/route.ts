import { getActiveVariants, promoteVariant, getPromotions, resetPromotions } from '@/lib/variantStore';

const VALID_IDS = ['A', 'B', 'C', 'D', 'E'];

export async function GET() {
  return Response.json({
    variants: getActiveVariants(),
    promotions: getPromotions(),
  });
}

export async function POST(request: Request) {
  try {
    const { v2Variant, replaceVariantId } = await request.json();

    if (!v2Variant || !replaceVariantId) {
      return Response.json({ error: 'Missing v2Variant or replaceVariantId' }, { status: 400 });
    }
    if (!VALID_IDS.includes(replaceVariantId)) {
      return Response.json({ error: 'Invalid variant id' }, { status: 400 });
    }

    const record = promoteVariant(replaceVariantId, v2Variant);
    return Response.json({ ok: true, record, variants: getActiveVariants() });
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function DELETE() {
  resetPromotions();
  return Response.json({ ok: true, variants: getActiveVariants() });
}
