export function getReliabilityScore(user) {
  const attended = user?.attendedCount || 0;
  const noShows = user?.noShowCount || 0;
  const lateCancels = user?.lateCancelCount || 0;

  const total = attended + noShows + lateCancels;

  // Για νέους χρήστες χωρίς ιστορικό
  if (total === 0) {
    return {
      score: 100,
      label: "New Adventurer",
      color: "text-slate-400 border-slate-700 bg-slate-800/80",
      isNew: true,
      totalSessions: 0,
    };
  }

  // Υπολογισμός ποινών (1.0 για No-Show, 0.5 για Late Cancellation)
  const penalties = noShows * 1.0 + lateCancels * 0.5;

  // Formula: (Attended / (Attended + Penalties)) * 100
  const denominator = attended + penalties;
  const rawScore = denominator > 0 ? (attended / denominator) * 100 : 0;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let label = "High Reliability";
  let color = "text-emerald-400 border-emerald-800 bg-emerald-950/80";

  if (score < 70) {
    label = "Unreliable";
    color = "text-red-400 border-red-800 bg-red-950/80";
  } else if (score < 85) {
    label = "Moderate Risk";
    color = "text-amber-400 border-amber-800 bg-amber-950/80";
  }

  return {
    score,
    label,
    color,
    isNew: false,
    totalSessions: total,
  };
}
