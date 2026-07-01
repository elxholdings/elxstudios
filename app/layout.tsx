import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { isRtlLocale } from './locale-config';
import ScrollPill from './components/scroll-pill';

export const metadata: Metadata = {
  metadataBase: new URL('https://elxholdings.com'),
  title: {
    default: 'Elx Studio | Get It Right',
    template: '%s | Elx Studio',
  },
  description: 'Technical and professional project support for calculations, STEM, architecture, CAD, 3D rendering, writing, finance and business work.',
  applicationName: 'Elx Studio',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  keywords: ['technical project support', 'CAD drafting', '3D rendering', 'STEM support', 'professional documentation', 'financial modeling'],
  authors: [{ name: 'Elx Holdings' }],
  creator: 'Elx Holdings',
  publisher: 'Elx Holdings',
  openGraph: {
    type: 'website',
    siteName: 'Elx Studio',
    title: 'Elx Studio | Get It Right',
    description: 'Technical and professional project support from brief to accountable delivery.',
    url: '/',
    images: [{ url: '/images/technical-render.jpg', alt: 'Elx Studio technical rendering work' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elx Studio | Get It Right',
    description: 'Technical and professional project support from brief to accountable delivery.',
    images: ['/images/technical-render.jpg'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get('x-elx-locale') || 'en';

  return (
    <html lang={locale === 'zh' ? 'zh-CN' : locale} dir={isRtlLocale(locale) ? 'rtl' : 'ltr'}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'Elx Studio',
              parentOrganization: { '@type': 'Organization', name: 'Elx Holdings' },
              url: 'https://elxholdings.com',
              description: 'Technical and professional project support for documentation, STEM, architecture, CAD, 3D, finance and business work.',
              areaServed: 'Worldwide',
            }),
          }}
        />
        {children}
        <ScrollPill />
      </body>
    </html>
  );
}
