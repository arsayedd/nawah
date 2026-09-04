export type MapChild = { label: string; href: string };
export type MapPillar = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  children: MapChild[];
};

/** One data core — accepting a quote walks this spine. */
export const AGENCY_SPINE: MapChild[] = [
  { label: "Lead", href: "/crm" },
  { label: "Opportunity", href: "/crm" },
  { label: "Quotation", href: "/quotes" },
  { label: "Contract", href: "/contracts" },
  { label: "Client", href: "/clients" },
  { label: "Project", href: "/projects" },
  { label: "Tasks", href: "/projects" },
  { label: "Deliverables", href: "/files" },
  { label: "Approval", href: "/portal" },
  { label: "Invoice", href: "/finance" },
  { label: "Payment", href: "/finance" },
  { label: "Real profit", href: "/analytics" },
  { label: "Renewal", href: "/retainers" },
];

export const OS_PILLARS: MapPillar[] = [
  {
    id: "home",
    title: "Executive Home",
    blurb: "Cash, pipeline, risk, load, and the decisions that need you today.",
    href: "/home",
    children: [
      { label: "Owner dashboard", href: "/home" },
      { label: "Quick add", href: "/home" },
      { label: "Customize", href: "/customize" },
    ],
  },
  {
    id: "crm",
    title: "CRM & Sales",
    blurb: "Won is not the end of CRM — it becomes delivery.",
    href: "/crm",
    children: [
      { label: "Leads", href: "/crm" },
      { label: "Sales pipeline", href: "/crm" },
      { label: "Discovery forms", href: "/crm" },
      { label: "Calls, emails, meetings", href: "/accounts" },
      { label: "Sales forecast", href: "/crm" },
    ],
  },
  {
    id: "quote",
    title: "Quotation & Proposal",
    blurb: "Catalog, hours, margin, branded link, e-sign, deposit.",
    href: "/quotes",
    children: [
      { label: "Service catalog", href: "/catalog" },
      { label: "Cost & hours", href: "/quotes" },
      { label: "Pricing & margins", href: "/quotes" },
      { label: "Branded PDF / link", href: "/q/q_bloom" },
      { label: "Contracts & e-sign", href: "/contracts" },
      { label: "Open / accept tracking", href: "/quotes" },
    ],
  },
  {
    id: "clients",
    title: "Client 360",
    blurb: "Health, profit, contacts, contracts, and portal on one page.",
    href: "/clients",
    children: [
      { label: "Company file", href: "/clients" },
      { label: "Account book", href: "/accounts" },
    ],
  },
  {
    id: "ops",
    title: "Projects & Operations",
    blurb: "Spaces, board, gantt, milestones, retainers — ClickUp-class, on the same data.",
    href: "/projects",
    children: [
      { label: "Spaces / departments", href: "/spaces" },
      { label: "Projects", href: "/projects" },
      { label: "Tasks & subtasks", href: "/projects" },
      { label: "List / board / calendar / gantt", href: "/projects" },
      { label: "My work", href: "/my-work" },
      { label: "Approvals & revisions", href: "/files" },
      { label: "Recurring retainers", href: "/retainers" },
    ],
  },
  {
    id: "docs",
    title: "Docs & Knowledge",
    blurb: "Wiki, SOPs, templates, linked databases. A line becomes a task.",
    href: "/docs",
    children: [
      { label: "Pages", href: "/docs" },
      { label: "Linked databases", href: "/docs" },
      { label: "Company wiki", href: "/docs" },
      { label: "SOPs & checklists", href: "/docs" },
      { label: "Templates", href: "/docs" },
      { label: "Discovery forms", href: "/crm" },
    ],
  },
  {
    id: "comm",
    title: "Communication Hub",
    blurb: "Team chat, client threads, mail, notices — convert a message to a task.",
    href: "/inbox",
    children: [
      { label: "Project & client threads", href: "/inbox" },
      { label: "Internal chat", href: "/chat" },
      { label: "Internal mail", href: "/mail" },
      { label: "Notifications", href: "/notifications" },
      { label: "Meetings", href: "/calendar" },
    ],
  },
  {
    id: "files",
    title: "Files & Creative Review",
    blurb: "Versions on the deliverable. Pins on the design. Cost stays hidden.",
    href: "/files",
    children: [
      { label: "File library", href: "/files" },
      { label: "Creative review", href: "/files" },
    ],
  },
  {
    id: "team",
    title: "HR & Team",
    blurb: "Hire, salary, access, attendance, payroll — the same people on quotes.",
    href: "/people",
    children: [
      { label: "Employees", href: "/people" },
      { label: "Freelancers", href: "/people" },
      { label: "Attendance & leave", href: "/hr" },
      { label: "Performance", href: "/hr" },
      { label: "Payroll & commissions", href: "/hr" },
      { label: "Rates & load", href: "/team" },
    ],
  },
  {
    id: "time",
    title: "Time & Capacity",
    blurb: "Timers that know cost. Overbooked vs idle. Assign by skill.",
    href: "/time",
    children: [
      { label: "Timers & timesheets", href: "/time" },
      { label: "Workload", href: "/workload" },
      { label: "Calendar", href: "/calendar" },
      { label: "Public booking", href: "/book" },
    ],
  },
  {
    id: "fin",
    title: "Finance & Profitability",
    blurb: "Invoice, collect, expense, then real profit — not a spreadsheet later.",
    href: "/finance",
    children: [
      { label: "Invoices", href: "/finance" },
      { label: "Payments", href: "/finance" },
      { label: "Expenses", href: "/finance" },
      { label: "Cash flow", href: "/finance" },
      { label: "Project profitability", href: "/finance" },
      { label: "Subscriptions control", href: "/settings" },
    ],
  },
  {
    id: "portal",
    title: "Client Portal",
    blurb: "Status, files, approve, pay. Internal chatter and cost never leak.",
    href: "/portal",
    children: [
      { label: "Approvals", href: "/portal" },
      { label: "Quotes & invoices", href: "/portal" },
      { label: "Book a meeting", href: "/book" },
    ],
  },
  {
    id: "auto",
    title: "Automation Engine",
    blurb: "Trigger → conditions → actions. Quote accept already runs the OS.",
    href: "/automations",
    children: [{ label: "Rules & log", href: "/automations" }],
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    blurb: "Owner, sales, ops, people, client health, service profit.",
    href: "/analytics",
    children: [
      { label: "Owner", href: "/analytics" },
      { label: "Sales", href: "/analytics" },
      { label: "Operations", href: "/analytics" },
      { label: "People", href: "/analytics" },
      { label: "Client health", href: "/analytics" },
      { label: "Service profitability", href: "/analytics" },
    ],
  },
  {
    id: "ai",
    title: "AI Assistant",
    blurb: "Answers only from this workspace. No invented numbers.",
    href: "/ai",
    children: [{ label: "Ask Nawah", href: "/ai" }],
  },
  {
    id: "admin",
    title: "Settings, Security & Integrations",
    blurb: "Roles, audit, and SaaS seats. ClickUp and Notion are already Projects and Docs — not Connect buttons.",
    href: "/settings",
    children: [
      { label: "Roles & permissions", href: "/people" },
      { label: "Audit logs", href: "/settings" },
      { label: "API & webhooks", href: "/settings" },
      { label: "Tool subscriptions", href: "/settings" },
      { label: "Customize", href: "/customize" },
    ],
  },
];

