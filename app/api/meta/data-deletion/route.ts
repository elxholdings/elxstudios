import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { ELX_STUDIO_COMPANY_ID } from '../../../lib/meta';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

function decodeSignedRequest(value: string) {
  const [signaturePart, payloadPart] = value.split('.');
  const secret = process.env.META_APP_SECRET;
  if (!signaturePart || !payloadPart || !secret) return null;
  const signature = Buffer.from(signaturePart.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const expected = createHmac('sha256', secret).update(payloadPart).digest();
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return null;
  return JSON.parse(Buffer.from(payloadPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')) as { user_id?: string };
}

export async function POST(request: Request) {
  const form = await request.formData();
  const signedRequest = form.get('signed_request');
  if (typeof signedRequest !== 'string') return NextResponse.json({ error: 'Missing signed request.' }, { status: 400 });
  const payload = decodeSignedRequest(signedRequest);
  if (!payload?.user_id) return NextResponse.json({ error: 'Invalid signed request.' }, { status: 401 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Database access is not configured.' }, { status: 503 });
  await admin.from('meta_integrations').update({ status: 'revoked', token_ciphertext: null, token_iv: null, token_tag: null }).eq('company_id', ELX_STUDIO_COMPANY_ID).contains('metadata', { meta_user_id: payload.user_id });
  const confirmationCode = crypto.randomUUID();
  return NextResponse.json({ url: `https://elxholdings.com/meta-data-deletion?code=${confirmationCode}`, confirmation_code: confirmationCode });
}
