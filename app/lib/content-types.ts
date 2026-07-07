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
  introMediaUrl: string;
  introMediaType: 'image' | 'video';
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
  sku: string;
  style: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  width_m: number | null;
  depth_m: number | null;
  area_sqm: number | null;
  plot_width_m: number | null;
  plot_depth_m: number | null;
  garage_spaces: number;
  rooms: string[];
  drawings: string[];
  tags: string[];
  regular_price: number | null;
  customizable: boolean;
  instant_delivery: boolean;
  best_seller: boolean;
  package_options: ProductPackage[];
  faqs: Array<{ question: string; answer: string }>;
  status: string;
  featured: boolean;
  sort_order: number;
  updated_at?: string;
};

export type ProductPackage = {
  id: string;
  label: string;
  price: number;
  fileTypes: string;
  description: string;
};

export type MediaAsset = {
  id: string;
  kind: 'image' | 'video' | 'audio';
  file_name: string;
  title: string;
  alt_text: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  created_at: string;
};
