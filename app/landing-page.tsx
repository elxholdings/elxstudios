'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import type { TranslationDictionary } from './google-translate';
import LanguageSwitcher from './language-switcher';
import { isRtlLocale } from './locale-config';

export type Locale = string;

const services = [
  'Writing and Documentation',
  'STEM Support',
  'Architecture and Design',
  'CAD Drafting',
  '3D Modeling and Rendering',
  'Finance and Accounting',
  'Business and Professional Services',
];

const capabilities = [
  {
    number: '01',
    title: 'Work through complex calculations',
    text: 'Get structured support for mathematics, science, engineering, data and technical problem-solving.',
    image: '/images/math-formulas.jpg',
    alt: 'Mathematical equations viewed through a magnifying glass',
    color: 'bg-[#DDF65C]',
  },
  {
    number: '02',
    title: 'Develop precise drawings and plans',
    text: 'Move from an early idea to clear floor plans, CAD drawings, models and technical documentation.',
    image: '/images/blueprint-tools.jpg',
    alt: 'Architectural plans with rulers and a protractor',
    color: 'bg-[#AFC8FF]',
  },
  {
    number: '03',
    title: 'Turn numbers into useful decisions',
    text: 'Build budgets, forecasts, reports and Excel models that make the story behind the figures easier to see.',
    image: '/images/analytics-dashboard.jpg',
    alt: 'A laptop displaying analytical charts and financial data',
    color: 'bg-[#FF9A76]',
  },
  {
    number: '04',
    title: 'Create polished visual outcomes',
    text: 'Present concepts with refined 3D models, renderings, diagrams, boards and presentation-ready visuals.',
    image: '/images/technical-render.jpg',
    alt: 'A geometric three-dimensional digital render',
    color: 'bg-[#C9B8FF]',
  },
];

const workflow = [
  ['Share the brief', 'Tell us the goal, required format, deadline and any instructions you already have.'],
  ['Confirm the plan', 'We clarify open questions and agree on the deliverables, timing and price.'],
  ['Follow the progress', 'Continue on WhatsApp for direct communication while the work takes shape.'],
  ['Receive the files', 'Review the completed work and receive your final files in the agreed format.'],
];

