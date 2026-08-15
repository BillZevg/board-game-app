"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Helper: Βρίσκει ή δημιουργεί τον χρήστη στη βάση (Prisma Sync)
 */
async function getOrCreateDbUser() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();

  if (!clerkId) return null;

  return await prisma.user.upsert({
    where: { clerkId },
    update: {
      name: clerkUser?.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : clerkUser?.username || "Gamer",
      avatarUrl: clerkUser?.imageUrl || null,
    },
    create: {
      clerkId,
      email:
        clerkUser?.emailAddresses[0]?.emailAddress ||
        `${clerkId}@placeholder.com`,
      name: clerkUser?.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : clerkUser?.username || "Gamer",
      avatarUrl: clerkUser?.imageUrl || null,
    },
  });
}

/**
 * Helper Check: Ελέγχει αν ο χρήστης έχει επιβεβαιώσει τους όρους & ηλικία (18+)
 */
function ensureTermsAccepted(dbUser) {
  if (!dbUser?.acceptedTerms) {
    throw new Error(
      "🔒 Πρέπει πρώτα να επιβεβαιώσετε ότι είστε άνω των 18 ετών και να αποδεχτείτε τους όρους στο Προφίλ σας!",
    );
  }
}

/**
 * 🆕 0. Αποδοχή Όρων Χρήσης & Επιβεβαίωση Ηλικίας (18+)
 * (Καλέιται από το ProfileTermsBox.jsx)
 */
