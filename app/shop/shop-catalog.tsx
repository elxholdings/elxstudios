'use client';

import { useMemo, useState } from 'react';
import type { DigitalProduct } from '../lib/content-types';

const money = (value: number, currency: string) => new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export default function ShopCatalog({ products }: { products: DigitalProduct[] }) {
  const [search, setSearch] = useState(''); const [bedrooms, setBedrooms] = useState('all'); const [floors, setFloors] = useState('all'); const [category, setCategory] = useState('all'); const [sort, setSort] = useState('featured');
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const searchable = [product.title, product.summary, product.category, product.style, ...(product.tags || [])].join(' ').toLowerCase();
      return (!term || searchable.includes(term)) && (bedrooms === 'all' || product.bedrooms === Number(bedrooms) || (bedrooms === '5' && product.bedrooms >= 5)) && (floors === 'all' || product.floors === Number(floors)) && (category === 'all' || product.category === category);
    }).sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'area' ? (b.area_sqm || 0) - (a.area_sqm || 0) : Number(b.best_seller) - Number(a.best_seller) || a.sort_order - b.sort_order);
  }, [products, search, bedrooms, floors, category, sort]);
  const reset = () => { setSearch(''); setBedrooms('all'); setFloors('all'); setCategory('all'); setSort('featured'); };

  return <div>
    <div className="grid border-y border-black/15 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
      <label className="border-black/15 p-4 lg:border-r"><span className="filter-label">Search plans</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Style, name or feature" className="filter-field" /></label>
      <Filter label="Bedrooms" value={bedrooms} onChange={setBedrooms} options={[['all','Any'],['2','2'],['3','3'],['4','4'],['5','5+']]} />
      <Filter label="Floors" value={floors} onChange={setFloors} options={[['all','Any'],['1','Single storey'],['2','Two storey']]} />
      <Filter label="Home type" value={category} onChange={setCategory} options={[['all','All types'], ...categories.map((item) => [item,item])]} />
      <Filter label="Sort" value={sort} onChange={setSort} options={[['featured','Featured'],['price-low','Price: low first'],['price-high','Price: high first'],['area','Largest area']]} />
    </div>
    <div className="flex items-center justify-between py-7"><p className="text-xs font-black uppercase tracking-[.16em]">{visible.length} plans</p><button onClick={reset} className="text-xs font-black underline">Clear filters</button></div>
    <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">{visible.map((product) => <article key={product.id} className="group">
      <a href={`/shop/${product.slug}`} className="relative block aspect-[3/2] overflow-hidden bg-[#102321]">{product.cover_url && <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />}<div className="absolute left-0 top-0 flex gap-px text-[10px] font-black uppercase tracking-[.12em]">{product.best_seller && <span className="bg-[#DDF65C] px-3 py-2 text-[#102321]">Best seller</span>}{product.instant_delivery && <span className="bg-[#102321] px-3 py-2 text-white">Digital</span>}</div></a>
      <div className="border-b border-black/15 py-5"><div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#F06449]">{product.sku} · {product.style}</p><a href={`/shop/${product.slug}`}><h2 className="mt-2 text-2xl font-black leading-none tracking-[-.04em]">{product.title}</h2></a></div><strong className="shrink-0 text-lg">{money(product.price, product.currency)}</strong></div>
      <div className="mt-5 grid grid-cols-4 border-y border-black/10 py-3 text-center"><Metric value={product.bedrooms} label="Beds" icon="⌂" /><Metric value={product.bathrooms} label="Baths" icon="◫" /><Metric value={product.floors} label="Floors" icon="▤" /><Metric value={product.area_sqm ? `${product.area_sqm}m²` : '—'} label="Area" icon="↔" /></div><div className="mt-5 flex items-center justify-between"><span className="text-xs text-black/50">{product.width_m}m × {product.depth_m}m footprint</span><a href={`/shop/${product.slug}`} className="text-xs font-black underline decoration-[#DDF65C] decoration-4 underline-offset-4">View plan →</a></div></div>
    </article>)}</div>
    {!visible.length && <div className="border-y border-black/15 py-20 text-center"><h2 className="text-4xl font-black">No plan matches those filters.</h2><button onClick={reset} className="mt-5 bg-[#102321] px-6 py-3 text-sm font-black text-white">Show every plan</button></div>}
  </div>;
}
function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) { return <label className="border-black/15 p-4 lg:border-r"><span className="filter-label">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="filter-field">{options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>; }
function Metric({ value, label, icon }: { value: string | number; label: string; icon: string }) { return <div className="border-r border-black/10 last:border-0"><span className="block text-sm font-black">{icon} {value}</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.12em] text-black/40">{label}</span></div>; }
