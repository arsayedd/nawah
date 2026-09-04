"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-navy">
      <h1 className="text-2xl font-semibold">This page failed to load</h1>
      <p className="mt-2 text-sm text-navy/55">
        {error.message || "A render error stopped the workspace."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-[10px] bg-navy px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
        <Link href="/home" className="rounded-[10px] border border-navy/15 px-4 py-2 text-sm">
          Open owner home
        </Link>
        <Link href="/" className="rounded-[10px] border border-navy/15 px-4 py-2 text-sm">
          Marketing home
        </Link>
      </div>
    </div>
  );
}