export async function acceptTermsAction() {
  try {
    const dbUser = await getOrCreateDbUser();

    if (!dbUser) {
      return { success: false, error: "Μη εξουσιοδοτημένος χρήστης." };
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { acceptedTerms: true },
    });

    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ Σφάλμα κατά την αποδοχή των όρων:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 1. Δημιουργία Νέου Event / Τραπεζιού
 */
export async function createEvent(data) {
  try {
    const dbUser = await getOrCreateDbUser();

    if (!dbUser) {
      return { success: false, error: "Πρέπει να είστε συνδεδεμένοι." };
    }

    // 🛡️ Gatekeeper Check: Επιβεβαίωση Όρων & Ηλικίας 18+
    if (!dbUser.acceptedTerms) {
      return {
        success: false,
        error:
          "🔒 Πρέπει να δηλώσετε ότι είστε άνω των 18 ετών στο Προφίλ σας πριν δημιουργήσετε τραπέζι.",
      };
    }

    // Διαχείριση δεδομένων είτε έρχονται από FormData είτε από JS Object
    const title = (data.title || data.get?.("title"))?.toString().trim();
    const description =
      (data.description || data.get?.("description"))?.toString().trim() ||
      null;
    const city =
      (data.city || data.get?.("city"))?.toString().trim() || "Αθήνα"; // Required στο Schema
    const address =
      (data.address || data.get?.("address"))?.toString().trim() || null;
    const rawDateTime = data.dateTime || data.get?.("dateTime");
    const dateTime = rawDateTime ? new Date(rawDateTime) : new Date();
    const maxPlayers = parseInt(
      data.maxPlayers || data.get?.("maxPlayers") || 4,
      10,
    );

    if (!title) {
      return { success: false, error: "Ο τίτλος είναι υποχρεωτικός." };
    }

    // Δημιουργία εγγραφής στη βάση
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        city,
        address,
        dateTime,
        maxPlayers,
        locationType: "STORE", // Enum βάσει schema.prisma
        status: "OPEN",
        hostId: dbUser.id,
      },
    });

    // Ακύρωση του cache για να εμφανιστεί αμέσως στην αρχική σελίδα
    revalidatePath("/");
    return { success: true, eventId: newEvent.id };
  } catch (error) {
    console.error("❌ Σφάλμα κατά τη δημιουργία event:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Αποστολή μηνύματος στο Tavern Chat
 */
export async function sendChatMessage(eventId, text) {
  try {
    const dbUser = await getOrCreateDbUser();

    if (!dbUser) {
      console.error(" ❌ Chat Error: Ο χρήστης δεν είναι συνδεδεμένος.");
      return { success: false, error: "Unauthorized" };
    }

    // 🛡️ Gatekeeper Check: Επιβεβαίωση Όρων & Ηλικίας 18+
    if (!dbUser.acceptedTerms) {
      return {
        success: false,
        error:
          "🔒 Πρέπει να επιβεβαιώσετε τους όρους (18+) στο Προφίλ σας για να στείλετε μήνυμα.",
      };
    }

    if (!text || text.trim() === "") {
      return { success: false, error: "Empty message" };
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        content: text.trim(),
        eventId: eventId,
        userId: dbUser.id,
      },
      include: {
        user: true,
      },
    });

    revalidatePath(`/events/${eventId}`);
    return { success: true, message: newMessage };
  } catch (error) {
    console.error("Σφάλμα κατά την αποστολή μηνύματος στο Chat:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Συμμετοχή / Αποχώρηση από Event (Toggle Attendance)
 */
export async function toggleAttendance(eventId) {
  const dbUser = await getOrCreateDbUser();

  if (!dbUser) {
    throw new Error("Πρέπει να είστε συνδεδεμένοι για να συμμετάσχετε.");
  }

  // 🛡️ Gatekeeper Check: Επιβεβαίωση Όρων & Ηλικίας 18+
  ensureTermsAccepted(dbUser);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participants: true },
  });

  if (!event) {
    throw new Error("Το event δεν βρέθηκε.");
  }

  const existingParticipant = event.participants.find(
    (p) => p.userId === dbUser.id,
  );

  if (existingParticipant) {
    await prisma.participant.delete({
      where: { id: existingParticipant.id },
    });
  } else {
    if (event.participants.length >= event.maxPlayers) {
      throw new Error("Το event είναι πλέον πλήρες.");
    }

    await prisma.participant.create({
      data: {
        eventId: event.id,
        userId: dbUser.id,
      },
    });
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/");
  return { success: true };
}

/**
 * 4. Διαγραφή Event από τον Host
 */
export async function deleteEvent(eventId) {
  if (!eventId) {
    throw new Error("Δεν παρείχατε έγκυρο Event ID για διαγραφή.");
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Δεν έχετε δικαίωμα πρόσβασης.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { host: true },
  });

  if (!event) {
    throw new Error("Το event δεν βρέθηκε.");
  }

  if (event.host.clerkId !== clerkId) {
    throw new Error("Μόνο ο διοργανωτής μπορεί να διαγράψει το event.");
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  revalidatePath("/");
  redirect("/");
}

/**
 * 5. Ολοκλήρωση Event από τον Host & Απονομή XP
 */
export async function completeEvent(eventId) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { success: false, error: "Μη εξουσιοδοτημένος χρήστης." };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        host: true,
        participants: true,
      },
    });

    if (!event) {
      return { success: false, error: "Το event δεν βρέθηκε." };
    }

    if (event.host.clerkId !== clerkId) {
      return {
        success: false,
        error: "Μόνο ο Host μπορεί να ολοκληρώσει το event.",
      };
    }

    if (event.isCompleted) {
      return { success: false, error: "Το event έχει ήδη ολοκληρωθεί." };
    }

    const XP_REWARD = 100;
    const participantUserIds = event.participants.map((p) => p.userId);

    await prisma.$transaction([
      prisma.event.update({
        where: { id: eventId },
        data: { isCompleted: true },
      }),
      prisma.user.updateMany({
        where: {
          id: { in: participantUserIds },
        },
        data: {
          xp: { increment: XP_REWARD },
        },
      }),
      prisma.user.update({
        where: { id: event.host.id },
        data: {
          xp: { increment: XP_REWARD },
        },
      }),
    ]);

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Σφάλμα κατά την ολοκλήρωση του event:", error);
    return { success: false, error: error.message };
  }
}
