import 'server-only';

import { ELX_STUDIO_COMPANY_ID } from './meta';
import { getSupabaseAdminClient } from './supabase/admin';
import { defaultWhatsAppRouting, normalizeWhatsAppRouting } from './whatsapp-config';

export async function getWhatsAppRouting() {
  const admin = getSupabaseAdminClient();
  if (!admin) return defaultWhatsAppRouting;
  const { data } = await admin.from('settings').select('value').eq('company_id', ELX_STUDIO_COMPANY_ID).eq('key', 'whatsapp_routing').eq('is_secret', false).maybeSingle();
  return normalizeWhatsAppRouting(data?.value || defaultWhatsAppRouting);
}
