insert into public.companies (id, parent_company_id, slug, name, brand_name, status)
values
  ('00000000-0000-4000-8000-000000000001', null, 'elx-holdings', 'Elx Holdings', 'Elx Holdings', 'active'),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'elx-studio', 'Elx Studio', 'Elx Studio', 'active')
on conflict (slug) do update set name = excluded.name, brand_name = excluded.brand_name, status = excluded.status;

insert into public.service_categories (company_id, slug, title, description, sort_order)
values
  ('00000000-0000-4000-8000-000000000002', 'writing-documentation', 'Writing & documentation', 'Reports, proposals, editing, formatting and technical documentation.', 1),
  ('00000000-0000-4000-8000-000000000002', 'stem-technical', 'STEM & technical support', 'Mathematics, science, engineering, data analysis and technical explanations.', 2),
  ('00000000-0000-4000-8000-000000000002', 'architecture-design', 'Architecture & design', 'Plans, concept design, boards and architectural documentation.', 3),
  ('00000000-0000-4000-8000-000000000002', 'cad-drafting', 'CAD & technical drawing', 'AutoCAD, Revit, SolidWorks and production-ready drafting.', 4),
  ('00000000-0000-4000-8000-000000000002', '3d-modeling-rendering', '3D modeling & rendering', 'Product, interior, exterior and architectural visualization.', 5),
  ('00000000-0000-4000-8000-000000000002', 'finance-accounting', 'Finance & accounting', 'Analysis, forecasting, bookkeeping support and financial models.', 6),
  ('00000000-0000-4000-8000-000000000002', 'business-professional', 'Business & professional services', 'Pitch decks, proposals, research and professional profiles.', 7)
on conflict (company_id, slug) do update set title = excluded.title, description = excluded.description, sort_order = excluded.sort_order;

with service_seed(category_slug, slug, title, formats) as (
  values
    ('writing-documentation','reports','Reports',array['DOCX','PDF']),
    ('writing-documentation','proposals','Proposals',array['DOCX','PDF']),
    ('writing-documentation','editing-proofreading','Editing and proofreading',array['DOCX','PDF']),
    ('writing-documentation','formatting-references','Formatting and references',array['DOCX','PDF']),
    ('writing-documentation','technical-documentation','Technical documentation',array['DOCX','PDF']),
    ('stem-technical','mathematics','Mathematics',array['PDF','DOCX']),
    ('stem-technical','physics-chemistry','Physics and chemistry',array['PDF','DOCX']),
    ('stem-technical','engineering-support','Engineering support',array['PDF','XLSX']),
    ('stem-technical','data-analysis','Data analysis',array['XLSX','CSV','PDF']),
    ('architecture-design','floor-plans','Floor plans',array['DWG','PDF']),
    ('architecture-design','site-plans','Site plans',array['DWG','PDF']),
    ('architecture-design','concept-design','Concept design',array['PDF','JPG','PNG']),
    ('architecture-design','construction-drawings','Construction drawings',array['DWG','RVT','PDF']),
    ('cad-drafting','autocad-drafting','AutoCAD drafting',array['DWG','DXF','PDF']),
    ('cad-drafting','revit-support','Revit support',array['RVT','PDF']),
    ('cad-drafting','solidworks-files','SolidWorks files',array['SLDPRT','STEP','PDF']),
    ('cad-drafting','2d-to-3d','2D to 3D conversion',array['DWG','STEP','STL']),
    ('3d-modeling-rendering','architectural-rendering','Architectural rendering',array['JPG','PNG']),
    ('3d-modeling-rendering','interior-exterior-scenes','Interior and exterior scenes',array['JPG','PNG','SKP']),
    ('3d-modeling-rendering','product-models','Product models',array['OBJ','FBX','STL']),
    ('3d-modeling-rendering','product-rendering','Product rendering',array['JPG','PNG']),
    ('finance-accounting','financial-analysis','Financial analysis',array['XLSX','PDF']),
    ('finance-accounting','budgeting-forecasting','Budgeting and forecasting',array['XLSX','PDF']),
    ('finance-accounting','bookkeeping-support','Bookkeeping support',array['XLSX','CSV']),
    ('finance-accounting','excel-modeling','Excel modeling',array['XLSX']),
    ('business-professional','pitch-decks','Pitch decks',array['PPTX','PDF']),
    ('business-professional','business-proposals','Business proposals',array['DOCX','PDF']),
    ('business-professional','market-research','Market research',array['DOCX','PDF','PPTX']),
    ('business-professional','company-profiles','Company profiles',array['PPTX','PDF']),
    ('business-professional','cv-resume','CV and resume writing',array['DOCX','PDF'])
)
insert into public.services (category_id, slug, title, supported_formats)
select c.id, s.slug, s.title, s.formats
from service_seed s
join public.service_categories c on c.slug = s.category_slug and c.company_id = '00000000-0000-4000-8000-000000000002'
on conflict (category_id, slug) do update set title = excluded.title, supported_formats = excluded.supported_formats, is_active = true;

insert into public.settings (company_id, key, value)
values
  ('00000000-0000-4000-8000-000000000002', 'order_workflow', '{"manual_quotes":true,"payments_enabled":false,"client_expert_chat":false,"default_currency":"USD"}'::jsonb),
  ('00000000-0000-4000-8000-000000000002', 'revision_policy', '{"default_free_rounds":1,"window_days":7,"admin_approval_required":true}'::jsonb)
on conflict (company_id, key) do update set value = excluded.value, updated_at = now();
