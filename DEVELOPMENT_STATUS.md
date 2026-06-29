# Elx Studio development status

## Working now

- Public marketing site, seven service departments and structured project intake
- Supabase email/password registration, confirmation, login, sign-out and password reset
- Cookie-backed sessions, protected client routes and role-protected staff routes
- Cloud-synced orders connected to authenticated clients
- Client order timeline, quote view, private files, signed downloads, messages and revisions
- Staff operations portal for search, status changes, manager/expert assignment and manual quotes
- Staff-to-client notifications, revision decisions and approved final-file delivery
- Row Level Security, private Storage buckets and server-side authorization for privileged actions
- WhatsApp handoff, policy pages, SEO and locale detection
- Meta integration foundation for Pages, Instagram, Lead Ads, Marketing insights and WhatsApp test messaging

## Production setup still required

- Set Supabase Auth Site URL and allowed redirect URLs for the live and local domains
- Register the owner account and promote it to `super_admin` using the documented bootstrap SQL
- Configure production SMTP before inviting many users (Supabase's default mailer is rate limited)
- Add malware scanning before accepting untrusted files at high volume
- Add monitoring, backup checks, admin 2FA and audit-log reporting

## Intentionally deferred

- Payments, refunds and invoices
- Google/social login
- Expert task and payout portal
- Support-ticket UI and CMS publishing
- Automated translation provider, transactional email/SMS and production WhatsApp automation
- File previews for CAD/3D formats

The current milestone is a usable no-payment operations platform. Manual quotes and payment coordination remain the safe operating model until a gateway is connected and tested.
