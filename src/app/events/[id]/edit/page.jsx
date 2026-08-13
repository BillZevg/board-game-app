import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DeleteEventButton from "@/components/DeleteEventButton";

export default async function EditEventPage({ params }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  // Φέρνουμε το Event μαζί με τον Host
  const event = await prisma.event.findUnique({
    where: { id },
    include: { host: true },
  });

  if (!event) {
    notFound();
  }

  // Έλεγχος αν ο συνδεδεμένος χρήστης είναι ο Host του Event
  if (event.host.clerkId !== clerkId) {
    redirect(`/events/${id}`);
  }

  // --- SERVER ACTION: UPDATE EVENT ---
  async function updateEvent(formData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return;

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

    await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        city,
        address,
        dateTime,
        maxPlayers,
      },
    });

    redirect(`/events/${id}`);
  }

  // --- SERVER ACTION: DELETE EVENT ---
  async function deleteEvent() {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return;

    // Διαγραφή των συμμετοχών πρώτα (cascade cleanup)
    await prisma.participant.deleteMany({
      where: { eventId: id },
    });

    // Διαγραφή του Event
    await prisma.event.delete({
      where: { id },
    });

    redirect("/");
  }

  // Μετατροπή της ημερομηνίας σε ISO string συμβατό με <input type="datetime-local">
  const formattedDateTime = new Date(event.dateTime).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href={`/events/${id}`}
          className="inline-flex items-center gap-2 text-sm font-mono text-purple-400 hover:text-purple-300 transition group"
        >
          <span className="group-hover:-translate-x-1 transition">←</span>{" "}
          Ακύρωση & Επιστροφή στο Session
        </Link>

        {/* --- FORM CARD --- */}
        <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[90px] pointer-events-none rounded-full" />

          {/* Header */}
          <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block mb-1">
                ⚙️ Tavern Master Settings
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
                Επεξεργασία Τραπεζιού
              </h1>
            </div>

            {/* DELETE BUTTON (Client Component) */}
            <DeleteEventButton deleteAction={deleteEvent} />
          </div>

          {/* Form */}
          <form action={updateEvent} className="space-y-6">
            {/* Τίτλος / Παιχνίδι */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                🎲 Τίτλος Event / Όνομα Επιτραπεζίου *
              </label>
              <input
                type="text"
                name="title"
                defaultValue={event.title}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm font-medium"
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
                  defaultValue={event.city || ""}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  🏰 Κατάστημα / Σημείο
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={event.address || ""}
                  placeholder="π.χ. The Game Inn, Σπίτι"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Ημερομηνία & Μέγιστοι Παίκτες */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  🕒 Ημερομηνία & Ώρα *
                </label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  defaultValue={formattedDateTime}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm font-mono scheme-dark appearance-none cursor-pointer"
                />
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
                  defaultValue={event.maxPlayers}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Περιγραφή */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                📜 Περιγραφή & Κανόνες
              </label>
              <textarea
                name="description"
                rows="4"
                defaultValue={event.description || ""}
                placeholder="Γράψε λεπτομέρειες για το παιχνίδι..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-sm resize-none font-medium"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <Link
                href={`/events/${id}`}
                className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-sm transition"
              >
                Ακύρωση
              </Link>
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black rounded-xl text-sm shadow-xl shadow-purple-950/50 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center gap-2"
              >
                <span>✨</span> Αποθήκευση Αλλαγών
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
