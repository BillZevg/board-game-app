import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(req) {
  try {
    // 🛡️ 1. Έλεγχος Ασφάλειας για το Cron Job
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // 🗓️ Υπολογισμός αυριανής ημέρας
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // 🔍 2. Ανάκτηση των αυριανών Events (Διόρθωση: prisma.event αντί για prisma.session)
    const upcomingEvents = await prisma.event.findMany({
      where: {
        dateTime: {
          // Διόρθωση: dateTime αντί για date
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    let emailsSent = 0;

    // 📧 3. Αποστολή Emails
    for (const event of upcomingEvents) {
      for (const participant of event.participants) {
        if (!participant.user?.email) continue;

        try {
          await resend.emails.send({
            from: "BoardConnect <onboarding@resend.dev>",
            to: "bzevgitis@gmail.com", // ⚠️ Για testing mode
            subject: `⏰ Υπενθύμιση: Το event "${event.title}" ξεκινάει αύριο!`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #9333ea;">🎲 Ετοιμάσου για παιχνίδι!</h2>
                <p>Γεια σου <strong>${participant.user.name || "Gamer"}</strong>,</p>
                <p>Το event <strong>${event.title}</strong> είναι προγραμματισμένο για αύριο στις <strong>${new Date(event.dateTime).toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" })}</strong>.</p>
                <br />
                <a href="https://board-game-app-five.vercel.app/events/${event.id}" style="background-color: #ec4899; color: white; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Δες τις λεπτομέρειες του event
                </a>
              </div>
            `,
          });

          emailsSent++;
          await delay(500); // Όριο 2 req/sec για το Resend
        } catch (emailError) {
          console.error(
            `❌ Σφάλμα αποστολής email στον χρήστη ${participant.user.email}:`,
            emailError,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedEvents: upcomingEvents.length,
      emailsSent,
    });
  } catch (error) {
    console.error("❌ Σφάλμα Cron Job:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
