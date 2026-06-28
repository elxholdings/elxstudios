import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { isRtlLocale } from './locale-config';

export const metadata: Metadata = {
  title: 'Elx Studio | Get It Right',
  description: 'Technical and professional project support for calculations, STEM, architecture, CAD, 3D rendering, writing, finance and business work.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get('x-elx-locale') || 'en';

  return (
    <html lang={locale === 'zh' ? 'zh-CN' : locale} dir={isRtlLocale(locale) ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
