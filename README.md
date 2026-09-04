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

Data lives in the browser (`localStorage`). Reset the demo from Settings.

## Brand

Midnight Navy `#071B3A` · Electric Cobalt `#2563EB` · Mint `#19D3AE` · Off White `#F6F4EF` · Coral `#FF7A59`

Cairo (Arabic) + Inter (Latin).

## Stack

Next.js, TypeScript, Tailwind CSS, Zustand.
