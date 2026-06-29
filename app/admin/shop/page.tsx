import type { Metadata } from 'next';
import { requireStaff } from '../../lib/auth';
import { getMediaAssets } from '../../lib/site-content';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import ShopManager, { type ProductRequest } from './shop-manager';
import type { DigitalProduct } from '../../lib/content-types';

export const metadata: Metadata = { title: 'Shop | Elx Operations' };
export default async function AdminShopPage() { await requireStaff(); const admin = getSupabaseAdminClient(); if (!admin) return <p>Database unavailable.</p>; const [{ data: products }, { data: requests }, media] = await Promise.all([admin.from('digital_products').select('*').order('sort_order'), admin.from('product_requests').select('*, product:digital_products(title)').order('created_at', { ascending: false }), getMediaAssets()]); return <ShopManager initialProducts={(products || []) as DigitalProduct[]} requests={(requests || []) as unknown as ProductRequest[]} media={media} />; }
