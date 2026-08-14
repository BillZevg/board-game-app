"use client";

import { useState } from "react";

export default function DateTimePicker({ name = "dateTime", required = true }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");

  // Συνδυάζουμε ημερομηνία & ώρα σε ISO string για το backend
  const combinedISO =
    date && time ? new Date(`${date}T${time}`).toISOString() : "";

  return (
    <div className="space-y-2">
      <input
        type="hidden"
        name={name}
        value={combinedISO}
        required={required}
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          required={required}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500 [color-scheme:dark] cursor-pointer"
        />
        <input
          type="time"
          required={required}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500 [color-scheme:dark] cursor-pointer"
        />
      </div>
    </div>
  );
}
