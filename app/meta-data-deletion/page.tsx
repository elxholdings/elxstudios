import { SiteShell } from '../components/site-shell';

export default async function MetaDataDeletionPage({ searchParams }: { searchParams?: Promise<{ code?: string }> }) {
  const query = await searchParams;
  return <SiteShell><main className="px-5 py-20 md:px-10"><section className="mx-auto max-w-3xl bg-white p-8 md:p-14"><p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">Meta data deletion</p><h1 className="mt-4 text-5xl font-black tracking-[-.06em]">Your Meta connection was removed.</h1><p className="mt-6 leading-7 text-black/60">Stored access credentials associated with this Meta user have been revoked in Elx Studio. Operational records that must be retained for security, legal or accounting purposes remain governed by our Privacy Policy.</p>{query?.code && <p className="mt-7 bg-[#F5F2E8] p-4 text-sm"><strong>Confirmation:</strong> {query.code}</p>}</section></main></SiteShell>;
}
