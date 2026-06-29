import LegalPage from '../legal-page';
import { getSiteTranslations } from '../google-translate';
import { resolveLocale } from '../locale';

export const dynamic = 'force-dynamic';

export default async function AcademicIntegrityPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const zh = locale === 'zh';
  const dictionary = await getSiteTranslations(locale);
  const t = (value: string) => dictionary[value] || value;

  return (
    <LegalPage
      locale={locale}
      backLabel={zh ? '返回 Elx Studio' : t('Back to Elx Studio')}
      title={zh ? '学术诚信政策' : t('Academic Integrity Policy')}
      intro={zh
        ? 'Elx Studio 提供学习、文档、编辑、排版、研究指导、建模、辅导式讲解和专业支持。客户有责任遵守其学校、雇主或组织的相关规定。'
        : t('Elx Studio supports learning, documentation, editing, formatting, research guidance, modelling, tutoring-style explanations and professional support. Clients are responsible for following their institution, employer or organization rules.')}
      sections={zh ? [
        { heading: '负责任地使用', body: '学术材料应作为学习支持、草稿、示例、学习指导或编辑辅助使用。Elx Studio 不支持冒名顶替、考试作弊、欺诈或滥用交付成果。' },
        { heading: '客户责任', body: '提交需求即表示客户确认将负责任地使用所有材料，并自行决定其提交、发布或专业用途。' },
      ] : [
        { heading: t('Responsible use'), body: t('Academic materials should be used as learning support, drafts, examples, study guidance or editing assistance. Elx Studio does not support impersonation, exam cheating, fraud, or misuse of deliverables.') },
        { heading: t('Client responsibility'), body: t('By submitting a request, the client confirms that they will use any materials responsibly and make final decisions about submission, publication or professional use.') },
      ]}
    />
  );
}
