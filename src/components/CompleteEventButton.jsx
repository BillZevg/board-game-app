"use client";

import { useTransition, useState } from "react";

export default function CompleteEventButton({
  eventId,
  isCompleted = false,
  completeAction,
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(isCompleted);

  // Αν έχει ολοκληρωθεί, δείξε μόνο το Badge
  if (done) {
    return (
      <span className="px-3 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
        🏆 Ολοκληρώθηκε
      </span>
    );
  }

  const handleComplete = () => {
    if (
      confirm(
        "Είστε σίγουροι ότι θέλετε να σημειώσετε το Event ως Ολοκληρωμένο;",
      )
    ) {
      startTransition(async () => {
        const res = await completeAction(eventId);
        if (res?.success) {
          setDone(true);
        } else if (res?.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      className="px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl font-mono text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
    >
      <span>🏁</span> {isPending ? "Ενημέρωση..." : "Ολοκλήρωση Event"}
    </button>
  );
}
