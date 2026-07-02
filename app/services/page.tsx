import { redirect } from 'next/navigation';
import { resolveLocale } from '../locale';

export default async function ServicesPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  redirect(`/?intro=1&lang=${encodeURIComponent(locale)}`);
}
