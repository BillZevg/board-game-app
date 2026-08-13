"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function EventFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="mb-8">
      <div className="relative max-w-2xl mx-auto flex items-center">
        {/* SVG Εικονίδιο Φακού */}
        <div className="absolute left-4 top-0 bottom-0 my-auto flex items-center justify-center pointer-events-none">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        {/* Ενιαίο Input Αναζήτησης */}
        <input
          type="text"
          placeholder="Αναζήτηση με τίτλο παιχνιδιού ή πόλη (π.χ. Catan, Αθήνα)..."
          defaultValue={searchParams.get("search")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        {/* Loader κατά την πληκτρολόγηση */}
        {isPending && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <span className="animate-spin text-xs text-blue-600">⏳</span>
          </div>
        )}
      </div>
    </div>
  );
}
