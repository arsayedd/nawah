import Link from "next/link";

export function EmptyState({
  title,
  copy,
  href,
  action,
}: {
  title: string;
  copy: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-[16px] border border-dashed border-navy/15 bg-white px-6 py-12 text-center">
      <div className="text-sm font-semibold text-navy">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm text-navy/55">{copy}</p>
      {href && action ? (
        <Link href={href} className="mt-4 inline-block text-sm font-medium text-cobalt">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
