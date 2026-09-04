# Nawah — Agency OS

Nawah is the operating system for agencies: CRM, quotations, projects, client portal, invoices, and real profit in one core.

Default language is **English** (LTR). Switch to Arabic from the header.

Core loop:

`Lead → Quote → Project → Approval → Invoice → Profit`

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:45217](http://localhost:45217).

## Demo path

1. Home — cash, pipeline, workload, and decisions.
2. Pipeline — drag Bloom Café across stages.
3. Quotations — open **NW-1042**, accept it (or use `/q/q_bloom`).
4. Accepting a quote creates the client, project, tasks, deposit invoice, and portal invite.
5. Client portal — approve work without seeing internal cost.
6. Finance — invoices, expenses, project profit.

⌘K searches clients, leads, projects, and quotes.

Data lives on **Supabase**. The service role key stays on the server.

## Brand

Midnight Navy `#071B3A` · Electric Cobalt `#2563EB` · Mint `#19D3AE` · Off White `#F6F4EF` · Coral `#FF7A59`

Inter (English UI) · Cairo (Arabic)

## Stack

Next.js, TypeScript, Tailwind CSS, Zustand, Supabase.
