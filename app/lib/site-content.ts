import 'server-only';

import { ELX_STUDIO_COMPANY_ID } from './meta';
import { getSupabaseAdminClient } from './supabase/admin';
import type { DigitalProduct, HomepageContent, MediaAsset } from './content-types';

export const defaultHomepageContent: HomepageContent = {
  heroEyebrow: 'Technical & professional project support',
  heroTitle: 'Get it',
  heroAccent: 'right.',
  heroDescription: 'Bring us the difficult brief—the calculations, drawings, models, reports and details. We turn it into clear, polished work you can use with confidence.',
  heroPrimaryLabel: 'Send your brief',
  heroSecondaryLabel: 'Explore our expertise',
  stats: [
    { value: '7', label: 'service areas' },
    { value: '01', label: 'reference for every brief' },
    { value: 'Direct', label: 'WhatsApp communication' },
    { value: 'Flexible', label: 'delivery formats' },
  ],
  introEyebrow: 'Built around your brief',
  introTitle: "Your project can be complex. The process shouldn't be.",
  introBody: 'No endless searching for different specialists. Start with one clear brief and move forward with the right support around the work.',
  introMediaUrl: '/images/architecture-drafting.jpg',
  introMediaType: 'image',
  servicesEyebrow: 'Everything you need',
  servicesTitle: 'From first calculation to final presentation.',
  workflowEyebrow: 'How it works',
  workflowTitle: 'A clear path from brief to done.',
  ctaEyebrow: 'Ready when you are',
  ctaTitle: "Let's get to work.",
  ctaBody: "Share the context, deadline and format you have in mind. We'll review the details and continue with you on WhatsApp.",
  footerTagline: 'Professional and technical project support.',
  carousel: [
    { id: 'cad', eyebrow: 'CAD + architecture', title: 'Precision plans for real projects.', text: 'Floor plans, technical drawings and carefully structured CAD deliverables.', mediaUrl: '/images/blueprint-tools.jpg', mediaType: 'image', link: '/services/architecture-design' },
    { id: 'render', eyebrow: '3D visualization', title: 'See the design before it is built.', text: 'Architectural renderings, product models and presentation-ready visual outcomes.', mediaUrl: '/images/technical-render.jpg', mediaType: 'image', link: '/services/3d-modeling-rendering' },
    { id: 'analysis', eyebrow: 'Data + finance', title: 'Turn dense numbers into decisions.', text: 'Dashboards, models, forecasts and reports built for clarity.', mediaUrl: '/images/analytics-dashboard.jpg', mediaType: 'image', link: '/services/finance-accounting' },
  ],
};

export async function getHomepageContent() {
  const admin = getSupabaseAdminClient();
  if (!admin) return defaultHomepageContent;
  const { data } = await admin.from('site_content').select('content').eq('company_id', ELX_STUDIO_COMPANY_ID).eq('key', 'homepage').eq('is_published', true).maybeSingle();
  return { ...defaultHomepageContent, ...((data?.content || {}) as Partial<HomepageContent>) };
}

export async function getPublishedProducts(limit?: number) {
  const admin = getSupabaseAdminClient();
  if (!admin) return [] as DigitalProduct[];
  let query = admin.from('digital_products').select('*').eq('company_id', ELX_STUDIO_COMPANY_ID).eq('status', 'published').order('featured', { ascending: false }).order('sort_order').order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data || []) as DigitalProduct[];
}

export async function getMediaAssets() {
  const admin = getSupabaseAdminClient();
  if (!admin) return [] as MediaAsset[];
  const { data } = await admin.from('media_assets').select('*').eq('company_id', ELX_STUDIO_COMPANY_ID).order('created_at', { ascending: false });
  return (data || []) as MediaAsset[];
}
