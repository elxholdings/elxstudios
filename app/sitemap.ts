import type { MetadataRoute } from 'next';
import { serviceCategories } from './data/services';
import { getPublishedProducts } from './lib/site-content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://elxholdings.com';
  const routes = ['', '/about', '/shop', '/pricing', '/contact', '/start', '/terms', '/privacy', '/academic-integrity', '/refund-policy', '/revision-policy'];
  const products = await getPublishedProducts();
  return [...routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const, priority: route === '' ? 1 : .7 })), ...serviceCategories.map((service) => ({ url: `${base}/services/${service.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: .8 })), ...products.map((product) => ({ url: `${base}/shop/${product.slug}`, lastModified: product.updated_at ? new Date(product.updated_at) : new Date(), changeFrequency: 'monthly' as const, priority: .8 }))];
}
