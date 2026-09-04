"use client";

import { useOS } from "@/store/use-os";
import { quoteTotals } from "@/data/seed";

export function useKpis() {
  const quotes = useOS((s) => s.quotes);
  const invoices = useOS((s) => s.invoices);
  const expenses = useOS((s) => s.expenses);
  const leads = useOS((s) => s.leads);
  const tasks = useOS((s) => s.tasks);
  const projects = useOS((s) => s.projects);

  const revenue = invoices
    .filter((i) => i.issuedAt.startsWith("2026-09"))
    .reduce((s, i) => s + i.paidAmount, 0);
  const overdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + (i.amount - i.paidAmount), 0);
  const expensesSum = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = revenue - expensesSum;
  const pipeline = leads
    .filter((l) => !["won", "lost"].includes(l.stage))
    .reduce((s, l) => s + l.value * l.probability, 0);
  const newLeads = leads.filter((l) => l.createdAt.startsWith("2026-09")).length;
  const closed = leads.filter((l) => l.stage === "won" || l.stage === "lost");
  const winRate =
    closed.length === 0
      ? 0
      : closed.filter((l) => l.stage === "won").length / closed.length;
  const expected = invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.amount - i.paidAmount), 0);
  const soldHours = tasks.filter((t) => t.billable).reduce((s, t) => s + t.estimateHours, 0);
  const usedHours = tasks.reduce((s, t) => s + t.actualHours, 0);

  const pendingQuotes = quotes.filter((q) =>
    ["sent", "viewed"].includes(q.status),
  );
  const waitingClient = tasks.filter((t) => t.status === "client");

  const serviceProfit = quotes
    .filter((q) => q.status === "accepted")
    .map((q) => {
      const t = quoteTotals(q.items, q.discount, q.taxRate);
      return { name: q.titleAr, profit: t.profit, margin: t.margin };
    });

  return {
    revenue,
    overdue,
    expensesSum,
    profit,
    pipeline,
    newLeads,
    winRate,
    expected,
    soldHours,
    usedHours,
    pendingQuotes,
    waitingClient,
    projects,
    serviceProfit,
  };
}
