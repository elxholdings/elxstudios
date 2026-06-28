import type { ResolvedLocale } from './locale';
import LanguageSwitcher from './language-switcher';
import { isRtlLocale } from './locale-config';

type Section = {
  heading: string;
  body: string;
};

export default function LegalPage({
  locale,
  backLabel,
  title,
  intro,
  sections,
}: {
  locale: ResolvedLocale;
  backLabel: string;
  title: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <main lang={locale === 'zh' ? 'zh-CN' : locale} dir={isRtlLocale(locale) ? 'rtl' : 'ltr'} className="mx-auto max-w-4xl px-6 py-16 leading-7 text-[#102321]">
      <nav className="mb-16 flex items-center justify-between text-sm font-bold">
        <a href={`/?lang=${locale}`}>← {backLabel}</a>
        <LanguageSwitcher locale={locale} />
      </nav>
      <h1 className="text-5xl font-black leading-none tracking-[-0.05em] md:text-7xl">{title}</h1>
      <p className="mt-8 text-lg leading-8 text-black/65">{intro}</p>
      <div className="mt-14 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-black tracking-[-0.03em]">{section.heading}</h2>
            <p className="mt-3 text-black/65">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
