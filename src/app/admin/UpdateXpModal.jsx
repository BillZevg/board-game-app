"use client";

import { useState } from "react";
import { updateUserXPAction } from "@/lib/admin";

export default function UpdateXpModal({ userId, userName, currentXp }) {
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleXPChange = async (action) => {
    if (!amount || amount <= 0) return;
    setLoading(true);

    const res = await updateUserXPAction(userId, Number(amount), action);

    if (res.success) {
      alert(`Επιτυχής ενημέρωση! Νέα XP: ${res.newXp}`);
    } else {
      alert("Σφάλμα: ${res.error");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-white">{userName}</p>
        <p className="text-xs text-amber-400 font-mono">{currentXp}</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-20 bg-slate-950 border border-slate-700 text-white text-xs p-2 rounded-lg text-center"
          min="1"
        />

        {/* Κουμπί Προσθήκης */}
        <button
          onClick={() => handleXPChange("add")}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50"
        >
          + Πρόσθεσε
        </button>

        {/* Κουμπί Αφαίρεσης */}
        <button
          onClick={() => handleXPChange("remove")}
          disabled={loading}
          className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50"
        >
          - Αφαίρεσε
        </button>
      </div>
    </div>
  );
}
