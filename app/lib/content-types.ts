export type CarouselSlide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  link: string;
};

export type HomepageContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  stats: Array<{ value: string; label: string }>;
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  servicesEyebrow: string;
  servicesTitle: string;
  workflowEyebrow: string;
  workflowTitle: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  footerTagline: string;
  carousel: CarouselSlide[];
};

export type DigitalProduct = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  cover_url: string | null;
  gallery: Array<{ url: string; type?: 'image' | 'video'; alt?: string }>;
  preview_video_url: string | null;
  included_files: string[];
  specifications: Array<{ label: string; value: string }>;
  status: string;
  featured: boolean;
  sort_order: number;
  updated_at?: string;
};

export type MediaAsset = {
  id: string;
  kind: 'image' | 'video';
  file_name: string;
  title: string;
  alt_text: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  created_at: string;
};