const chinese: Record<string, string> = {
  'Writing and Documentation': '写作与文档',
  'STEM Support': '理工科支持',
  'Architecture and Design': '建筑与设计',
  'CAD Drafting': 'CAD 制图',
  '3D Modeling and Rendering': '3D 建模与渲染',
  'Finance and Accounting': '财务与会计',
  'Business and Professional Services': '商业与专业服务',
  'Work through complex calculations': '攻克复杂计算',
  'Get structured support for mathematics, science, engineering, data and technical problem-solving.': '获得数学、科学、工程、数据分析和技术问题解决方面的系统支持。',
  'Mathematical equations viewed through a magnifying glass': '放大镜下的数学公式',
  'Develop precise drawings and plans': '制定精准的图纸与方案',
  'Move from an early idea to clear floor plans, CAD drawings, models and technical documentation.': '将初步构想转化为清晰的平面图、CAD 图纸、模型和技术文档。',
  'Architectural plans with rulers and a protractor': '配有直尺和量角器的建筑图纸',
  'Turn numbers into useful decisions': '让数据转化为有效决策',
  'Build budgets, forecasts, reports and Excel models that make the story behind the figures easier to see.': '制作预算、预测、报告和 Excel 模型，让数字背后的信息一目了然。',
  'A laptop displaying analytical charts and financial data': '显示分析图表和财务数据的笔记本电脑',
  'Create polished visual outcomes': '打造精致的视觉成果',
  'Present concepts with refined 3D models, renderings, diagrams, boards and presentation-ready visuals.': '通过精细的 3D 模型、渲染图、图表、展板和演示级视觉效果呈现概念。',
  'A geometric three-dimensional digital render': '几何三维数字渲染图',
  'Share the brief': '提交项目需求',
  'Tell us the goal, required format, deadline and any instructions you already have.': '告诉我们项目目标、所需格式、截止时间以及您已有的要求。',
  'Confirm the plan': '确认项目方案',
  'We clarify open questions and agree on the deliverables, timing and price.': '我们会澄清待确认事项，并与您确定交付内容、时间和价格。',
  'Follow the progress': '跟进项目进度',
  'Continue on WhatsApp for direct communication while the work takes shape.': '项目进行期间可通过 WhatsApp 直接沟通并了解进展。',
  'Receive the files': '接收最终文件',
  'Review the completed work and receive your final files in the agreed format.': '审核完成的工作，并按约定格式接收最终文件。',
  'Expertise': '专业领域',
  'How it works': '服务流程',
  'Send a brief': '提交需求',
  'Start a project': '开始项目',
  'Technical & professional project support': '技术与专业项目支持',
  'Get it': '做到',
  'right.': '精准。',
  "Bring us the difficult brief—the calculations, drawings, models, reports and details. We'll help turn it into clear, polished work you can use with confidence.": '把复杂的需求交给我们——无论是计算、图纸、模型、报告还是细节。我们会帮助您将其转化为清晰、专业且可放心使用的成果。',
  'Send your brief': '提交您的需求',
  'Explore our expertise': '查看专业领域',
  'CAD + 3D': 'CAD + 3D',
  'STEM + analysis': 'STEM + 分析',
  'Reports + finance': '报告 + 财务',
  'service areas': '项服务领域',
  'reference for every brief': '每份需求独立编号',
  'Direct': '直接',
  'WhatsApp communication': 'WhatsApp 沟通',
  'Flexible': '灵活',
  'delivery formats': '交付格式',
  'Built around your brief': '围绕您的需求',
  "Your project can be complex. The process shouldn't be.": '项目可以复杂，流程不必如此。',
  'No endless searching for different specialists. No wondering what happens next. Start with one clear brief and move forward with the right support around the work.': '无需反复寻找不同专家，也无需猜测下一步。只需提交一份清晰的需求，即可获得与项目匹配的专业支持。',
  'Everything you need': '项目所需，一站完成',
  'From first calculation to final presentation.': '从首次计算到最终呈现。',
  'Also available': '其他服务',
  'Reports & proposals': '报告与提案',
  'Editing & formatting': '编辑与排版',
  'Research support': '研究支持',
  'Pitch decks': '路演演示文稿',
  'Company profiles': '公司简介',
  'Resumes & presentations': '简历与演示文稿',
  'A clear path from brief to done.': '从需求到交付，流程清晰。',
  'Start your project →': '开始您的项目 →',
  'Ready when you are': '随时为您服务',
  "Let's get to work.": '开始合作。',
  "Share the context, deadline and format you have in mind. We'll review the details and continue with you on WhatsApp.": '告诉我们项目背景、截止时间和所需格式。我们会审核详情，并通过 WhatsApp 与您继续沟通。',
  'Have supporting files?': '有相关文件吗？',
  'Paste a Drive, Dropbox, WeTransfer or OneDrive link—or send the files when we continue on WhatsApp.': '请粘贴 Drive、Dropbox、WeTransfer 或 OneDrive 链接，也可以在 WhatsApp 沟通时发送文件。',
  'A calculator placed over printed charts and analytical reports': '放置在打印图表和分析报告上的计算器',
  'Full name': '姓名',
  'Your name': '请输入姓名',
  'WhatsApp number': 'WhatsApp 号码',
  'Email': '电子邮箱',
  '(optional)': '（选填）',
  'What do you need?': '您需要什么服务？',
  'Select a service': '请选择服务',
  'When do you need it?': '您何时需要？',
  'Today, Friday, 24 hours...': '今天、周五、24 小时内……',
  'Budget range': '预算范围',
  '$50–$200, flexible...': '例如：$50–$200，可协商……',
  'Supporting files': '相关文件',
  'Paste a Drive, Dropbox, WeTransfer or OneDrive link': '粘贴 Drive、Dropbox、WeTransfer 或 OneDrive 链接',
  'Tell us about the project': '请介绍您的项目',
  'Describe the goal, requirements, format, software, references and finished files you expect...': '请说明项目目标、要求、格式、软件、参考资料以及期望的最终文件……',
  'Sending your brief...': '正在提交需求……',
  'Send my brief and continue on WhatsApp →': '提交需求并前往 WhatsApp →',
  'We could not send your brief just now. Please try again or contact us directly on WhatsApp.': '暂时无法提交您的需求。请重试，或直接通过 WhatsApp 联系我们。',
  'We have your brief. Reference:': '我们已收到您的需求。编号：',
  "Continue on WhatsApp and we'll take it from here.": '请前往 WhatsApp，接下来交给我们。',
  'Continue on WhatsApp ↗': '前往 WhatsApp ↗',
  'Professional and technical project support.': '专业与技术项目支持。',
  'Terms': '服务条款',
  'Privacy': '隐私政策',
  'Academic integrity': '学术诚信',
};

