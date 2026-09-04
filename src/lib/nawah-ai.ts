import type { OsState } from "@/lib/types";

export type AiAnswer = { title: string; body: string; href?: string };

export function answerNawah(question: string, state: OsState): AiAnswer[] {
  const q = question.toLowerCase();
  const answers: AiAnswer[] = [];

  if (
    /today|need me|interven|قرار|النهارده|today\?/.test(q) ||
    q.includes("need")
  ) {
    answers.push(
      ...state.alerts.map((a) => ({
        title: a.title,
        body: "From the live alert log. Nothing is invented.",
        href: a.href,
      })),
    );
  }

  if (/losing|خاسر|profit|why.*project/.test(q)) {
    for (const p of state.projects) {
      const extra = state.expenses
        .filter((e) => e.projectId === p.id)
        .reduce((s, e) => s + e.amount, 0);
      const paid = state.invoices
        .filter((i) => i.projectId === p.id)
        .reduce((s, i) => s + i.paidAmount, 0);
      const profit = (paid || p.expectedRevenue) - p.expectedCost - extra;
      if (profit < p.expectedRevenue * 0.2 || p.status !== "healthy") {
        answers.push({
          title: p.name,
          body: `Planned cost ${p.expectedCost} EGP, direct expenses ${extra} EGP, collected ${paid} EGP. Status: ${p.status}.`,
          href: `/projects/${p.id}`,
        });
      }
    }
  }

  if (/free|fadi|shopify|available|who/.test(q)) {
    for (const e of state.employees.filter((x) => x.id !== "u_ahmed")) {
      const booked = state.tasks
        .filter((t) => t.assigneeId === e.id && t.status !== "done")
        .reduce((s, t) => s + t.estimateHours, 0);
      answers.push({
        title: e.name,
        body: `${e.role}. Skills: ${e.skills.join(", ") || "—"}. Booked ${booked}/${e.weeklyHours}h this week. Hourly cost ${e.hourlyCost} EGP.`,
        href: "/team",
      });
    }
  }

  if (answers.length === 0) {
    answers.push({
      title: "Not enough connected data",
      body: "Nawah only answers from this workspace. Try: “What needs me today?”, “Why is a project losing?”, or “Who is free for Shopify?”",
    });
  }

  return answers.slice(0, 8);
}
