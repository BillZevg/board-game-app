import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import DatePicker from "@/components/DateTimePicker";

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
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-purple-400 hover:text-purple-300 transition group"
        >
          <span className="group-hover:-translate-x-1 transition">←</span>{" "}
          Επιστροφή στην Αρχική
        </Link>

        {/* --- FORM CARD --- */}
        <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[90px] pointer-events-none rounded-full" />

          {/* Header */}
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

          {/* Form */}
          <form action={createEvent} className="space-y-6">
            {/* Τίτλος / Παιχνίδι */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                🎲 Τίτλος Event / Όνομα Επιτραπεζίου *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="π.χ. Catan Night, D&D 5e One-Shot, Scythe Tournament"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
              />
            </div>

            {/* Πόλη & Τοποθεσία */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  📍 Πόλη *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="π.χ. Αθήνα, Θεσσαλονίκη"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  🏰 Κατάστημα / Σημείο
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="π.χ. The Game Inn, Σπίτι, Kaissa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                />
              </div>
            </div>

            {/* Ημερομηνία & Μέγιστοι Παίκτες */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  🕒 Ημερομηνία & Ώρα *
                </label>
                <DatePicker name="dateTime" required />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  👥 Μέγιστοι Παίκτες (Max Slots) *
                </label>
                <input
                  type="number"
                  name="maxPlayers"
                  min="2"
                  max="20"
                  defaultValue="4"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm"
                />
              </div>
            </div>

            {/* Περιγραφή */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                📜 Περιγραφή & Κανόνες (Προαιρετικό)
              </label>
              <textarea
                name="description"
                rows="4"
                placeholder="Γράψε λεπτομέρειες: Επίπεδο εμπειρίας, αν θα υπάρχουν διδασκαλία κανόνων, φαγητό/καφές κλπ."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black rounded-xl text-base shadow-xl shadow-purple-950/50 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔥</span> Δημιουργία Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
