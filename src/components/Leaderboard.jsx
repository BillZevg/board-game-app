import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserRank } from "@/lib/badges";
import Image from "next/image";

export default async function Leaderboard() {
  const { userId: clerkId } = await auth();

  // Φέρνουμε τους Top 10 παίκτες βάσει XP
  const topPlayers = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: 10,
    select: {
      id: true,
      clerkId: true,
      name: true,
      xp: true,
    },
  });

  return (
    <aside className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <span className="text-amber-400">🏆</span> Top Players
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          XP Leaderboard
        </span>
      </div>

      <div className="space-y-2">
        {topPlayers.map((player, index) => {
          const playerRank = getUserRank(player.xp);
          const isCurrentUser = player.clerkId === clerkId;

          // 🥇 🥈 🥉 Μετάλλια για τους 3 πρώτους & αριθμούς για τους υπόλοιπους
          let rankVisual = null;
          let cardStyle =
            "bg-slate-950/50 border-slate-800/80 hover:border-slate-700";

          if (index === 0) {
            rankVisual = <span className="text-lg filter drop-shadow">🥇</span>;
            cardStyle =
              "bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-950/30";
          } else if (index === 1) {
            rankVisual = <span className="text-lg filter drop-shadow">🥈</span>;
            cardStyle = "bg-amber-800/30 border-amber-400/40";
          } else if (index === 2) {
            rankVisual = <span className="text-lg filter drop-shadow">🥉</span>;
            cardStyle = "bg-amber-900/10 border-amber-700/40";
          } else {
            rankVisual = (
              <span className="w-5 text-center font-mono text-[11px] text-slate-500 font-bold">
                #{index + 1}
              </span>
            );
          }

          // Highlight αν είναι ο συνδεδεμένος χρήστης
          if (isCurrentUser) {
            cardStyle =
              "bg-purple-950/40 border-purple-500/60 shadow-md shadow-purple-950/50";
          }

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${cardStyle}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Rank Visual / Medal */}
                <div className="shrink-0 flex items-center justify-center">
                  {rankVisual}
                </div>

                {/* Rank Icon */}
                <div className="w-5 h-5 shrink-0 relative">
                  <Image
                    src={playerRank.icon}
                    alt={playerRank.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Player Name & Rank Title */}
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isCurrentUser ? "text-purple-300" : "text-slate-200"
                    }`}
                  >
                    {player.name || "Unknown Player"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {playerRank.title}
                  </p>
                </div>
              </div>

              {/* XP Badge */}
              <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-900/40">
                {player.xp} XP
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
