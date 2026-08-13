"use client";

import { useState } from "react";
import { toggleAttendance } from "@/app/events/create/actions"; // Βεβαιωθείτε ότι το path είναι σωστό για το δικό σας project

export default function JoinButton({ eventId, isAttending, isFull }) {
  // 👈 Προσθήκη του loading state
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      await toggleAttendance(eventId);
    } catch (error) {
      alert(error.message || "Κάτι πήγε στραβά!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || (!isAttending && isFull)}
      className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm transition ${
        isAttending
          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading
        ? "Επεξεργασία..."
        : isAttending
          ? "Ακύρωση Συμμετοχής"
          : isFull
            ? "Γεμάτο Event"
            : "Δήλωση Συμμετοχής"}
    </button>
  );
}
