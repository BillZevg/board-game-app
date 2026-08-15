"use client";

import { useState } from "react";

export default function RegistrationTerms({ onAccept }) {
  const [isAdult, setIsAdult] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const canProceed = isAdult && hasAgreed;

  const handleChange = (adult, agreed) => {
    if (onAccept) {
      onAccept(adult && agreed);
    }
  };

  return (
    <div className="space-y-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 text-sm">
      <h3 className="font-extrabold text-slate-100 flex items-center gap-2">
        🛡️ Όροι & Ηλικιακός Περιορισμός
      </h3>

      <div className="space-y-3">
        {/* Checkbox 18+ */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isAdult}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsAdult(checked);
              handleChange(checked, hasAgreed);
            }}
            className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <span className="text-slate-300 group-hover:text-slate-100 transition">
            Δηλώνω υπεύθυνα ότι είμαι{" "}
            <strong className="text-purple-400">άνω των 18 ετών</strong>.
          </span>
        </label>

        {/* Checkbox Terms */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={hasAgreed}
            onChange={(e) => {
              const checked = e.target.checked;
              setHasAgreed(checked);
              handleChange(isAdult, checked);
            }}
            className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <span className="text-slate-300 group-hover:text-slate-100 transition">
            Έχω διαβάσει και αποδέχομαι τους{" "}
            <a
              href="/terms"
              target="_blank"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              Όρους Χρήσης
            </a>{" "}
            και την{" "}
            <a
              href="/privacy"
              target="_blank"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              Πολιτική Απορρήτου
            </a>
            .
          </span>
        </label>
      </div>
    </div>
  );
}
