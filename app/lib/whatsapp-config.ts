export type WhatsAppRoute = {
  id: string;
  label: string;
  number: string;
  message: string;
  enabled: boolean;
  notes?: string;
};

export type WhatsAppRoutingSetting = {
  defaultCountryCode: string;
  contexts: WhatsAppRoute[];
};

export const defaultWhatsAppRouting: WhatsAppRoutingSetting = {
  defaultCountryCode: '254',
  contexts: [
    {
      id: 'start_floating',
      label: 'Start page floating button',
      number: '254110008034',
      enabled: true,
      message: 'Hello Elx Studio, I would like help choosing a service for my project.',
      notes: 'Used by the green WhatsApp button on the project intake page.',
    },
    {
      id: 'contact_page',
      label: 'Contact page',
      number: '254110008034',
      enabled: true,
      message: 'Hello Elx Studio, I have a question about a project.',
      notes: 'Used by the Contact page WhatsApp button.',
    },
    {
      id: 'intake_submitted',
      label: 'Submitted project brief handoff',
      number: '254110008034',
      enabled: true,
      message: 'Hello Elx Studio, I submitted a project brief.\n\nOrder ID: {{order_id}}\nName: {{name}}\nService: {{service}}\nDeadline: {{deadline}}\nBudget: {{budget}}\nFiles: {{files}}\n\nBrief: {{brief}}',
      notes: 'Used after a client submits the project intake form.',
    },
    {
      id: 'shop_inquiry',
      label: 'Shop plan questions',
      number: '254110008034',
      enabled: true,
      message: 'Hello Elx Studio, I have a question about an architectural plan in the shop.',
      notes: 'Reserved for storefront plan questions and future shop WhatsApp buttons.',
    },
  ],
};

export function normalizeWhatsAppRouting(value: unknown): WhatsAppRoutingSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultWhatsAppRouting;
  const source = value as Partial<WhatsAppRoutingSetting>;
  const defaultCountryCode = cleanDigits(source.defaultCountryCode || defaultWhatsAppRouting.defaultCountryCode) || '254';
  const contexts = Array.isArray(source.contexts) ? source.contexts : [];
  const normalized = contexts
    .map((route): WhatsAppRoute | null => {
      if (!route || typeof route !== 'object' || Array.isArray(route)) return null;
      const item = route as Partial<WhatsAppRoute>;
      const id = cleanId(item.id || '');
      if (!id) return null;
      return {
        id,
        label: String(item.label || id.replaceAll('_', ' ')).slice(0, 120),
        number: normalizeWhatsAppNumber(item.number || '', defaultCountryCode),
        message: String(item.message || '').slice(0, 2500),
        enabled: item.enabled !== false,
        notes: item.notes ? String(item.notes).slice(0, 300) : '',
      };
    })
    .filter((route): route is WhatsAppRoute => Boolean(route));

  const merged = defaultWhatsAppRouting.contexts.map((fallback) => {
    const override = normalized.find((route) => route.id === fallback.id);
    return override ? { ...fallback, ...override, number: override.number || fallback.number, message: override.message || fallback.message } : fallback;
  });
  const custom = normalized.filter((route) => !merged.some((item) => item.id === route.id));

  return { defaultCountryCode, contexts: [...merged, ...custom] };
}

export function getWhatsAppRoute(setting: WhatsAppRoutingSetting, contextId: string) {
  return setting.contexts.find((route) => route.id === contextId && route.enabled) || setting.contexts.find((route) => route.id === contextId) || defaultWhatsAppRouting.contexts.find((route) => route.id === contextId) || defaultWhatsAppRouting.contexts[0];
}

export function buildWhatsAppUrl(route: WhatsAppRoute, tokens: Record<string, string> = {}, defaultCountryCode = '254') {
  const number = normalizeWhatsAppNumber(route.number, defaultCountryCode);
  const message = applyTokens(route.message, tokens);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function normalizeWhatsAppNumber(value: string, defaultCountryCode = '254') {
  const digits = cleanDigits(value);
  if (!digits) return normalizeWhatsAppNumber(defaultWhatsAppRouting.contexts[0].number, defaultCountryCode);
  if (digits.startsWith('0')) return `${cleanDigits(defaultCountryCode) || '254'}${digits.slice(1)}`;
  return digits;
}

function applyTokens(template: string, tokens: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => tokens[key] || '');
}

function cleanDigits(value: string) {
  return String(value || '').replace(/\D/g, '');
}

function cleanId(value: string) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80);
}
