import LegalPage from '../legal-page';
import { getSiteTranslations } from '../google-translate';
import { resolveLocale } from '../locale';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage({ searchParams }: { searchParams?: { lang?: string | string[] } }) {
  const locale = await resolveLocale(searchParams?.lang);
  const zh = locale === 'zh';
  const dictionary = await getSiteTranslations(locale);
  const t = (value: string) => dictionary[value] || value;

  return (
    <LegalPage
      locale={locale}
      backLabel={zh ? '返回 Elx Studio' : t('Back to Elx Studio')}
      title={zh ? '隐私政策' : t('Privacy Policy')}
      intro={zh
        ? 'Elx Studio 会收集您通过项目表单提交的信息，包括姓名、联系方式、服务类别、项目说明、截止时间和文件链接。这些信息用于审核需求、准备报价、与客户沟通及提供服务。'
        : t('Elx Studio collects information submitted through project forms, including name, contact details, service category, project instructions, deadlines and file links. This information is used to review requests, prepare quotes, communicate with clients and deliver services.')}
      sections={zh ? [
        { heading: '数据处理', body: '客户信息仅应由经授权的 Elx Holdings 工作人员或获批准的项目协作者访问。客户文件和说明不会被公开分享。' },
        { heading: '联系方式', body: '如对隐私有任何疑问，请通过网站列出的官方业务沟通渠道联系 Elx Holdings。' },
      ] : [
        { heading: t('Data handling'), body: t('Client information should only be accessed by authorized Elx Holdings staff or approved project contributors. Client files and instructions should not be shared publicly.') },
        { heading: t('Contact'), body: t('For privacy questions, contact Elx Holdings through the official business communication channel listed on the website.') },
      ]}
    />
  );
}
