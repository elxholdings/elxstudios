# Elx Studio development status

This document maps the platform specification to what is currently safe to use.

## Working now

- Public landing page with technical imagery and responsive layout
- Seven service departments and individual service pages
- About, How It Works, Pricing and Contact pages
- Four-step project brief and manual quote request flow
- Elx order-reference generation and WhatsApp handoff
- Device-local client workspace with project stages and file checklist
- Device-local operations-board preview with status updates
- Terms, Privacy, Academic Integrity, Refund and Revision policies
- 198-language translation architecture; English and Simplified Chinese work without a paid provider
- SEO metadata, structured data, robots file and sitemap
- Optional Supabase lead storage and optional Resend email notifications

## Prototype-only boundaries

The client workspace and operations board currently use browser local storage. They are useful for validating the product flow but they are not accounts, cannot sync between devices and must not be treated as secure cloud records.

The file control records file names only. Actual files are not uploaded until private object storage, access rules and malware scanning are connected.

## Infrastructure still required for a production platform

- Email/password and Google authentication
- Role-based client, admin, manager and expert permissions
- Managed PostgreSQL database with migrations and backups
- Private object storage with signed links and virus scanning
- Order messages, notifications and email delivery
- Secure payment gateway, refunds and invoice records
- Production admin dashboard with audit logs and 2FA
- Secure final-file delivery and revision history

## Deferred to avoid cost now

- Paid machine translation requests
- Payment processing integration
- Cloud file storage
- Transactional email at scale
- SMS and WhatsApp automation
- Advanced analytics and monitoring

## Recommended next connection

Use a free Supabase project first for authentication and PostgreSQL persistence. After accounts and role rules are verified, connect private storage and replace the browser-local workspaces. Payment should come after order records and permissions are trustworthy.
