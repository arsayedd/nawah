export type PageSectionDef = { id: string; label: string };

export const PAGE_SECTIONS: Record<string, PageSectionDef[]> = {
  "/home": [
    { id: "spine", label: "Process spine" },
    { id: "cash", label: "Cash at risk" },
    { id: "kpis", label: "KPI cards" },
    { id: "health", label: "Project health" },
    { id: "inbox", label: "Notices, mail, chat, files" },
    { id: "decisions", label: "Decisions & load" },
    { id: "spotlight", label: "Quotes & meetings" },
    { id: "pipeline", label: "Pipeline & risk" },
    { id: "ops", label: "Contracts & retainers" },
    { id: "people", label: "People" },
    { id: "catalog", label: "Catalog & cash" },
    { id: "automations", label: "Automations" },
    { id: "projects", label: "Projects" },
    { id: "os", label: "Whole OS links" },
  ],
  "/map": [
    { id: "spine", label: "Data spine" },
    { id: "pillars", label: "OS pillars" },
  ],
  "/spaces": [{ id: "list", label: "Departments" }],
  "/crm": [{ id: "forecast", label: "Sales forecast" }, { id: "board", label: "Pipeline board" }],
  "/crm/:id": [
    { id: "profile", label: "Lead profile" },
    { id: "comments", label: "Comments" },
  ],
  "/quotes": [{ id: "list", label: "Quote list" }],
  "/quotes/:id": [
    { id: "builder", label: "Quote builder" },
    { id: "comments", label: "Comments" },
  ],
  "/clients": [{ id: "grid", label: "Client cards" }],
  "/clients/:id": [
    { id: "profile", label: "Client 360" },
    { id: "comments", label: "Comments" },
  ],
  "/accounts": [
    { id: "kpis", label: "Book KPIs" },
    { id: "list", label: "Accounts list" },
  ],
  "/projects": [
    { id: "cards", label: "Project cards" },
    { id: "board", label: "Task views" },
  ],
  "/projects/:id": [
    { id: "header", label: "Project header" },
    { id: "tasks", label: "Tasks" },
    { id: "comments", label: "Project comments" },
  ],
  "/my-work": [
    { id: "people", label: "Person switcher" },
    { id: "queue", label: "Work queue" },
  ],
  "/workload": [
    { id: "unassigned", label: "Unassigned" },
    { id: "people", label: "Capacity grid" },
  ],
  "/catalog": [{ id: "list", label: "Service packages" }],
  "/docs": [
    { id: "tree", label: "Workspace tree" },
    { id: "cards", label: "Page cards" },
  ],
  "/docs/:id": [
    { id: "editor", label: "Editor" },
    { id: "comments", label: "Comments" },
  ],
  "/inbox": [
    { id: "channels", label: "Channels" },
    { id: "thread", label: "Thread" },
  ],
  "/chat": [
    { id: "create", label: "Create room" },
    { id: "rooms", label: "Rooms" },
    { id: "thread", label: "Messages" },
  ],
  "/mail": [
    { id: "compose", label: "Compose" },
    { id: "inbox", label: "Inbox / sent" },
  ],
  "/notifications": [
    { id: "send", label: "Send" },
    { id: "inbox", label: "Your inbox" },
  ],
  "/files": [{ id: "list", label: "File list" }],
  "/portal": [
    { id: "work", label: "Work & approvals" },
    { id: "billing", label: "Quotes & invoices" },
  ],
  "/calendar": [
    { id: "types", label: "Booking types" },
    { id: "week", label: "Week grid" },
  ],
  "/time": [
    { id: "people", label: "People load" },
    { id: "entries", label: "Timers & entries" },
  ],
  "/finance": [
    { id: "kpis", label: "Cash KPIs" },
    { id: "pnl", label: "Project P&L" },
    { id: "invoices", label: "Invoices" },
    { id: "cash", label: "Payments & expenses" },
  ],
  "/contracts": [{ id: "list", label: "Contracts" }],
  "/retainers": [{ id: "list", label: "Retainers" }],
  "/analytics": [
    { id: "kpis", label: "Headline KPIs" },
    { id: "detail", label: "Breakdowns" },
  ],
  "/automations": [
    { id: "rules", label: "Rules" },
    { id: "log", label: "Activity log" },
  ],
  "/ai": [
    { id: "prompts", label: "Prompts" },
    { id: "answer", label: "Answer" },
  ],
  "/people": [{ id: "list", label: "Employee cards" }],
  "/people/:id": [
    { id: "profile", label: "Profile" },
    { id: "access", label: "Module access" },
    { id: "comments", label: "Comments" },
  ],
  "/hr": [
    { id: "attendance", label: "Attendance" },
    { id: "leave", label: "Leave" },
    { id: "payroll", label: "Payroll" },
  ],
  "/team": [{ id: "rates", label: "Rates & load" }],
  "/settings": [
    { id: "workspace", label: "Workspace" },
    { id: "saas", label: "SaaS subscriptions" },
  ],
  "/customize": [
    { id: "nav", label: "Sidebar modules" },
    { id: "home", label: "Home widgets" },
    { id: "pages", label: "Every page" },
  ],
};

export function pageKeyFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/home";
  if (parts.length === 1) return `/${parts[0]}`;
  if (parts[0] === "crm" && parts[2] === "discover") return "/crm/:id";
  if (parts[0] === "review") return "/projects/:id";
  return `/${parts[0]}/:id`;
}

export function sectionsForPath(pathname: string): PageSectionDef[] {
  return PAGE_SECTIONS[pageKeyFromPath(pathname)] ?? [];
}
