import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: '/', disallow: ['/operations-preview', '/admin', '/dashboard'] }, sitemap: 'https://elxholdings.com/sitemap.xml' }; }
