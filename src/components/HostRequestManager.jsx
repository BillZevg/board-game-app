"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HostRequestManager({ eventId, pendingRequests }) {
  const [loadingId, setLoadingId] = useState(null);
  const router = useRouter();

  const handleAction = async (participantId, action) => {
    setLoadingId(participantId);

    try {
      const res = await fetch(`/api/events/${eventId}/request`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, action }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Αποτυχία ενημέρωσης αιτήματος.");
      }
    } catch (err) {
      console.error("Management action error:", err);
      alert("Σφάλμα σύνδεσης. Προσπαθήστε ξανά.");
    } finally {
      setLoadingId(null);
    }
  };

  if (!pendingRequests || pendingRequests.length === 0) return null;

  return (
    <div className="bg-purple-950/40 border border-pink-500/30 rounded-2xl p-5 mb-6 backdrop-blur-xl shadow-lg shadow-pink-950/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
        <h3 className="text-sm font-mono font-bold text-pink-200 uppercase tracking-wider">
          Εκκρεμή Αιτήματα Παικτών ({pendingRequests.length})
        </h3>
      </div>

      <div className="space-y-3">
        {pendingRequests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-purple-800/40"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-pink-500/40 bg-purple-900 shrink-0">
                {req.user?.avatarUrl ? (
                  <Image
                    src={req.user.avatarUrl}
                    alt={req.user.name || "Player"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-purple-200">
                    🎲
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {req.user?.name || "Άγνωστος Παίκτης"}
                </p>
                <p className="text-[10px] font-mono text-pink-300/80">
                  ⚡ {req.user?.xp || 0} XP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={loadingId === req.id}
                onClick={() => handleAction(req.id, "ACCEPT")}
                className="px-3 py-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900/80 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {loadingId === req.id ? "..." : "✓ Αποδοχή"}
              </button>
              <button
                disabled={loadingId === req.id}
                onClick={() => handleAction(req.id, "REJECT")}
                className="px-3 py-1.5 text-xs font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900/80 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {loadingId === req.id ? "..." : "✕ Απόρριψη"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
