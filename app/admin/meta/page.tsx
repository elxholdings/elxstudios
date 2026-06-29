import type { Metadata } from 'next';
import { requireStaff } from '../../lib/auth';
import { safeMetaConfig } from '../../lib/meta';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import MetaClient, { type MetaAction, type MetaIntegration, type MetaLead, type MetaWebhookEvent } from './meta-client';

export const metadata: Metadata = { title: 'Meta Platform' };

export default async function MetaAdminPage() {
  await requireStaff();
  const admin = getSupabaseAdminClient();
  const empty = { integrations: [] as MetaIntegration[], leads: [] as MetaLead[], events: [] as MetaWebhookEvent[], actions: [] as MetaAction[] };
  if (!admin) return <p className="bg-red-50 p-6 font-bold text-red-700">Supabase service access is not configured.</p>;
  const [integrationsResult, leadsResult, eventsResult, actionsResult] = await Promise.all([
    admin.from('meta_integrations').select('id, product, external_account_id, display_name, status, scopes, token_expires_at, metadata, updated_at').order('updated_at', { ascending: false }),
    admin.from('meta_leads').select('id, leadgen_id, contact_name, contact_email, contact_phone, status, fields, created_time, created_at').order('created_at', { ascending: false }).limit(100),
    admin.from('meta_webhook_events').select('id, provider, object_type, processing_status, received_at, processing_error').order('received_at', { ascending: false }).limit(25),
    admin.from('meta_action_log').select('id, action, target_id, status, external_result_id, error_message, created_at').order('created_at', { ascending: false }).limit(25),
  ]);
  const data = {
    integrations: (integrationsResult.data || empty.integrations) as unknown as MetaIntegration[],
    leads: (leadsResult.data || empty.leads) as unknown as MetaLead[],
    events: (eventsResult.data || empty.events) as unknown as MetaWebhookEvent[],
    actions: (actionsResult.data || empty.actions) as unknown as MetaAction[],
  };
  return <MetaClient {...data} config={safeMetaConfig()} />;
}
