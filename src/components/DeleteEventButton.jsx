"use client";

import { useTransition } from "react";

export default function DeleteEventButton({ eventId, deleteAction }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το event;")) {
      startTransition(async () => {
        // ✅ Πέρνα το eventId ως όρισμα
        await deleteAction(eventId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-mono text-xs font-bold transition disabled:opacity-50"
    >
      {isPending ? "Διαγραφή..." : "🗑️ Διαγραφή"}
    </button>
  );
}
