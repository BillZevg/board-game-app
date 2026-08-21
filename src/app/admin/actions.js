"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper για έλεγχο Admin
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

// 1. Διαγραφή Κακόβουλου Event
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

// 2. Ban / Unban Χρήστη
export async function toggleUserBanAction(targetUserId, isBanned) {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("❌ Σφάλμα αλλαγής ban status:", error);
    return { success: false, error: error.message };
  }
}

// 3. Επίλυση/Αλλαγή Status σε Report
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
