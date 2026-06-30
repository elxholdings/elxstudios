import { NextResponse } from 'next/server';
import { ELX_STUDIO_COMPANY_ID } from '../../../lib/meta';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

function clean(value: unknown, length = 500) { return typeof value === 'string' ? value.trim().slice(0, length) : ''; }

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (clean(body.company)) return NextResponse.json({ ok: true });
  const productId = clean(body.productId, 50); const name = clean(body.name, 150); const email = clean(body.email, 250).toLowerCase(); const whatsapp = clean(body.whatsapp, 80); const location = clean(body.location, 200); const notes = clean(body.notes, 1800); const packageId = clean(body.packageId, 80); const packageLabel = clean(body.packageLabel, 200); const quotedPrice = Math.max(0, Number(body.quotedPrice) || 0); const currency = clean(body.currency, 3).toUpperCase();
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !name || !/^\S+@\S+\.\S+$/.test(email) || !whatsapp) return NextResponse.json({ error: 'Complete the required contact fields.' }, { status: 400 });
  const admin = getSupabaseAdminClient(); if (!admin) return NextResponse.json({ error: 'Store is unavailable.' }, { status: 503 });
  const { data: product } = await admin.from('digital_products').select('id, package_options, currency').eq('id', productId).eq('status', 'published').maybeSingle();
  if (!product) return NextResponse.json({ error: 'This product is not available.' }, { status: 404 });
  const auth = await getSupabaseServerClient(); const { data: { user } } = auth ? await auth.auth.getUser() : { data: { user: null } };
  const option = Array.isArray(product.package_options) ? product.package_options.find((item) => typeof item === 'object' && item !== null && String((item as Record<string, unknown>).id) === packageId) as Record<string, unknown> | undefined : undefined;
  const safeLabel = option ? clean(option.label, 200) : packageLabel; const safePrice = option ? Math.max(0, Number(option.price) || 0) : quotedPrice;
  const requestNotes = [location ? `Project location: ${location}` : '', notes].filter(Boolean).join('\n\n');
  const { error } = await admin.from('product_requests').insert({ company_id: ELX_STUDIO_COMPANY_ID, product_id: productId, user_id: user?.id || null, name, email, whatsapp, notes: requestNotes || null, package_id: packageId || null, package_label: safeLabel || null, quoted_price: safePrice || null, currency: clean(product.currency, 3) || currency || null });
  if (error) return NextResponse.json({ error: 'The request could not be saved.' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
