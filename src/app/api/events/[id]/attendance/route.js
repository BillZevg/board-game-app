import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req, { params }) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: eventId } = await params;
    const { attendanceMap } = await req.json;
    // attendanceMap structure: { "participant_id_1": "ATTENDED", "participant_id_2": "NO_SHOW" }

    const hostUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: true },
    });

    if (!event || event.hostId !== hostUser?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ενημέρωση των status και των στατιστικών των χρηστών
    for (const [participantId, status] of Object.entries(attendanceMap)) {
      const participant = event.participants.find(
        (p) => p.id === participantId,
      );
      if (!participant) continue;

      // Ενημερώνουμε το participant status
      await prisma.participant.update({
        where: { id: participantId },
        data: { status },
      });

      // Ενημερώνουμε τα στατιστικά του παίκτη
      if (status === "NO_SHOW") {
        await prisma.user.update({
          where: { id: participant.userId },
          data: { attendedCount: { increment: 1 } },
        });
      }
    }

    revalidatePath(`/events/${eventId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendance Update Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
