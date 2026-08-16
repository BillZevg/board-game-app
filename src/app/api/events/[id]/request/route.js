import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getDbUser(clerkUser) {
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    "Adventurer";

  return await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {},
    create: {
      clerkId: clerkUser.id,
      email: email,
      name: name,
      avatarUrl: clerkUser.imageUrl || null,
    },
  });
}

// 1. Αίτημα Συμμετοχής ή Είσοδος στη Waitlist (POST)
export async function POST(req, { params }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;

    const dbUser = await getDbUser(clerkUser);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Υπολογισμός εγκεκριμένων παικτών
    const acceptedCount = event.participants.filter(
      (p) => p.status === "ACCEPTED",
    ).length;

    // Καθορισμός Status: Αν είναι γεμάτο -> WAITLIST, αλλιώς -> PENDING
    const isFull = acceptedCount >= event.maxPlayers;
    const initialStatus = isFull ? "WAITLIST" : "PENDING";

    const participant = await prisma.participant.create({
      data: {
        eventId,
        userId: dbUser.id,
        status: initialStatus,
      },
    });

    revalidatePath(`/events/${eventId}`);

    return NextResponse.json({
      success: true,
      participant,
      isWaitlisted: isFull,
    });
  } catch (error) {
    console.error("Join/Waitlist Request Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// 2. Αποδοχή / Απόρριψη από Host (PATCH)
export async function PATCH(req, { params }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const { participantId, action } = await req.json();

    const dbUser = await getDbUser(clerkUser);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: true },
    });

    if (!event || event.hostId !== dbUser?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const updatedParticipant = await prisma.participant.update({
      where: { id: participantId },
      data: { status: newStatus },
    });

    revalidatePath(`/events/${eventId}`);

    return NextResponse.json({ success: true, updatedParticipant });
  } catch (error) {
    console.error("PATCH Request Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 3. Ακύρωση / Αποχώρηση (DELETE) -> Αυτόματη προώθηση από Waitlist!
export async function DELETE(req, { params }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const dbUser = await getDbUser(clerkUser);

    // Βρίσκουμε τη συμμετοχή του χρήστη
    const existingParticipant = await prisma.participant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: dbUser.id,
        },
      },
      include: {
        event: {
          select: { dateTime: true },
        },
      },
    });

    if (!existingParticipant) {
      return NextResponse.json(
        { error: "Participation not found" },
        { status: 404 },
      );
    }

    const wasAccepted = existingParticipant.status === "ACCEPTED";

    // Έλεγχος Late Cancellation ( Λιγότερο από 3 ώρες πριν το event)
    if (wasAccepted) {
      const now = new Date();
      const eventTime = new Date(existingParticipant.event.dateTime);
      const hoursDifference = (eventTime - now) / (1000 * 60 * 60);

      // Αν το event είναι σε λιγότερο από 3 ώρες ( και δεν έχει περάσει ήδη)
      if (hoursDifference > 0 && hoursDifference < 3) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            lateCancelCount: { increment: 1 },
          },
        });
      }
    }

    // Διαγραφή συμμετοχής
    await prisma.participant.delete({
      where: { id: existingParticipant.id },
    });

    // ⚡ ΑΥΤΟΜΑΤΙΣΜΟΣ WAITLIST:
    // Αν ο χρήστης που έφυγε ήταν ACCEPTED, προωθούμε τον 1ο της Waitlist!
    if (wasAccepted) {
      const oldestWaitlisted = await prisma.participant.findFirst({
        where: {
          eventId,
          status: "WAITLIST",
        },
        orderBy: { createdAt: "asc" }, // Ο πρώτος που μπήκε στη λίστα
      });

      if (oldestWaitlisted) {
        // Προαγωγή σε ACCEPTED (ή PENDING αν θέλεις να τον εγκρίνει ο host)
        await prisma.participant.update({
          where: { id: oldestWaitlisted.id },
          data: { status: "ACCEPTED" },
        });
      }
    }

    revalidatePath(`/events/${eventId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave Event Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
