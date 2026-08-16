import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import DatePicker from "@/components/DateTimePicker";
import CreateEventForm from "@/components/CreateEventForm";

export default async function CreateEventPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  async function createEvent(formData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return;

    // 1. Βρίσκουμε ή δημιουργούμε τον χρήστη με βάση το ID
    const user = await prisma.user.upsert({
      where: { id: currentUserId },
      update: {
        clerkId: currentUserId,
      },
      create: {
        id: currentUserId,
        clerkId: currentUserId,
        email: `${currentUserId}@placeholder.com`,
        name: "Gamer",
      },
    });

    // 2. Ανακτώνται & Επαληθεύονται τα δεδομένα της φόρμας
    const title = formData.get("title");
    const description = formData.get("description") || "";
    const city = formData.get("city");
    const address = formData.get("location") || "";
    const rawDateTime = formData.get("dateTime");
    const rawMaxPlayers = formData.get("maxPlayers");

    const bggId = formData.get("bggId") || null;
    const bggImage = formData.get("bggImage") || null;

    const bggMinPlayers = formData.get("bggMinPlayers") || null;
    const bggMaxPlayers = formData.get("bggMaxPlayers") || null;
    const bggPlayingTime = formData.get("bggPlayingTime") || null;
    const bggMinAge = formData.get("bggMinAge") || null;
    const bggYearPublished = formData.get("bggYearPublished") || null;
    const bggGameTitle = formData.get("bggGameTitle") || null;

    if (!title || !city || !rawDateTime || !rawMaxPlayers) {
      throw new Error("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.");
    }

    const dateTime = new Date(rawDateTime);
    const maxPlayers = parseInt(rawMaxPlayers, 10);

    if (isNaN(dateTime.getTime())) {
      throw new Error("Μη έγκυρη ημερομηνία.");
    }

    if (isNaN(maxPlayers) || maxPlayers < 2) {
      throw new Error("Ο αριθμός παικτών πρέπει να είναι τουλάχιστον 2.");
    }

    let gameId = null;

    // Αν επιλέχθηκε παιχνιδι απο BGG, βρες ή δημιούργησε το Game
    if (bggId) {
      const existingGame = await prisma.game.findFirst({
        where: { bggId: parseInt(bggId) },
      });

      if (existingGame) {
        gameId = existingGame.id;
        // Ενημέρωσε την εικόνα αν δεν υπάρχει
        if (!existingGame.imageUrl && bggImage) {
          await prisma.game.update({
            where: { id: existingGame.id },
            data: { imageUrl: bggImage },
          });
        }
      } else {
        const newGame = await prisma.game.create({
          data: {
            bggId: parseInt(bggId),
            title: title,
            imageUrl: bggImage,
            minPlayers: 2,
            maxPlayers: maxPlayers,
          },
        });
        gameId = newGame.id;
      }
    }

    let newEventId = null;

    // 3. Δημιουργία Event στη βάση
    try {
      const newEvent = await prisma.event.create({
        data: {
          title,
          description,
          city,
          address,
          dateTime,
          maxPlayers,
          hostId: user.id,
          imageUrl: bggImage,
          gameId: gameId,
           minPlayers: bggMinPlayers ? parseInt(bggMinPlayers) : null,
    playingTime: bggPlayingTime ? parseInt(bggPlayingTime) : null,
    minAge: bggMinAge ? parseInt(bggMinAge) : null,
    yearPublished: bggYearPublished ? parseInt(bggYearPublished) : null,
    gameTitle: bggGameTitle || null,
          participants: {
            create: {
              userId: user.id,
            },
          },
        },
      });

      newEventId = newEvent.id;
    } catch (error) {
      console.error("Prisma Error Details:", error);
      throw new Error(`Σφάλμα Βάσης Δεδομένων: ${error.message}`);
    }

    // 4. Ανακατεύθυνση
    if (newEventId) {
      redirect(`/events/${newEventId}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-purple-400 hover:text-purple-300 transition group"
        >
          <span className="group-hover:-translate-x-1 transition">←</span>{" "}
          Επιστροφή στην Αρχική
        </Link>

        <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[90px] pointer-events-none rounded-full" />

          <div className="mb-8 border-b border-slate-800 pb-6">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block mb-1">
              ⚔️ Tavern Master
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
              Δημιουργία Νέου Τραπεζιού
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Συμπλήρωσε τις λεπτομέρειες του quest για να βρεις τους επόμενους
              συμπαίκτες σου!
            </p>
          </div>

          <CreateEventForm createEventAction={createEvent} />
        </div>
      </div>
    </div>
  );
}
