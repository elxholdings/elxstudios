export type ServiceCategory = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  whoFor: string;
  subservices: string[];
  deliverables: string[];
  formats: string[];
  turnaround: string;
  image: string;
  accent: string;
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: 'writing-documentation',
    title: 'Writing & documentation',
    eyebrow: 'Clarity',
    summary: 'Turn your notes, research or rough draft into a clear document that reads professionally and is easy to review.',
    whoFor: 'For students, researchers, founders, consultants and organizations that need stronger structure, cleaner language or a polished final file.',
    subservices: ['Reports', 'Proposals', 'Editing and proofreading', 'Formatting and references', 'Technical documentation', 'Policy and business documents'],
    deliverables: ['Edited or newly structured document', 'Tracked-change version when requested', 'Reference and formatting review', 'Final presentation-ready file'],
    formats: ['DOCX', 'PDF', 'PPTX', 'Google Docs'],
    turnaround: 'From 24 hours, depending on length and complexity.',
    image: '/images/document-workspace.jpg',
    accent: '#F4B8A7',
  },
  {
    slug: 'stem-technical',
    title: 'STEM & technical support',
    eyebrow: 'Reasoning',
    summary: 'Get structured help with calculations, data, analysis and technical explanations so the method is visible and defensible.',
    whoFor: 'For learners, engineers, analysts and project teams working with mathematics, science, data or technical research.',
    subservices: ['Mathematics', 'Physics and chemistry', 'Engineering support', 'Data analysis', 'Research calculations', 'Scientific presentations'],
    deliverables: ['Worked calculations', 'Method and assumptions', 'Tables, charts or diagrams', 'Editable source file where applicable'],
    formats: ['PDF', 'DOCX', 'XLSX', 'CSV', 'PPTX'],
    turnaround: 'From 24 hours after the scope and source data are confirmed.',
    image: '/images/math-formulas.jpg',
    accent: '#DDF65C',
  },
  {
    slug: 'architecture-design',
    title: 'Architecture & design',
    eyebrow: 'Structure',
    summary: 'Move from an idea, sketch or marked-up plan into organized drawings, boards and design documentation.',
    whoFor: 'For students, homeowners, designers, property teams and firms that need accurate architectural communication.',
    subservices: ['Floor plans', 'Site plans', 'Concept design', 'Interior documentation', 'Construction drawings', 'Presentation boards'],
    deliverables: ['Dimensioned drawings', 'Presentation sheets', 'Design notes', 'Editable source files when included in the quote'],
    formats: ['PDF', 'DWG', 'RVT', 'SKP', 'JPG', 'PNG'],
    turnaround: 'From 2 days for defined drawing packages.',
    image: '/images/architecture-drafting.jpg',
    accent: '#AFC8FF',
  },
  {
    slug: 'cad-drafting',
    title: 'CAD & technical drawing',
    eyebrow: 'Precision',
    summary: 'Create, redraw or refine accurate 2D and 3D technical files you can review, present, fabricate or keep editing.',
    whoFor: 'For engineers, fabricators, designers, students and firms using AutoCAD, Revit or SolidWorks workflows.',
    subservices: ['AutoCAD drafting', 'Revit support', 'SolidWorks files', 'Mechanical drawings', 'Electrical and civil drawings', '2D to 3D conversion'],
    deliverables: ['Clean drawing set', 'Layer and annotation organization', 'Print-ready sheets', 'Native source files as agreed'],
    formats: ['DWG', 'DXF', 'RVT', 'SLDPRT', 'PDF', 'STEP'],
    turnaround: 'From 24 hours for redrawing; larger sets are scheduled after review.',
    image: '/images/blueprint-tools.jpg',
    accent: '#88C9C2',
  },
  {
    slug: '3d-modeling-rendering',
    title: '3D modeling & rendering',
    eyebrow: 'Visualize',
    summary: 'See the object, room, product or building before it is built with clean models and presentation-ready visuals.',
    whoFor: 'For architects, product teams, property professionals, designers and students who need convincing visual outcomes.',
    subservices: ['Architectural rendering', 'Interior and exterior scenes', 'Product models', 'Product rendering', 'Walkthrough visuals', 'Animation-ready assets'],
    deliverables: ['High-resolution renders', 'Defined camera views', 'Model file when included', 'Revision round stated in the quote'],
    formats: ['JPG', 'PNG', 'SKP', 'OBJ', 'FBX', 'STL', 'BLEND'],
    turnaround: 'From 2 days once references, dimensions and visual direction are clear.',
    image: '/images/technical-render.jpg',
    accent: '#C9B8FF',
  },
  {
    slug: 'finance-accounting',
    title: 'Finance & accounting',
    eyebrow: 'Decisions',
    summary: 'Turn messy financial records, assumptions or scenarios into models and reports that support better decisions.',
    whoFor: 'For founders, small businesses, finance students, analysts and managers working with operational or investment data.',
    subservices: ['Financial analysis', 'Budgeting and forecasting', 'Bookkeeping support', 'Financial statements', 'Excel modeling', 'Business and investment reports'],
    deliverables: ['Structured workbook', 'Assumptions and formulas', 'Charts or management summary', 'Editable report or presentation'],
    formats: ['XLSX', 'CSV', 'PDF', 'DOCX', 'PPTX'],
    turnaround: 'From 24 hours after the source records and required outputs are confirmed.',
    image: '/images/financial-analysis.jpg',
    accent: '#FFB58F',
  },
  {
    slug: 'business-professional',
    title: 'Business & professional services',
    eyebrow: 'Present',
    summary: 'Prepare the proposals, profiles, decks and research materials that help your idea or organization move forward.',
    whoFor: 'For founders, job seekers, consultants, nonprofit teams and growing businesses preparing to be evaluated.',
    subservices: ['Pitch decks', 'Business proposals', 'Market research', 'Company profiles', 'CV and resume writing', 'Grant and presentation support'],
    deliverables: ['Audience-focused narrative', 'Polished visual hierarchy', 'Editable master file', 'Exported review copy'],
    formats: ['PPTX', 'PDF', 'DOCX', 'XLSX'],
    turnaround: 'From 2 days depending on research and source-material readiness.',
    image: '/images/analytics-dashboard.jpg',
    accent: '#F7D77A',
  },
];

export function getServiceCategory(slug: string) {
  return serviceCategories.find((service) => service.slug === slug);
}
