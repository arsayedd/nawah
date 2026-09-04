"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

const tools = [
  { name: "Adobe CC", plan: "Team", cost: 9800, seats: 6, used: 4, renew: "2026-09-20" },
  { name: "Figma", plan: "Org", cost: 4200, seats: 8, used: 5, renew: "2026-10-01" },
  { name: "ClickUp", plan: "Business", cost: 3600, seats: 12, used: 3, renew: "2026-09-12" },
  { name: "Notion", plan: "Plus", cost: 2400, seats: 12, used: 7, renew: "2026-09-28" },
];

export default function SettingsPage() {
  const locale = useOS((s) => s.locale);
  const resetDemo = useOS((s) => s.resetDemo);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{dict.nav.settings}</h1>
      <Card>
        <h2 className="font-semibold">
          {locale === "ar" ? "مساحة العمل" : "Workspace"}
        </h2>
        <p className="mt-1 text-sm text-navy/55">Masar Digital · EGP · VAT 14%</p>
        <p className="mt-2 text-sm text-navy/55">
          {locale === "ar"
            ? "الأدوار: Owner, Admin, Sales, Account Manager, PM, Team, Finance, HR, Freelancer, Client."
            : "Roles: Owner, Admin, Sales, Account Manager, PM, Team, Finance, HR, Freelancer, Client."}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => resetDemo()}>
          {dict.reset}
        </Button>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">
          {locale === "ar" ? "اشتراكات الأدوات" : "SaaS subscriptions"}
        </h2>
        <p className="mb-3 text-sm text-navy/55">
          {locale === "ar"
            ? "نواة بتحل محل ClickUp وNotion للتشغيل اليومي. المقاعد الفاضية ظاهرة تحت."
            : "Nawah is meant to replace ClickUp and Notion for daily ops. Unused seats are flagged below."}
        </p>
        <div className="space-y-2">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-paper px-3 py-2 text-sm"
            >
              <span className="font-medium">{tool.name}</span>
              <span className="text-navy/50">
                {tool.used}/{tool.seats} seats · {tool.cost} EGP · {tool.renew}
              </span>
              {tool.used < tool.seats / 2 ? (
                <span className="text-xs text-coral">
                  {locale === "ar" ? "Downgrade مقترح" : "Suggest downgrade"}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
