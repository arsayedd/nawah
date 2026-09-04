import type { AccessRole, Employee } from "@/lib/types";

export const ALL_MODULES = [
  "/home",
  "/map",
  "/my-work",
  "/spaces",
  "/projects",
  "/calendar",
  "/time",
  "/workload",
  "/crm",
  "/clients",
  "/accounts",
  "/quotes",
  "/catalog",
  "/docs",
  "/inbox",
  "/chat",
  "/mail",
  "/notifications",
  "/files",
  "/portal",
  "/book",
  "/finance",
  "/contracts",
  "/retainers",
  "/analytics",
  "/automations",
  "/ai",
  "/team",
  "/people",
  "/hr",
  "/settings",
  "/customize",
] as const;

const ROLE_MODULES: Record<AccessRole, readonly string[]> = {
  owner: ALL_MODULES,
  admin: ALL_MODULES,
  sales: ["/home", "/map", "/my-work", "/crm", "/clients", "/accounts", "/quotes", "/catalog", "/calendar", "/chat", "/mail", "/notifications", "/inbox"],
  am: ["/home", "/map", "/my-work", "/crm", "/clients", "/accounts", "/quotes", "/projects", "/docs", "/inbox", "/chat", "/mail", "/notifications", "/portal", "/calendar", "/files"],
  pm: ["/home", "/map", "/my-work", "/spaces", "/projects", "/workload", "/docs", "/inbox", "/chat", "/mail", "/notifications", "/files", "/calendar", "/time", "/team"],
  team: ["/home", "/map", "/my-work", "/projects", "/docs", "/inbox", "/chat", "/mail", "/notifications", "/files", "/calendar", "/time"],
  finance: ["/home", "/map", "/finance", "/contracts", "/retainers", "/quotes", "/clients", "/mail", "/notifications", "/analytics"],
  hr: ["/home", "/map", "/people", "/hr", "/team", "/mail", "/notifications", "/settings"],
  freelancer: ["/home", "/map", "/my-work", "/projects", "/chat", "/notifications", "/files", "/time"],
  reviewer: ["/home", "/map", "/files", "/portal", "/notifications"],
};

export function modulesFor(employee?: Employee | null): string[] {
  if (!employee) return [...ALL_MODULES];
  if (employee.modules?.length) return employee.modules;
  const role = employee.accessRole ?? (employee.kind === "freelancer" ? "freelancer" : "team");
  return [...(ROLE_MODULES[role] ?? ROLE_MODULES.team)];
}

export function canAccessPath(employee: Employee | undefined, pathname: string): boolean {
  if (!employee || employee.status === "inactive") return pathname === "/home" || pathname === "/map";
  if ((employee.accessRole ?? "owner") === "owner" || employee.accessRole === "admin") return true;
  const allowed = modulesFor(employee);
  if (pathname === "/" || pathname.startsWith("/q/") || pathname.startsWith("/book") || pathname.startsWith("/review"))
    return true;
  return allowed.some((href) => pathname === href || pathname.startsWith(`${href}/`));
}
