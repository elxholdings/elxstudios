'use client';

import { useMemo, useState } from 'react';
import type { DigitalProduct } from '../lib/content-types';

const PRODUCTS_PER_SLIDE = 8;

const money = (value: number, currency: string) => new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export default function ShopCatalog({ products }: { products: DigitalProduct[] }) {
  const [search, setSearch] = useState('');
  const [bedrooms, setBedrooms] = useState('all');
  const [floors, setFloors] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const categories = Array.from(new Set(products.map((product) => product.category)));

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const searchable = [product.title, product.summary, product.category, product.style, ...(product.tags || [])].join(' ').toLowerCase();
      return (!term || searchable.includes(term)) && (bedrooms === 'all' || product.bedrooms === Number(bedrooms) || (bedrooms === '5' && product.bedrooms >= 5)) && (floors === 'all' || product.floors === Number(floors)) && (category === 'all' || product.category === category);
    }).sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'area' ? (b.area_sqm || 0) - (a.area_sqm || 0) : Number(b.best_seller) - Number(a.best_seller) || a.sort_order - b.sort_order);
  }, [products, search, bedrooms, floors, category, sort]);

  const pages = useMemo(() => {
    const chunks: DigitalProduct[][] = [];
    for (let index = 0; index < visible.length; index += PRODUCTS_PER_SLIDE) chunks.push(visible.slice(index, index + PRODUCTS_PER_SLIDE));
    return chunks;
  }, [visible]);

  const reset = () => {
    setSearch('');
    setBedrooms('all');
    setFloors('all');
    setCategory('all');
    setSort('featured');
  };

  const filterProps = { search, setSearch, bedrooms, setBedrooms, floors, setFloors, category, setCategory, sort, setSort, categories, reset };

  if (!visible.length) {
    return (
      <section id="plans" className="shop-slide flex min-h-[100svh] flex-col bg-[#F8F7F2]">
        <FilterBar {...filterProps} count={0} />
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-5 py-10 text-center md:px-10">
          <div className="max-w-2xl border-y border-black/15 py-12">
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">No matches</p>
            <h2 className="mt-4 text-5xl font-black leading-none tracking-[-.06em]">No plan matches those filters.</h2>
            <button onClick={reset} className="mt-7 bg-[#102321] px-6 py-3 text-sm font-black text-white">Show every plan</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {pages.map((page, pageIndex) => (
        <section key={pageIndex} id={pageIndex === 0 ? 'plans' : `plans-${pageIndex + 1}`} className="shop-slide flex min-h-[100svh] flex-col bg-[#F8F7F2]">
          <FilterBar {...filterProps} count={visible.length} />
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-[.14em] text-black/45 md:px-10">
            <span>Product slide {String(pageIndex + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}</span>
            <span>{page.length} shown here</span>
          </div>
          <div className="mx-auto grid w-full max-w-[1440px] content-start gap-3 px-5 pb-8 md:grid-cols-2 md:px-10 lg:grid-cols-4 xl:grid-cols-5">
            {page.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      ))}
    </>
  );
}

type FilterBarProps = {
  search: string;
  setSearch: (value: string) => void;
  bedrooms: string;
  setBedrooms: (value: string) => void;
  floors: string;
  setFloors: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  categories: string[];
  reset: () => void;
  count: number;
};

function FilterBar({ search, setSearch, bedrooms, setBedrooms, floors, setFloors, category, setCategory, sort, setSort, categories, reset, count }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-[#F8F7F2]/95 px-5 backdrop-blur md:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-2 py-3 text-[#102321] md:grid-cols-[auto_1.25fr_repeat(4,minmax(118px,.7fr))_auto] md:items-end">
        <a href="/" className="flex h-10 items-center bg-[#102321] px-4 text-xs font-black uppercase tracking-[.12em] text-white">Home</a>
        <label className="border border-black/10 bg-white px-3 py-2"><span className="shop-filter-label">Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Style, bedrooms, feature" className="shop-filter-field" /></label>
        <Filter label="Beds" value={bedrooms} onChange={setBedrooms} options={[['all', 'Any'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5+']]} />
        <Filter label="Floors" value={floors} onChange={setFloors} options={[['all', 'Any'], ['1', 'Single'], ['2', 'Two']]} />
        <Filter label="Type" value={category} onChange={setCategory} options={[['all', 'All'], ...categories.map((item) => [item, item])]} />
        <Filter label="Sort" value={sort} onChange={setSort} options={[['featured', 'Featured'], ['price-low', 'Low first'], ['price-high', 'High first'], ['area', 'Largest']]} />
        <button onClick={reset} className="h-10 border border-black/15 px-4 text-xs font-black uppercase tracking-[.12em] text-black/60 transition hover:bg-[#DDF65C] hover:text-[#102321]">{count} plans</button>
      </div>
    </div>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="border border-black/10 bg-white px-3 py-2"><span className="shop-filter-label">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="shop-filter-field">{options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>;
}

function ProductCard({ product }: { product: DigitalProduct }) {
  const footprint = product.width_m && product.depth_m ? `${product.width_m}m x ${product.depth_m}m` : product.category;
  return (
    <article className="group border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#102321]">
      <a href={`/shop/${product.slug}`} className="relative block aspect-[16/8] overflow-hidden bg-[#102321]">
        {product.cover_url ? <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" /> : <div className="h-full w-full bg-[#102321]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#102321]/45 to-transparent opacity-70" />
        <div className="absolute left-2 top-2 flex gap-1 text-[9px] font-black uppercase tracking-[.1em]">
          {product.best_seller && <span className="bg-[#DDF65C] px-2 py-1 text-[#102321]">Best</span>}
          {product.instant_delivery && <span className="bg-[#102321] px-2 py-1 text-white">Digital</span>}
        </div>
      </a>
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[9px] font-black uppercase tracking-[.12em] text-[#F06449]">{product.sku} / {product.style}</p>
            <a href={`/shop/${product.slug}`}><h2 className="mt-1 line-clamp-2 text-xl font-black leading-[.95] tracking-[-.04em]">{product.title}</h2></a>
          </div>
          <strong className="shrink-0 text-sm">{money(product.price, product.currency)}</strong>
        </div>
        <div className="mt-3 grid grid-cols-4 border-y border-black/10 py-2 text-center">
          <Metric value={product.bedrooms} label="Beds" />
          <Metric value={product.bathrooms} label="Baths" />
          <Metric value={product.floors} label="Floors" />
          <Metric value={product.area_sqm ? product.area_sqm : '-'} label="sqm" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
          <span className="truncate text-black/45">{footprint}</span>
          <a href={`/shop/${product.slug}`} className="shrink-0 font-black underline decoration-[#DDF65C] decoration-4 underline-offset-4">Open</a>
        </div>
      </div>
    </article>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return <div className="border-r border-black/10 last:border-0"><span className="block text-sm font-black">{value}</span><span className="mt-1 block text-[8px] font-bold uppercase tracking-[.12em] text-black/40">{label}</span></div>;
}
