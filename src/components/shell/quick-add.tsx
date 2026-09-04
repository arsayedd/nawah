"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";
import { useRouter } from "next/navigation";

const kinds = [
  { id: "lead", ar: "Lead", en: "Lead", href: "/crm" },
  { id: "client", ar: "عميل", en: "Client", href: "/clients" },
  { id: "quote", ar: "كوتيشن", en: "Quotation", href: "/quotes" },
  { id: "project", ar: "مشروع", en: "Project", href: "/projects" },
  { id: "task", ar: "مهمة", en: "Task", href: "/projects" },
  { id: "invoice", ar: "فاتورة", en: "Invoice", href: "/finance" },
  { id: "expense", ar: "مصروف", en: "Expense", href: "/finance" },
  { id: "employee", ar: "موظف", en: "Employee", href: "/people" },
  { id: "meeting", ar: "اجتماع", en: "Meeting", href: "/calendar" },
  { id: "request", ar: "طلب عميل", en: "Client request", href: "/portal" },
  { id: "notice", ar: "تنبيه", en: "Notice", href: "/notifications" },
  { id: "mail", ar: "إيميل", en: "Mail", href: "/mail" },
  { id: "room", ar: "شات", en: "Chat room", href: "/chat" },
  { id: "space", ar: "قسم", en: "Space", href: "/spaces" },
  { id: "catalog", ar: "خدمة", en: "Catalog", href: "/catalog" },
  { id: "contract", ar: "عقد", en: "Contract", href: "/contracts" },
  { id: "retainer", ar: "ريتِينر", en: "Retainer", href: "/retainers" },
  { id: "file", ar: "ملف", en: "File", href: "/files" },
  { id: "doc", ar: "صفحة", en: "Doc", href: "/docs" },
  { id: "leave", ar: "إجازة", en: "Leave", href: "/hr" },
  { id: "automation", ar: "أتمتة", en: "Automation", href: "/automations" },
  { id: "booking", ar: "حجز", en: "Booking type", href: "/calendar" },
] as const;

export function QuickAdd({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const locale = useOS((s) => s.locale);
  const quickAdd = useOS((s) => s.quickAdd);
  const router = useRouter();
  const [kind, setKind] = useState<(typeof kinds)[number]["id"]>("lead");
  const [title, setTitle] = useState("");
  const dict = t(locale);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setKind("lead");
    }
  }, [open]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={dict.quickAdd}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {kinds.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={`rounded-[10px] border px-2 py-2 text-xs font-medium ${
              kind === k.id
                ? "border-cobalt bg-cobalt/10 text-cobalt"
                : "border-navy/10 text-navy/70"
            }`}
          >
            {locale === "ar" ? k.ar : k.en}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={locale === "ar" ? "الاسم أو العنوان" : "Name or title"}
        />
        <Button
          className="w-full"
          disabled={!title.trim() && kind !== "quote"}
          onClick={() => {
            const id = quickAdd(kind, title.trim() || "Untitled");
            const href =
              kind === "quote"
                ? `/quotes/${id}`
                : kind === "employee"
                  ? `/people/${id}`
                  : kind === "doc"
                    ? `/docs/${id}`
                    : kind === "lead"
                      ? `/crm/${id}`
                      : kind === "client"
                        ? `/clients/${id}`
                        : kind === "project"
                          ? `/projects/${id}`
                          : kinds.find((k) => k.id === kind)?.href ?? "/";
            onOpenChange(false);
            router.push(href);
          }}
        >
          {locale === "ar" ? "إنشاء" : "Create"}
        </Button>
      </div>
    </Modal>
  );
}
