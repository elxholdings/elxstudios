# Elx Studio specification gap audit

## Built

- Public site, service catalogue, intake wizard, policies, translation routing and SEO
- Supabase email/password identity, verification callback, recovery and persistent sessions
- Client, expert, manager, admin and super-admin role model with Row Level Security
- Cloud orders, quote records, assignments, statuses and notifications
- Protected client portal with order detail, files, messages, revisions and approved deliverables
- Protected operations portal with order search, manual quoting, assignments, status control, messaging, revision decisions and delivery publishing
- Private source/deliverable buckets with participant policies and one-minute signed downloads
- Database foundation for payments, invoices, tasks, quality review, support, reviews, payouts, CMS and audits

## Remaining production gaps

### Identity and operations hardening

- Google login, admin 2FA, login alerts and session/device management
- Staff invitation and role-management UI (initial owner promotion is SQL-controlled)
- Expert-specific task, workload, submission and payout portal
- Quality-control checklist UI and independent delivery approval

### External services

- Payment gateway/mobile money, invoices, refunds and reconciliation
- Production SMTP and transactional templates
- Malware scanning, retention jobs, backups, monitoring and error reporting
- Automatic WhatsApp/SMS updates

### Product depth

- File previews and annotations for office, CAD and 3D formats
- Quote acceptance and payment-state automation
- Support-ticket, reviews, CMS, blog and portfolio interfaces
- Analytics, financial reports and central Elx Holdings portal

Payments remain intentionally deferred. The current workflow supports real client delivery with manual quotes and manual payment coordination.
