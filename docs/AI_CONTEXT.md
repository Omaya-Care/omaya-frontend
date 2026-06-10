# Omaya Care — Hospital Portal

## What this is
Omaya Care is a voice AI platform that calls new mothers after hospital discharge,
classifies their responses by severity, and escalates urgent cases to a named midwife.
This portal is the web dashboard used by hospital staff (midwives, admins) to monitor
mothers, review call outcomes, and act on escalations.

## Who uses it
- Midwives — review flagged calls, acknowledge escalations, see their assigned mothers
- Admins — manage staff, view cohort-wide stats, configure settings
- The logged-in user shown in the sidebar is always a midwife or admin at a Ghanaian hospital

## Severity levels — use these exact strings everywhere in code
- "crisis"   — immediate danger, SLA 2 hours,  color #DC2626
- "elevated" — urgent concern,  SLA 4 hours,  color #EA580C
- "monitor"  — needs watching,  no SLA,        color #CA8A04
- "routine"  — all clear,                      color #16A34A
- "inactive" — not yet called or exited,       color #9CA3AF

## Pages and routes
- /dashboard  — main overview, default landing
- /mothers    — list of all enrolled mothers
- /calls      — call log and scheduling
- /staff      — staff and roles management
- /admin      — admin settings
- /settings   — portal settings

## Design system

Primary brand color: #93406B

Sidebar background:       #FFFFFF
Main content background:  #F4F4F5
Main content area has border-radius 16px on the top-left corner only.
This creates a layered card effect — the main panel appears to float over
the white sidebar. No topbar. The page greeting lives inside main content padding.

Stat card backgrounds (brand-derived pastels — use in this order):
- Card 1: #F7E8F0
- Card 2: #F2DCEA
- Card 3: #EDD5E4
- Card 4: #E8CCDC

Stat card number color:  #3D1A2E
Stat card label color:   #6B2C50

Severity badge colors:
- crisis:   background #FEE2E2, text #DC2626
- elevated: background #FFEDD5, text #EA580C
- monitor:  background #FEF9C3, text #CA8A04
- routine:  background #DCFCE7, text #16A34A
- inactive: background #F3F4F6, text #9CA3AF

Typography:
- Font: Public Sans (loaded from Google Fonts)
- All text sentence case — never title case or all caps

## Data rules
- All data is mock and hardcoded — no backend, no API calls yet
- Mock data lives in src/data/ as TypeScript files
- All mock names must be Ghanaian (e.g. Abena, Ama, Kofi, Kwame, Gifty, Akosua, Esi)
- Types live in src/types/

## Stack
- Vite + React + TypeScript
- Tailwind CSS v3
- React Router v7
- Lucide React for icons
- pnpm as package manager
- No UI component library — everything is custom Tailwind

## Locale
- Country: Ghana
- Currency: GHS
- Date format: DD/MM/YYYY
- Phone format: +233 XX XXX XXXX

## Rules — follow on every single prompt
- Never use a color, font, or spacing value not defined in this file
- Always use the exact severity strings above — no variations
- Keep every component small and single-purpose
- No inline styles — Tailwind utility classes only
- Never install a new package without asking first
- All mock data must use Ghanaian names