function translate(locale: Locale, value: string, dictionary: TranslationDictionary) {
  if (locale === 'zh') return chinese[value] || value;
  return dictionary[value] || value;
}

type IntakeResponse = {
  orderId: string;
  whatsappUrl: string;
  message: string;
};

export default function LandingPage({ locale, dictionary = {} }: { locale: Locale; dictionary?: TranslationDictionary }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntakeResponse | null>(null);
  const [error, setError] = useState('');
  const year = useMemo(() => new Date().getFullYear(), []);
  const t = (value: string) => translate(locale, value, dictionary);

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Could not submit project.');
      setResult((await response.json()) as IntakeResponse);
      form.reset();
    } catch {
      setError(t('We could not send your brief just now. Please try again or contact us directly on WhatsApp.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main lang={locale === 'zh' ? 'zh-CN' : locale} dir={isRtlLocale(locale) ? 'rtl' : 'ltr'} className="overflow-hidden bg-[#F5F2E8] text-[#102321]">
      <header className="sticky top-0 z-50 bg-[#F5F2E8]">
        <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <a href={`/?lang=${locale}`} className="text-2xl font-black tracking-[-0.06em]">Elx<span className="text-[#F06449]">.</span>Studio</a>
          <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href={`/services?lang=${locale}`} className="transition hover:opacity-60">{t('Expertise')}</a>
            <a href={`/how-it-works?lang=${locale}`} className="transition hover:opacity-60">{t('How it works')}</a>
            <a href={`/pricing?lang=${locale}`} className="transition hover:opacity-60">Pricing</a>
            <a href="#start" className="transition hover:opacity-60">{t('Send a brief')}</a>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher locale={locale} />
            <a href={`/start?lang=${locale}`} className="hidden bg-[#102321] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#F06449] sm:block">{t('Start a project')} <span aria-hidden="true">↗</span></a>
          </div>
        </nav>
      </header>

      <section id="top" className="bg-[#073C3E] text-white">
        <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-16 md:px-10 md:pb-12 md:pt-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <a href="#services" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[.14em] text-[#DDF65C]">
                {t('Technical & professional project support')} <span aria-hidden="true">→</span>
              </a>
              <h1 className="max-w-5xl text-[clamp(4.6rem,11vw,10rem)] font-black leading-[.78] tracking-[-0.085em]">
                {t('Get it')}<br /><span className="text-[#DDF65C]">{t('right.')}</span>
              </h1>
            </div>
            <div className="max-w-xl pb-2 lg:pb-5">
              <p className="text-xl leading-8 text-white/72 md:text-2xl md:leading-9">{t("Bring us the difficult brief—the calculations, drawings, models, reports and details. We'll help turn it into clear, polished work you can use with confidence.")}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={`/start?lang=${locale}`} className="bg-[#DDF65C] px-7 py-4 text-center text-sm font-bold text-[#102321] transition hover:bg-white">{t('Send your brief')}</a>
                <a href={`/services?lang=${locale}`} className="px-1 py-4 text-center text-sm font-bold underline decoration-white/35 underline-offset-8 transition hover:decoration-white">{t('Explore our expertise')}</a>
              </div>
            </div>
          </div>

          <div className="-mx-5 mt-14 md:-mx-10 md:mt-20">
            <div className="relative aspect-[16/7] min-h-[340px] overflow-hidden">
              <Image src="/images/technical-render.jpg" alt={t('A geometric three-dimensional digital render')} fill priority sizes="100vw" className="object-cover" />
            </div>
            <div className="grid bg-[#DDF65C] text-[#102321] sm:grid-cols-3">
              {['CAD + 3D', 'STEM + analysis', 'Reports + finance'].map((item) => (
                <div key={item} className="px-5 py-4 font-bold md:px-8">{t(item)}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F2E8]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-8 px-5 py-12 md:grid-cols-4 md:px-10 md:py-16">
          {[
            ['7', 'service areas'],
            ['01', 'reference for every brief'],
            ['Direct', 'WhatsApp communication'],
            ['Flexible', 'delivery formats'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-black tracking-[-0.05em] md:text-5xl">{t(value)}</p>
              <p className="mt-2 max-w-[12rem] text-sm leading-5 text-black/55">{t(label)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F5F2E8] px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-[#F06449]">{t('Built around your brief')}</p>
          <div>
            <h2 className="text-5xl font-black leading-[.94] tracking-[-0.065em] md:text-7xl">{t("Your project can be complex. The process shouldn't be.")}</h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60">{t('No endless searching for different specialists. No wondering what happens next. Start with one clear brief and move forward with the right support around the work.')}</p>
          </div>
        </div>
      </section>

      <section id="services" className="bg-white px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-14 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#F06449]">{t('Everything you need')}</p>
            <h2 className="mt-5 text-5xl font-black leading-[.92] tracking-[-0.065em] md:text-8xl">{t('From first calculation to final presentation.')}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {capabilities.map((item) => (
              <article key={item.title} className={`${item.color} group overflow-hidden`}>
                <div className="flex min-h-[330px] flex-col justify-between p-7 md:p-10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">{item.number}</span>
                    <span className="text-2xl transition group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                  </div>
                  <div>
                    <h3 className="max-w-xl text-3xl font-black leading-[1] tracking-[-0.045em] md:text-5xl">{t(item.title)}</h3>
                    <p className="mt-5 max-w-xl leading-7 text-black/65">{t(item.text)}</p>
                  </div>
                </div>
                <div className="relative block aspect-[16/10] overflow-hidden">
                  <Image src={item.image} alt={t(item.alt)} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 pt-6">
            <p className="mb-6 text-sm font-bold uppercase tracking-[.18em] text-black/45">{t('Also available')}</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {['Reports & proposals', 'Editing & formatting', 'Research support', 'Pitch decks', 'Company profiles', 'Resumes & presentations'].map((item) => (
                <span key={item} className="text-sm font-bold">{t(item)}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-[#073C3E] px-5 py-24 text-white md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-[#DDF65C]">{t('How it works')}</p>
              <h2 className="mt-5 text-5xl font-black leading-[.9] tracking-[-0.065em] md:text-7xl">{t('A clear path from brief to done.')}</h2>
              <a href={`/start?lang=${locale}`} className="mt-8 inline-flex bg-[#DDF65C] px-6 py-4 text-sm font-bold text-[#102321]">{t('Start your project →')}</a>
            </div>
            <div className="border-t border-white/10">
              {workflow.map(([title, text], index) => (
                <div key={title} className="grid gap-5 border-b border-white/10 py-8 md:grid-cols-[80px_1fr] md:py-10">
                  <span className="text-sm font-bold text-[#DDF65C]">0{index + 1}</span>
                  <div>
                    <h3 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">{t(title)}</h3>
                    <p className="mt-3 max-w-xl leading-7 text-white/60">{t(text)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="start" className="bg-[#DDF65C] px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em]">{t('Ready when you are')}</p>
            <h2 className="mt-5 text-6xl font-black leading-[.87] tracking-[-0.075em] md:text-8xl">{t("Let's get to work.")}</h2>
            <p className="mt-7 max-w-md text-lg leading-8 text-black/65">{t("Share the context, deadline and format you have in mind. We'll review the details and continue with you on WhatsApp.")}</p>
            <div className="mt-10 max-w-md border-t border-black/20 pt-5">
              <p className="font-black">{t('Have supporting files?')}</p>
              <p className="mt-2 text-sm leading-6 text-black/60">{t('Paste a Drive, Dropbox, WeTransfer or OneDrive link—or send the files when we continue on WhatsApp.')}</p>
            </div>
            <div className="relative mt-8 block aspect-[16/10] overflow-hidden">
              <Image src="/images/calculator-charts.jpg" alt={t('A calculator placed over printed charts and analytical reports')} fill sizes="(min-width: 1024px) 32vw, 100vw" className="object-cover" />
            </div>
          </div>

          <form onSubmit={submitProject} className="bg-white p-5 md:p-10">
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="text-sm font-bold">{t('Full name')}</span>
                <input name="name" required className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder={t('Your name')} />
              </label>
              <label>
                <span className="text-sm font-bold">{t('WhatsApp number')}</span>
                <input name="whatsapp" required className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="+254..." />
              </label>
              <label>
                <span className="text-sm font-bold">{t('Email')} <span className="font-normal text-black/45">{t('(optional)')}</span></span>
                <input name="email" type="email" className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="you@email.com" />
              </label>
              <label>
                <span className="text-sm font-bold">{t('What do you need?')}</span>
                <select name="service" required className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0">
                  <option value="">{t('Select a service')}</option>
                  {services.map((service) => <option key={service} value={service}>{t(service)}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-bold">{t('When do you need it?')}</span>
                <input name="deadline" required className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder={t('Today, Friday, 24 hours...')} />
              </label>
              <label>
                <span className="text-sm font-bold">{t('Budget range')} <span className="font-normal text-black/45">{t('(optional)')}</span></span>
                <input name="budget" className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder={t('$50–$200, flexible...')} />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold">{t('Supporting files')} <span className="font-normal text-black/45">{t('(optional)')}</span></span>
                <input name="filesLink" className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder={t('Paste a Drive, Dropbox, WeTransfer or OneDrive link')} />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold">{t('Tell us about the project')}</span>
                <textarea name="brief" required rows={6} className="mt-2 w-full resize-none border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder={t('Describe the goal, requirements, format, software, references and finished files you expect...')} />
              </label>
              <label className="flex items-start gap-3 bg-[#FFF4E8] p-4 text-sm leading-6 md:col-span-2">
                <input name="integrityConfirmed" value="true" type="checkbox" required className="mt-1" />
                <span>I will use the work responsibly and accept the <a href={`/academic-integrity?lang=${locale}`} className="font-black underline">Academic Integrity Policy</a>.</span>
              </label>
            </div>
            <button disabled={loading} className="mt-6 w-full bg-[#102321] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#F06449] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? t('Sending your brief...') : t('Send my brief and continue on WhatsApp →')}
            </button>
            {error && <p className="mt-4 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {result && (
              <div className="mt-5 bg-[#E7F7E8] p-5 text-sm text-[#164F22]">
                <p className="font-bold">{t('We have your brief. Reference:')} {result.orderId}</p>
                <p className="mt-1">{t("Continue on WhatsApp and we'll take it from here.")}</p>
                <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex bg-[#164F22] px-5 py-3 font-bold text-white">{t('Continue on WhatsApp ↗')}</a>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="bg-[#102321] px-5 py-12 text-white md:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-3xl font-black tracking-[-0.06em]">Elx<span className="text-[#F06449]">.</span>Studio</p>
            <p className="mt-3 text-sm text-white/50">© {year} Elx Holdings. {t('Professional and technical project support.')}</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-white/65">
            <a href={`/terms?lang=${locale}`}>{t('Terms')}</a>
            <a href={`/privacy?lang=${locale}`}>{t('Privacy')}</a>
            <a href={`/academic-integrity?lang=${locale}`}>{t('Academic integrity')}</a>
            <a href={`/refund-policy?lang=${locale}`}>Refunds</a>
            <a href={`/revision-policy?lang=${locale}`}>Revisions</a>
            <a href={`/dashboard?lang=${locale}`}>Workspace</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
