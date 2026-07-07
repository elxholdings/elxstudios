import 'server-only';

import { ELX_STUDIO_COMPANY_ID } from './meta';
import { getSupabaseAdminClient } from './supabase/admin';
import { defaultIntroAudioMix, introAudioSettingKey, normalizeIntroAudioMix } from './intro-audio-config';

export async function getIntroAudioMix() {
  const admin = getSupabaseAdminClient();
  if (!admin) return defaultIntroAudioMix;
  const { data } = await admin
    .from('settings')
    .select('value')
    .eq('company_id', ELX_STUDIO_COMPANY_ID)
    .eq('key', introAudioSettingKey)
    .eq('is_secret', false)
    .maybeSingle();
  return normalizeIntroAudioMix(data?.value || defaultIntroAudioMix);
}
