"use server";

import { prisma } from "./prisma";
import { getUserRank } from "./badges";

// Επιστρέφει τους top players εμπλουτισμένους με το Rank/Badge τους
export async function getTopPlayers(limit = 10) {
  try {
    const topUsers = await prisma.user.findMany({
      take: limit,
      orderBy: {
        xp: "desc",
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        xp: true,
        attendedCount: true,
      },
    });

    // Εμπλουτισμός κάθε χρήστη με το Rank & Badge του από το badges.js
    const playersWithRanks = topUsers.map((user, index) => {
      const rank = getUserRank(user.xp || 0);
      return {
        ...user,
        position: index + 1,
        rank, // Περιλαμβάνει title, icon, raritty, color
      };
    });

    return playersWithRanks;
  } catch (error) {
    console.error("❌ Σφάλμα ανάκτησης top players:", error);
  }
}
