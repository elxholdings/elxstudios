import 'server-only';

import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { getSupabaseAdminClient } from './supabase/admin';

export const ELX_STUDIO_COMPANY_ID = '00000000-0000-4000-8000-000000000002';
export const META_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v25.0';

type MetaProduct = 'facebook_user' | 'facebook_page' | 'instagram' | 'marketing' | 'whatsapp';

type StoredIntegration = {
  id: string;
  company_id: string;
  product: MetaProduct;
  external_account_id: string;
  external_business_id: string | null;
  display_name: string | null;
  status: string;
  scopes: string[];
  token_ciphertext: string | null;
  token_iv: string | null;
  token_tag: string | null;
  token_expires_at: string | null;
  metadata: Record<string, unknown>;
};

function encryptionKey() {
  const raw = process.env.META_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error('META_TOKEN_ENCRYPTION_KEY is not configured.');
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('META_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.');
  return key;
}

export function encryptMetaToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return {
    token_ciphertext: encrypted.toString('base64'),
    token_iv: iv.toString('base64'),
    token_tag: cipher.getAuthTag().toString('base64'),
  };
}

export function decryptMetaToken(integration: Pick<StoredIntegration, 'token_ciphertext' | 'token_iv' | 'token_tag'>) {
  if (!integration.token_ciphertext || !integration.token_iv || !integration.token_tag) throw new Error('This Meta integration has no stored token.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(integration.token_iv, 'base64'));
  decipher.setAuthTag(Buffer.from(integration.token_tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(integration.token_ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

export function metaAppSecretProof(token: string) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) throw new Error('META_APP_SECRET is not configured.');
  return createHmac('sha256', secret).update(token).digest('hex');
}

export async function metaGraph<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const cleanPath = path.replace(/^\//, '');
  const url = new URL(`https://graph.facebook.com/${META_API_VERSION}/${cleanPath}`);
  url.searchParams.set('appsecret_proof', metaAppSecretProof(token));
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { ...init, headers, cache: 'no-store' });
  const payload = await response.json().catch(() => ({})) as T & { error?: { message?: string; code?: number } };
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Meta API request failed (${response.status}).`);
  return payload;
}

export function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signatureHeader?.startsWith('sha256=')) return false;
  const provided = signatureHeader.slice(7);
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
}

export async function upsertMetaIntegration(input: {
  product: MetaProduct;
  externalAccountId: string;
  externalBusinessId?: string | null;
  displayName?: string | null;
  scopes?: string[];
  token?: string;
  tokenExpiresAt?: string | null;
  metadata?: Record<string, unknown>;
  createdBy?: string;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error('Supabase service access is not configured.');
  const tokenFields = input.token ? encryptMetaToken(input.token) : {};
  const { data, error } = await admin.from('meta_integrations').upsert({
    company_id: ELX_STUDIO_COMPANY_ID,
    product: input.product,
    external_account_id: input.externalAccountId,
    external_business_id: input.externalBusinessId || null,
    display_name: input.displayName || null,
    status: 'connected',
    scopes: input.scopes || [],
    token_expires_at: input.tokenExpiresAt || null,
    metadata: input.metadata || {},
    created_by: input.createdBy || null,
    ...tokenFields,
  }, { onConflict: 'company_id,product,external_account_id' }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function getMetaIntegration(product: MetaProduct, externalAccountId?: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error('Supabase service access is not configured.');
  let query = admin.from('meta_integrations').select('*').eq('company_id', ELX_STUDIO_COMPANY_ID).eq('product', product).eq('status', 'connected');
  if (externalAccountId) query = query.eq('external_account_id', externalAccountId);
  const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as StoredIntegration | null;
}

export async function logMetaAction(input: { integrationId?: string | null; requestedBy?: string | null; action: string; targetId?: string | null; summary?: Record<string, unknown>; resultId?: string | null; error?: string | null }) {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  await admin.from('meta_action_log').insert({
    company_id: ELX_STUDIO_COMPANY_ID,
    integration_id: input.integrationId || null,
    requested_by: input.requestedBy || null,
    action: input.action,
    target_id: input.targetId || null,
    request_summary: input.summary || {},
    external_result_id: input.resultId || null,
    status: input.error ? 'failed' : 'succeeded',
    error_message: input.error || null,
  });
}

export function safeMetaConfig() {
  return {
    appId: Boolean(process.env.META_APP_ID),
    appSecret: Boolean(process.env.META_APP_SECRET),
    encryptionKey: Boolean(process.env.META_TOKEN_ENCRYPTION_KEY),
    webhookToken: Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN),
    whatsappToken: Boolean(process.env.META_WHATSAPP_ACCESS_TOKEN),
    whatsappPhoneId: Boolean(process.env.META_WHATSAPP_PHONE_NUMBER_ID),
    apiVersion: META_API_VERSION,
  };
}
