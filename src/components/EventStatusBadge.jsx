export function EventStatusBadge({ eventDate, durationInHours = 3 }) {
  const now = new Date();
  const start = new Date(eventDate);
  // Υπολογίζουμε τη λήξη προσθέτοντας τις ώρες διάρκειας (π.χ. 3 ώρες default)
  const end = new Date(start.getTime() + durationInHours * 60 * 60 * 1000);

  // 🏁 1. Το παιχνίδι ΤΕΛΕΙΩΣΕ
  if (now > end) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800/80 text-slate-400 border border-slate-700">
        <span>🏁</span> Ολοκληρώθηκε
      </span>
    );
  }

  // 🔴 2. Το παιχνίδι ΠΑΙΖΕΤΑΙ ΤΩΡΑ (LIVE)
  if (now >= start && now <= end) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-950/80 text-red-400 border border-red-800 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        🔴 Σε Εξέλιξη (LIVE)
      </span>
    );
  }

  // 🟢 3. Το παιχνίδι ΕΡΧΕΤΑΙ
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
      <span>⏳</span> Προγραμματισμένο
    </span>
  );
}
