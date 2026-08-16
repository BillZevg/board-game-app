"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({ eventId, userStatus, isFull }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Αίτημα Συμμετοχής / Είσοδος στη Waitlist
  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/request`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Σφάλμα κατά την αποστολή αιτήματος.");
      }
    } catch (err) {
      console.error(err);
      alert("Σφάλμα σύνδεσης.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Αποχώρηση / Ακύρωση Αιτήματος
  const handleLeave = async () => {
    if (!confirm("Είστε σίγουροι ότι θέλετε να ακυρώσετε τη συμμετοχή σας;")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/request`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Σφάλμα ακύρωσης.");
      }
    } catch (err) {
      console.error(err);
      alert("Σφάλμα σύνδεσης.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERING ΒΑΣΕΙ STATUS ---

  if (userStatus === "ACCEPTED") {
    return (
      <div className="flex items-center gap-3">
        <span className="px-3 py-2 bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-xs font-bold rounded-xl">
          ✓ Εγκεκριμένος Παίκτης
        </span>
        <button
          onClick={handleLeave}
          disabled={loading}
          className="px-3 py-2 bg-slate-800 hover:bg-red-950/80 hover:text-red-400 border border-slate-700 rounded-xl font-mono text-xs text-slate-400 transition"
        >
          {loading ? "..." : "Αποχώρηση"}
        </button>
      </div>
    );
  }

  if (userStatus === "PENDING") {
    return (
      <div className="flex items-center gap-3">
        <span className="px-3 py-2 bg-amber-950/80 border border-amber-800 text-amber-400 font-mono text-xs font-bold rounded-xl">
          ⏳ Αίτημα σε αναμονή
        </span>
        <button
          onClick={handleLeave}
          disabled={loading}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-mono text-xs text-slate-300 transition"
        >
          {loading ? "..." : "Ακύρωση"}
        </button>
      </div>
    );
  }

  if (userStatus === "WAITLIST") {
    return (
      <div className="flex items-center gap-3">
        <span className="px-3 py-2 bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5">
          <span>📋</span> Στη Λίστα Αναμονής
        </span>
        <button
          onClick={handleLeave}
          disabled={loading}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-mono text-xs text-slate-300 transition"
        >
          {loading ? "..." : "Έξοδος από Λίστα"}
        </button>
      </div>
    );
  }

  if (userStatus === "REJECTED") {
    return (
      <span className="px-3 py-2 bg-red-950/80 border border-red-800 text-red-400 font-mono text-xs font-bold rounded-xl">
        ✕ Το αίτημα απορρίφθηκε
      </span>
    );
  }

  // Αρχικό Κουμπί (αν το τραπέζι είναι γεμάτο, εμφανίζεται ως "Μπες στη Waitlist")
  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className={`px-5 py-2.5 font-mono text-xs font-bold rounded-xl transition shadow-lg ${
        isFull
          ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40"
          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40"
      }`}
    >
      {loading
        ? "Επεξεργασία..."
        : isFull
          ? "📋 Μπες στη Λίστα Αναμονής"
          : "⚔️ Αίτημα Συμμετοχής"}
    </button>
  );
}
