import type { MetadataRoute } from 'next';
import { serviceCategories } from './data/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://elxstudios.vercel.app';
  const routes = ['', '/about', '/services', '/how-it-works', '/pricing', '/contact', '/start', '/terms', '/privacy', '/academic-integrity', '/refund-policy', '/revision-policy'];
  return [...routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const, priority: route === '' ? 1 : .7 })), ...serviceCategories.map((service) => ({ url: `${base}/services/${service.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: .8 }))];
}
