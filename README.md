# Nawah — Agency OS

Nawah is the operating system for agencies. One data core:

`Lead → Quote → Scope → Hours → Team cost → Project → Approval → Invoice → Payment → Real profit → Renewal`

Default language is **English** (LTR). Arabic is a header toggle inside the OS.

## Surfaces

- `/` — English marketing home (animated product story)
- `/home` — executive workspace
- `/q/q_bloom` — public quotation (Bloom Café, NW-1042)

## Modules

CRM, quotations, clients, projects (board / table / gantt), docs, inbox, files & review, portal, time, finance, analytics, automations, Nawah AI, team, calendar, my work, settings.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:45217](http://localhost:45217).

## Demo path

1. Product story on `/`.
2. Enter the OS on `/home`.
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
