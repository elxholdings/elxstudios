import type { Metadata } from 'next';
import { requireStaff } from '../../lib/auth';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import { serviceCategories } from '../../data/services';
import ServicesClient, { type ServiceRow } from './services-client';
export const metadata: Metadata = { title: 'Services | Elx Operations' };
export default async function ServicesPage() { await requireStaff(); const admin = getSupabaseAdminClient(); if (!admin) return <p>Database unavailable.</p>; const { data } = await admin.from('services').select('id, slug, title, pricing_model, base_price, currency, turnaround_hours, is_active, supported_formats, category:service_categories(title)').order('title'); const services = (data || []).map((item) => ({ ...item, category: (item.category as unknown as { title: string } | null)?.title || 'Uncategorized' })) as unknown as ServiceRow[]; return <ServicesClient services={services} publicCategories={serviceCategories} />; }
