import { requireStaff } from '../lib/auth';
import AdminShell from './admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, roles } = await requireStaff();
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
  return <AdminShell name={profile?.full_name || user.user_metadata.full_name || 'Elx administrator'} email={user.email || ''} roles={roles}>{children}</AdminShell>;
}
