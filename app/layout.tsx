import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elx Studio | Bring Us the Brief',
  description: 'Get clear, professional support for writing, documentation, STEM, architecture, CAD, 3D rendering, finance, accounting and business projects.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
