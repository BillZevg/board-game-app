"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 1. Αποστολή μηνύματος στο Tavern Chat
 */
export async function sendChatMessage(eventId, text) {
  const { userId: clerkId } = await auth();
  if (!clerkId || !text?.trim()) return null;

  // Βρίσκουμε τον χρήστη στη βάση δεδομένων
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) return null;

  // Δημιουργία του μηνύματος
  const newMessage = await prisma.chatMessage.create({
    data: {
      text: text.trim(),
      eventId,
      userId: user.id,
    },
    include: {
      user: true,
    },
  });

  revalidatePath(`/events/${eventId}`);
  return newMessage;
}

/**
 * 2. Συμμετοχή / Αποχώρηση από Event (Toggle Attendance)
 */
export async function toggleAttendance(eventId) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("Πρέπει να είστε συνδεδεμένοι για να συμμετάσχετε.");
  }

  // Βρίσκουμε τον χρήστη στη βάση δεδομένων
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error("Ο χρήστης δεν βρέθηκε στη βάση δεδομένων.");
  }

  // Φέρνουμε το event μαζί με τους τωρινούς συμμετέχοντες
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participants: true },
  });

  if (!event) {
    throw new Error("Το event δεν βρέθηκε.");
  }

  // Έλεγχος αν ο χρήστης συμμετέχει ήδη
  const existingParticipant = event.participants.find(
    (p) => p.userId === user.id,
  );

  if (existingParticipant) {
    // Αν συμμετέχει -> Αποχώρηση (Delete)
    await prisma.participant.delete({
      where: { id: existingParticipant.id },
    });
  } else {
    // Έλεγχος πληρότητας αν πάει να γραφτεί
    if (event.participants.length >= event.maxPlayers) {
      throw new Error("Το event είναι πλέον πλήρες.");
    }

    // Αν δεν συμμετέχει -> Εγγραφή (Create)
    await prisma.participant.create({
      data: {
        eventId: event.id,
        userId: user.id,
      },
    });
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/");
  return { success: true };
}

/**
 * 3. Διαγραφή Event από τον Host
 */
export async function deleteEvent(eventId) {
  // Έλεγχος αν το eventId είναι έγκυρο
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
