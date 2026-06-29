import LegalPage from '../legal-page';
import { getSiteTranslations } from '../google-translate';
import { resolveLocale } from '../locale';

export const dynamic = 'force-dynamic';

export default async function TermsPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const zh = locale === 'zh';
  const dictionary = await getSiteTranslations(locale);
  const t = (value: string) => dictionary[value] || value;

  return (
    <LegalPage
      locale={locale}
      backLabel={zh ? '返回 Elx Studio' : t('Back to Elx Studio')}
      title={zh ? '服务条款' : t('Terms of Service')}
      intro={zh
        ? 'Elx Studio 是 Elx Holdings 旗下的项目支持平台。提交项目需求即表示您同意提供准确的说明、保持尊重沟通，并负责任地使用所有交付成果。'
        : t('Elx Studio is a project support platform owned by Elx Holdings. By submitting a project request, you agree to provide accurate instructions, communicate respectfully, and use all deliverables responsibly.')}
      sections={zh ? [
        { heading: '服务内容', body: 'Elx Studio 可提供文档、写作、编辑、理工科、CAD、设计、3D 渲染、财务、会计及专业文档支持。最终范围、截止时间和价格将在审核客户需求后确认。' },
        { heading: '付款', body: '双方确认报价和付款说明后，项目才会开始。当前阶段可使用付款链接、发票或其他双方接受的付款方式。' },
        { heading: '修改', body: '在原项目范围内，可提供合理的修改。新增要求可能需要另行报价。' },
      ] : [
        { heading: t('Services'), body: t('Elx Studio may provide documentation, writing support, editing, STEM support, CAD support, design support, 3D rendering, finance, accounting and professional documentation services. Final scope, deadline and price are confirmed after review of the client brief.') },
        { heading: t('Payments'), body: t('Work begins after the agreed quote and payment instructions are confirmed. Manual payment links, invoices or other accepted payment methods may be used during the MVP stage.') },
        { heading: t('Revisions'), body: t('Reasonable revisions may be provided when they remain within the original project scope. New requirements may require an additional quote.') },
      ]}
    />
  );
}
