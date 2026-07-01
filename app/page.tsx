import { cookies } from 'next/headers';
import { getActiveVariants } from '@/lib/variantStore';
import { VARIANT_COOKIE_NAME } from '@/lib/constants';
import LiveLandingPage from '@/components/LiveLandingPage';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const cookieStore = await cookies();
  const sp = await searchParams;

  // Reads possible promoted-V2 overrides — a visitor assigned slot "A" may
  // see the original Pain-First copy, or a promoted V2 if A lost a round.
  const variants = getActiveVariants();
  const variantId = cookieStore.get(VARIANT_COOKIE_NAME)?.value ?? 'A';
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];

  // Persona can be set via ?p=founding or ?p=transitioning
  const persona = sp.p === 'founding' || sp.p === 'transitioning' ? sp.p : 'unknown';

  return <LiveLandingPage variant={variant} persona={persona} />;
}
