import 'server-only';

import { ELX_STUDIO_COMPANY_ID } from './meta';
import { getSupabaseAdminClient } from './supabase/admin';

export async function logAdminAudit(input: { actorId: string; action: string; entityType: string; entityId?: string | null; oldData?: unknown; newData?: unknown; request?: Request }) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const forwarded = input.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  await admin.from('audit_logs').insert({
    company_id: ELX_STUDIO_COMPANY_ID,
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId || null,
    old_data: input.oldData ?? null,
    new_data: input.newData ?? null,
    ip_address: forwarded || null,
    user_agent: input.request?.headers.get('user-agent')?.slice(0, 1000) || null,
  });
}
