import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elx Studio | Documentation, Design, STEM, CAD and Finance Support',
  description: 'Elx Studio by Elx Holdings helps students and professionals start projects in writing, documentation, STEM, architecture, CAD, 3D rendering, finance and accounting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
