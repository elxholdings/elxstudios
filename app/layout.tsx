import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elx Studio | Get It Right',
  description: 'Technical and professional project support for calculations, STEM, architecture, CAD, 3D rendering, writing, finance and business work.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
