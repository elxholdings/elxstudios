import type { Metadata } from 'next';
import { requireStaff } from '../../lib/auth';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import SettingsClient, { type SettingRow } from './settings-client';
export const metadata: Metadata = { title: 'Settings | Elx Operations' };
export default async function SettingsPage() { const { roles } = await requireStaff(); const admin = getSupabaseAdminClient(); if (!admin) return <p>Database unavailable.</p>; const { data } = await admin.from('settings').select('key, value, updated_at').eq('is_secret', false).order('key'); return <SettingsClient settings={(data || []) as SettingRow[]} canManage={roles.some((role) => ['super_admin', 'admin'].includes(role))} />; }
