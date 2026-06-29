import Link from 'next/link';
import { getAuthContext, staffRoles } from '../lib/auth';

export default async function AuthNav({ locale = 'en' }: { locale?: string }) {
  const { user, roles } = await getAuthContext();
  const suffix = `?lang=${encodeURIComponent(locale)}`;

  if (!user) {
    return <Link href={`/login${suffix}`} className="hidden text-sm font-bold sm:inline">Sign in</Link>;
  }

  const isStaff = roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]));
  return (
    <div className="flex items-center gap-3">
      {isStaff && <Link href={`/admin${suffix}`} className="hidden text-sm font-bold md:inline">Admin</Link>}
      <Link href={`/dashboard${suffix}`} className="hidden text-sm font-bold sm:inline">Workspace</Link>
      <form action="/auth/signout" method="post">
        <button className="text-sm font-bold text-black/50" type="submit">Sign out</button>
      </form>
    </div>
  );
}
