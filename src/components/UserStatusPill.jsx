import Image from "next/image";
import { getUserRank } from "@/lib/badges";
import { getReliabilityScore } from "@/lib/reliability";

export default function UserStatusPill({ user, showRankTitle = true }) {
  const rank = getUserRank(user?.xp || 0);
  const reliability = getReliabilityScore(user);

  const tooltipText = reliability.isNew
    ? `Rank: ${rank.title} (${user?.xp || 0} XP) • Νέος Παίκτης (Χωρίς ιστορικό)`
    : `Rank: ${rank.title} (${user?.xp || 0} XP) • Attended: ${user?.attendedCount || 0} | No-shows: ${user?.noShowCount || 0}`;

  return (
    <div
      title={tooltipText}
      className="inline-flex items-center gap-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition px-2.5 py-1 rounded-full text-[11px] font-mono leading-none shrink-0"
    >
      {/* --- RANK SECTION --- */}
      <div className="flex items-center gap-1.5" title={`Rank: ${rank.title}`}>
        <div className="relative w-3.5 h-3.5 shrink-0 flex items-center justify-center">
          <Image
            src={rank.icon}
            alt={rank.title}
            fill
            className="w-full h-full object-contain filter drop-shadow block max-w-none"
          />
        </div>
        {showRankTitle && (
          <span className={`font-semibold ${rank.color.split(" ")[0]}`}>
            {rank.title}
          </span>
        )}
      </div>

      {/* Separator */}
      <span className="text-slate-700 font-sans select-none">|</span>

      {/* --- RELIABILITY SECTION --- */}
      <div
        className={`flex items-center gap-1 font-bold ${reliability.color.split(" ")[0]}`}
      >
        <span className="text-[10px]">🌱</span>
        <span>
          {reliability.isNew ? reliability.label : `${reliability.score}%`}
        </span>
      </div>
    </div>
  );
}
