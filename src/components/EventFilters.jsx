"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

export default function EventFilters({ cities = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [openOnly, setOpenOnly] = useState(
    searchParams.get("openOnly") === "true",
  );

  // Ενημέρωση των URL Params όταν αλλάζει η αναζήτηση
  function updateQueryParams(newSearch, newCity, newOpenOnly) {
    const params = new URLSearchParams();

    if (newSearch) params.set("search", newSearch);
    if (newCity) params.set("city", newCity);
    if (newOpenOnly) params.set("openOnly", "true");

    const queryString = params.toString();
    const query = queryString ? `/?${queryString}` : "/";

    startTransition(() => {
      router.push(query);
    });
  }

  // Debounce για την αναζήτηση κειμένου (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Εκτελείται μόνο αν η τιμή διαφέρει από το URL
      if (search !== (searchParams.get("search") || "")) {
        updateQueryParams(search, city, openOnly);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 mb-10 shadow-xl backdrop-blur-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Αναζήτηση παιχνιδιού, τίτλου..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* City Filter */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            📍
          </span>
          <select
            value={city}
            onChange={(e) => {
              const selectedCity = e.target.value;
              setCity(selectedCity);
              updateQueryParams(search, selectedCity, openOnly);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition cursor-pointer appearance-none"
          >
            <option value="">Όλες οι Πόλεις</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Open Slots Only */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => {
                const checked = e.target.checked;
                setOpenOnly(checked);
                updateQueryParams(search, city, checked);
              }}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <span>🟢 Μόνο διαθέσιμες θέσεις</span>
          </label>

          {(search || city || openOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setCity("");
                setOpenOnly(false);
                router.push("/");
              }}
              className="text-xs text-slate-400 hover:text-purple-400 underline transition"
            >
              Καθαρισμός
            </button>
          )}
        </div>
      </div>

      {isPending && (
        <div className="text-center text-xs text-purple-400 mt-2 font-mono animate-pulse">
          Αναζήτηση...
        </div>
      )}
    </div>
  );
}
