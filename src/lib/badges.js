// src/lib/badges.js

export const RANKS = [
  {
    minXp: 0,
    title: "Wandering Peasant",
    icon: "/badges/peasant.png",
    rarity: "Common",
    color: "text-slate-400 border-slate-700 bg-slate-900/60 shadow-none",
  },
  {
    minXp: 50,
    title: "Tavern Recruit",
    icon: "/badges/recruit.png",
    rarity: "Common",
    color: "text-amber-200/80 border-amber-900/50 bg-amber-950/30",
  },
  {
    minXp: 150,
    title: "Fledgling Adventurer",
    icon: "/badges/adventurer.png",
    rarity: "Uncommon",
    color:
      "text-emerald-400 border-emerald-700/60 bg-emerald-950/40 shadow-emerald-950/50",
  },
  {
    minXp: 300,
    title: "Shieldbearer of the Realm",
    icon: "/badges/shield.png", // 👈 Η νέα σου ασπίδα!
    rarity: "Uncommon",
    color:
      "text-cyan-300 border-cyan-500/80 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold",
  },
  {
    minXp: 500,
    title: "Dungeon Crawler",
    icon: "/badges/dungeon.png",
    rarity: "Rare",
    color: "text-blue-400 border-blue-600/60 bg-blue-950/50 shadow-blue-900/30",
  },
  {
    minXp: 800,
    title: "Guild Veteran",
    icon: "/badges/veteran.png",
    rarity: "Rare",
    color:
      "text-indigo-400 border-indigo-600/60 bg-indigo-950/50 shadow-indigo-900/30",
  },
  {
    minXp: 1200,
    title: "Arcane Strategist",
    icon: "/badges/strategist.png",
    rarity: "Epic",
    color:
      "text-purple-400 border-purple-500/60 bg-purple-950/60 shadow-purple-900/40 font-semibold",
  },
  {
    minXp: 1800,
    title: "High Warlord",
    icon: "/badges/warlord.png",
    rarity: "Epic",
    color:
      "text-pink-400 border-pink-500/60 bg-pink-950/60 shadow-pink-900/40 font-semibold",
  },
  {
    minXp: 2500,
    title: "Dragon Slayer",
    icon: "/badges/dragon.png",
    rarity: "Legendary",
    color:
      "text-amber-400 border-amber-500/80 bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-black animate-pulse",
  },
  {
    minXp: 4000,
    title: "Mythic Overlord",
    icon: "/badges/king.png",
    rarity: "Mythic",
    color:
      "text-rose-300 border-rose-500/90 bg-gradient-to-r from-rose-950 via-purple-950 to-slate-950 shadow-[0_0_20px_rgba(244,63,94,0.4)] font-black tracking-wide",
  },
];

/**
 * Επιστρέφει το Rank & Badge του χρήστη βάσει των XP του.
 */
export function getUserRank(xp = 0) {
  let currentRank = RANKS[0];

  for (const rank of RANKS) {
    if (xp >= rank.minXp) {
      currentRank = rank;
    } else {
      break;
    }
  }

  return currentRank;
}
