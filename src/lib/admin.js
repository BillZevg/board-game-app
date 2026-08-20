"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🛡️ Helper για έλεγχο δικαιωμάτων Admin
async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Δεν έχετε δικαιώματα διαχειριστή.");
  }

  return userId;
}

// 1. 🗑️ Οριστική Διαγραφή Event από Admin
export async function deleteEventAdminAction(eventId) {
  try {
    await requireAdmin();

    await prisma.event.delete({
      where: { id: eventId },
    });

    revalidatePath("/admin");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("❌ Σφάλμα διαγραφής event:", error);
    return { success: false, error: error.message };
  }
}

// 2. 🚫 Ακύρωση Event (Αλλάζει το status σε CANCELLED & στέλνει ειδοποιήσεις)
export async function cancelEventAction(eventId) {
  try {
    await requireAdmin();

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status: "CANCELLED" },
    });

    // 🔔 Ειδοποίηση συμμετεχόντων
    const participants = await prisma.participant.findMany({
      where: { eventId, status: "ACCEPTED" },
    });

    for (const p of participants) {
      await prisma.notification.create({
        data: {
          userId: p.userId,
          title: "Ακύρωση Event 🚫",
          message: `Το event "${updatedEvent.title}" ακυρώθηκε από το διαχειριστή.`,
          type: "EVENT_CANCELLED",
        },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Σφάλμα ακύρωσης event:", error);
    return { success: false, error: error.message };
  }
}

// 3. ⚡ Αφαίρεση / Προσθήκη XP & Ενημέρωση Leaderboard
export async function updateUserXPAction(
  targetUserId,
  xpAmount,
  action = "remove",
) {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new Error("Ο χρήστης δεν βρέθηκε.");

    // Υπολογισμός νέων XP (κατώτατο όριο το 0)
    const newXp =
      action === "remove"
        ? Math.max(0, user.xp - xpAmount)
        : user.xp + xpAmount;

    await prisma.user.update({
      where: { id: targetUserId },
      data: { xp: newXp },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, newXp };
  } catch (error) {
    console.error("❌ Σφάλμα ενημέρωσης XP:", error);
    return { success: false, error: error.message };
  }
}

// 4. 🚩 Επίλυση / Αλλαγή Status σε Report
export async function resolveReportAction(reportId, status) {
  try {
    await requireAdmin();

    await prisma.report.update({
      where: { id: reportId },
      data: { status }, // "RESOLVED" | "DISMISSED"
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("❌ Σφάλμα ενημέρωσης report:", error);
    return { success: false, error: error.message };
  }
}
