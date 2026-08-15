"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { acceptTermsAction } from "@/app/events/create/actions";

export default function ProfileTermsBox({ initialAccepted = false }) {
  const [isAdult, setIsAdult] = useState(initialAccepted);
  const [hasAgreed, setHasAgreed] = useState(initialAccepted);
  const [isSaved, setIsSaved] = useState(initialAccepted);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!isAdult || !hasAgreed) {
      toast.error("Πρέπει να αποδεχτείτε τους όρους και την ηλικία (18+)");
      return;
    }

    try {
      setLoading(true);
      await acceptTermsAction();
      setIsSaved(true);
      toast.success("Οι όροι χρήσης αποδέκτηκαν με επιτυχία! 🛡️");
    } catch (err) {
      toast.error("Κάτι πήγε στραβά. Προσπαθήστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`border rounded-3xl p-6 shadow-xl space-y-4 transition ${
        isSaved
          ? "bg-slate-900/40 border-slate-800/80"
          : "bg-purple-950/20 border-purple-500/50"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-extrabold text-slate-100 flex items-center gap-2 text-base sm:text-lg">
          🛡️ Επιβεβαίωση Ηλικίας & Όρων Χρήσης
        </h3>
        {isSaved ? (
          <span className="text-xs font-mono px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-bold">
            ✓ Επιβεβαιωμένο (18+)
          </span>
        ) : (
          <span className="text-xs font-mono px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full font-bold animate-pulse">
            ⚠️ Απαιτείται Επιβεβαίωση
          </span>
        )}
      </div>

      {!isSaved && (
        <p className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-800/40 p-3 rounded-xl">
          🔒 Πρέπει να δηλώσετε ότι είστε άνω των 18 ετών για να μπορείτε να
          δημιουργείτε ή να συμμετέχετε σε τραπέζια.
        </p>
      )}

      <div className="space-y-3 text-sm">
        {/* Checkbox 18+ */}
        <div className="flex items-start gap-3 select-none">
          <input
            id="isAdult"
            type="checkbox"
            disabled={isSaved || loading}
            checked={isAdult}
            onChange={(e) => setIsAdult(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label
            htmlFor="isAdult"
            className="text-slate-300 hover:text-slate-100 transition cursor-pointer"
          >
            Δηλώνω υπεύθυνα ότι είμαι{" "}
            <strong className="text-purple-400">άνω των 18 ετών</strong>.
          </label>
        </div>

        {/* Checkbox Terms */}
        <div className="flex items-start gap-3 select-none">
          <input
            id="hasAgreed"
            type="checkbox"
            disabled={isSaved || loading}
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label
            htmlFor="hasAgreed"
            className="text-slate-300 hover:text-slate-100 transition cursor-pointer"
          >
            Έχω διαβάσει και αποδέχομαι τους{" "}
            <Link
              href="/terms"
              target="_blank"
              onClick={(e) => e.stopPropagation()} // Αποφυγή triggering του label
              className="text-cyan-400 underline hover:text-cyan-300 relative z-10"
            >
              Όρους Χρήσης
            </Link>
            .
          </label>
        </div>
      </div>

      {!isSaved && (
        <button
          type="button"
          onClick={handleSave}
          disabled={!isAdult || !hasAgreed || loading}
          className={`w-full py-2.5 rounded-xl font-bold text-xs font-mono transition ${
            isAdult && hasAgreed && !loading
              ? "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg shadow-purple-950"
              : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
          }`}
        >
          {loading ? "Αποθήκευση..." : "Αποδοχή & Ξεκλείδωμα Λειτουργιών"}
        </button>
      )}
    </div>
  );
}
