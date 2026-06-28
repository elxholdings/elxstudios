import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: '/', disallow: ['/operations-preview'] }, sitemap: 'https://elxstudios.vercel.app/sitemap.xml' }; }
