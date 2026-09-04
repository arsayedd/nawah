# Nawah — Agency OS

Nawah is the operating system for agencies. One data core:

`Lead → Opportunity → Quotation → Contract → Client → Project → Tasks → Deliverables → Approval → Invoice → Payment → Real profit → Renewal`

Default language is **English** (LTR). Arabic is a header toggle inside the OS.

## Surfaces

- `/` — English marketing home (animated product story)
- `/map` — live Agency OS map (every pillar and child module)
- `/home` — executive workspace
- `/spaces` — departments holding projects
- `/book` — public booking with event types (Calendly-style)
- `/accounts` — account manager book
- `/docs` — wiki tree, templates, linked databases

## Modules

Projects now include an editable table, a real month calendar, and gantt bars from start/due dates. Files can change status and version. Inbox messages become tasks and open the project.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:45217](http://localhost:45217).

## Sign in

OS routes require a session. Open `/login`.

- Team: `ahmed@nawah.agency` / `nawah` (also Sara, Lina, Maya)
- Client portal: `hello@luminhome.eg` / `portal`

`GET/PUT /api/os` is cookie-locked. Clients cannot write the workspace snapshot; approvals go through `/api/os/action`.

## Demo path

1. Product story on `/`.
2. Sign in on `/login`, then `/home`.
3. Pipeline — drag Bloom Café across stages.
4. Quotations — open **NW-1042**, accept it (or use `/q/q_bloom`).
5. Accepting a quote creates the client, project, tasks, deposit invoice, and portal invite.
6. Client portal — approve work without seeing internal cost.
7. Finance — invoices, expenses, project profit.

⌘K searches clients, leads, projects, and quotes.

Data lives on **Supabase**. The service role key stays on the server.

## Brand

Midnight Navy `#071B3A` · Electric Cobalt `#2563EB` · Mint `#19D3AE` · Off White `#F6F4EF` · Coral `#FF7A59`

Inter (English UI) · Cairo (Arabic)

## Stack

Next.js, TypeScript, Tailwind CSS, Framer Motion, Zustand, Supabase.
