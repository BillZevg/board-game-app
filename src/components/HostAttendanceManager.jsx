"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HostAttendanceManager({
  eventId,
  acceptedParticipants,
}) {
  const [attendance, setAttendance] = useState(() => {
    const initial = {};
    acceptedParticipants.forEach((p) => {
      initial[p.id] = p.status === "NO_SHOW" ? "NO_SHOW" : "ATTENDED";
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = (id) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === "ATTENDED" ? "NO_SHOW" : "ATTENDED",
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceMap: attendance }),
      });

      if (res.ok) {
        alert("Η παρουσία των παικτών ενημερώθηκε επιτυχώς!");
        router.refresh();
      } else {
        alert("Σφάλμα κατά την αποθήκευση");
      }
    } catch (err) {
      console.error(err);
      alert("Σφάλμα σύνδεσης");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-mono font-bold text-amber-400 text-sm flex items-center gap-2">
          <span>📋</span> Αναφορά Παρουσιών (Host Control)
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Session Completed
        </span>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        Σημείωσε ποιοι παίκτες εμφανίστηκαν στο τραπέζι. Όσοι σημειωθούν ως
        No-Show θα επηρεαστεί το Reliability Score τους.
      </p>

      <div className="space-y-2">
        {acceptedParticipants.map((p) => {
          const isAttended = attendance[p.id] === "ATTENDED";
          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl"
            >
              <span className="text-xs font-bold text-slate-200">
                {p.user?.name || "Παίκτης"}
              </span>
              <button
                onClick={() => toggleStatus(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  isAttended
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "bg-red-950 text-red-400 border border-red-800"
                }`}
              >
                {isAttended ? "✓ Εμφανίστηκε" : "✕ No-Show"}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold rounded-xl transition"
      >
        {loading ? "Αποθήκευση..." : "💾 Οριστικοποίηση Παρουσιών"}
      </button>
    </div>
  );
}
