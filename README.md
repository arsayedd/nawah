# نواة | Nawah — Agency OS

Nawah is an operating system for agencies. One workspace holds CRM, quotations, projects, client portal, invoices, and profitability so a quote that gets accepted actually starts delivery.

This first slice is the **core loop**:

`Lead → Quotation → Project → Tasks → Approval → Invoice → Real profit`

## Run locally

```bash
npm install
npm run dev -- --port 45217
```

Open [http://localhost:45217](http://localhost:45217).

Arabic is the default (RTL). Switch to English from the header.

## Demo path

1. Home — owner dashboard (revenue, pipeline, workload, alerts).
2. CRM — drag Bloom Café through the pipeline.
3. Quotations — open **NW-1042**, then **Accept quote and spin up delivery** (or open the client link `/q/q_bloom` and accept there).
4. That action creates the client, contract, project from the catalog, assigned tasks, deposit invoice, portal invite, kickoff meeting, and expected profit.
5. Client portal — approve or request changes without seeing internal cost.
6. Finance — invoices, expenses, project profit.

Quick Add creates a lead, client, quote, project, task, invoice, expense, employee, meeting, or client request.

Data is stored on **Supabase** (not in the browser). Copy `.env.example` to `.env.local` and fill in the project URL plus keys. The service role key stays on the server only.

Until the SQL schema is applied, Nawah writes a workspace snapshot to the private `nawah` Storage bucket. After you run `supabase/migrations/20260904120000_nawah_core.sql` in the Supabase SQL Editor, the same API switches to the `os_snapshots` Postgres table (RLS on, no browser access).

```bash
cp .env.example .env.local
# then add NEXT_PUBLIC_SUPABASE_URL, anon/publishable, and SUPABASE_SERVICE_ROLE_KEY
```

`supabase link --project-ref tdesltksowtgksxukowl` needs a database password and `supabase login` (account token). Direct `db.*.supabase.co:5432` is IPv6-only.

Reset the demo from Settings — that rewrites the seed workspace on Supabase.

## Brand

Midnight Navy `#071B3A` · Electric Cobalt `#2563EB` · Mint `#19D3AE` · Off White `#F6F4EF` · Coral `#FF7A59`

Cairo (Arabic) + Inter (Latin).

## Stack

Next.js, TypeScript, Tailwind CSS, Zustand, Supabase.
