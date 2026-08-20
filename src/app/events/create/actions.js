"use server";

import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { chatMessageSchema, eventSchema } from "@/lib/validations/schemas";
import { chatRateLimit, generalRateLimit } from "@/lib/ratelimit";

/**
 * Helper: Βρίσκει ή δημιουργεί τον χρήστη στη Βάση Δεδομένων.
 */
async function getOrCreateDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!dbUser) {
    const clerkUser = await currentUser();
    const name = clerkUser?.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
      : clerkUser?.username || "Gamer";

    try {
      dbUser = await prisma.user.create({
        data: {
          clerkId,
          email:
            clerkUser?.emailAddresses[0]?.emailAddress ||
            `${clerkId}@placeholder.com`,
          name,
          avatarUrl: clerkUser?.imageUrl || null,
        },
      });
    } catch (e) {
      // Αν δημιουργήθηκε ταυτόχρονα από άλλο request, το ξαναπαίρνουμε
      dbUser = await prisma.user.findUnique({ where: { clerkId } });
    }
  }

  return dbUser;
}

/**
 * Helper: Επαληθεύει την αποδοχή των όρων 18+
 */
function ensureTermsAccepted(dbUser) {
  if (!dbUser?.acceptedTerms) {
    throw new Error(
      "🔒 Πρέπει πρώτα να επιβεβαιώσετε ότι είστε άνω των 18 ετών και να αποδεχτείτε τους όρους στο Προφίλ σας!",
    );
  }
}

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

export async function createEvent(data) {
  try {
    const dbUser = await getOrCreateDbUser();

    if (!dbUser) {
      return { success: false, error: "Πρέπει να είστε συνδεδεμένοι." };
    }

    if (!dbUser.acceptedTerms) {
      return {
        success: false,
        error:
          "🔒 Πρέπει να δηλώσετε ότι είστε άνω των 18 ετών στο Προφίλ σας πριν δημιουργήσετε τραπέζι.",
      };
    }

    // 🛡️ 1. Rate Limiting Check
    const { success: rateLimitOk } = await generalRateLimit.limit(dbUser.id);
    if (!rateLimitOk) {
      return {
        success: false,
        error:
          "Δημιουργείτε τραπέζια πολύ γρήγορα. Παρακαλώ περιμένετε 1 λεπτό.",
      };
    }

    // Εξαγωγή δεδομένων
    const rawData = {
      title: (data.title || data.get?.("title"))?.toString().trim(),
      description:
        (data.description || data.get?.("description"))?.toString().trim() ||
        null,
      city: (data.city || data.get?.("city"))?.toString().trim() || "Αθήνα",
      address:
        (data.address || data.get?.("address"))?.toString().trim() || null,
      dateTime:
        data.dateTime || data.get?.("dateTime") || new Date().toISOString(),
      maxPlayers: parseInt(
        data.maxPlayers || data.get?.("maxPlayers") || 4,
        10,
      ),
    };

    // 🛡️ 2. Input Validation με Zod
    const validation = eventSchema.safeParse({
      title: rawData.title,
      description: rawData.description || "Χωρίς περιγραφή.",
      location: `${rawData.city}, ${rawData.address || ""}`.trim(),
      maxParticipants: rawData.maxPlayers,
      date: new Date(rawData.dateTime).toISOString(),
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const newEvent = await prisma.event.create({
      data: {
        title: rawData.title,
        description: rawData.description,
        city: rawData.city,
        address: rawData.address,
        dateTime: new Date(rawData.dateTime),
        maxPlayers: rawData.maxPlayers,
        locationType: "STORE",
        status: "OPEN",
        hostId: dbUser.id,
      },
    });

    revalidatePath("/");
    return { success: true, eventId: newEvent.id };
  } catch (error) {
    console.error("❌ Σφάλμα κατά τη δημιουργία event:", error);
    return { success: false, error: error.message };
  }
}

export async function sendChatMessage(eventId, text) {
  try {
    const dbUser = await getOrCreateDbUser();

    if (!dbUser) {
      return { success: false, error: "Μη εξουσιοδοτημένος χρήστης." };
    }

    if (!dbUser.acceptedTerms) {
      return {
        success: false,
        error:
          "🔒 Πρέπει να επιβεβαιώσετε τους όρους (18+) στο Προφίλ σας για να στείλετε μήνυμα.",
      };
    }

    // 🛡️ 1. Rate Limiting Check
    const { success: rateLimitOk } = await chatRateLimit.limit(dbUser.id);
    if (!rateLimitOk) {
      return {
        success: false,
        error: "Στέλνετε μηνύματα πολύ γρήγορα. Παρακαλώ περιμένετε λίγο.",
      };
    }

    // 🛡️ 2. Input Validation με Zod
    const validation = chatMessageSchema.safeParse({
      eventId,
      content: text,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const cleanData = validation.data;

    const newMessage = await prisma.chatMessage.create({
      data: {
        content: cleanData.content,
        eventId: cleanData.eventId,
        userId: dbUser.id,
      },
      include: {
        user: true,
      },
    });

    // 📡 Εκπομπή του νέου μηνύματος σε πραγματικό χρόνο μέσω Pusher
    try {
      await pusherServer.trigger(
        `event-${cleanData.eventId}`,
        "new-message",
        newMessage,
      );
    } catch (pusherError) {
      console.error("❌ Σφάλμα Pusher trigger:", pusherError);
    }

    revalidatePath(`/events/${cleanData.eventId}`);
    return { success: true, message: newMessage };
  } catch (error) {
    console.error("Σφάλμα κατά την αποστολή μηνύματος στο Chat:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleAttendance(eventId) {
  try {
    const dbUser = await getOrCreateDbUser();

    if (!dbUser) {
      return { success: false, error: "Πρέπει να είστε συνδεδεμένοι." };
    }

    ensureTermsAccepted(dbUser);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: true },
    });

    if (!event) {
      return { success: false, error: "Το event δεν βρέθηκε." };
    }

    const existingParticipant = event.participants.find(
      (p) => p.userId === dbUser.id,
    );

    if (existingParticipant) {
      await prisma.participant.delete({
        where: { id: existingParticipant.id },
      });
    } else {
      const acceptedCount = event.participants.filter(
        (p) => p.status === "ACCEPTED",
      ).length;

      const status = acceptedCount >= event.maxPlayers ? "WAITLIST" : "PENDING";

      await prisma.participant.create({
        data: {
          eventId: event.id,
          userId: dbUser.id,
          status: status,
        },
      });
    }

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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

    if (event.isCompleted || event.status === "COMPLETED") {
      return { success: false, error: "Το event έχει ήδη ολοκληρωθεί." };
    }

    const XP_REWARD = 100;

    const acceptedParticipantUserIds = event.participants
      .filter((p) => p.status === "ACCEPTED" && p.userId !== event.host.id)
      .map((p) => p.userId);

    await prisma.$transaction([
      prisma.event.update({
        where: { id: eventId },
        data: {
          isCompleted: true,
          status: "COMPLETED",
        },
      }),
      ...(acceptedParticipantUserIds.length > 0
        ? [
            prisma.user.updateMany({
              where: {
                id: { in: acceptedParticipantUserIds },
              },
              data: {
                xp: { increment: XP_REWARD },
              },
            }),
          ]
        : []),
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
