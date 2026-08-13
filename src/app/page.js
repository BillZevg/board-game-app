import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignInButton } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();

  const events = await prisma.event.findMany({
    orderBy: { dateTime: "asc" },
    take: 6,
    include: {
      host: true,
      _count: { select: { participants: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* --- HERO BANNER FOR GEEKS --- */}
      {!userId && (
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-b border-indigo-900/40 py-20 px-4 text-center">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-mono uppercase tracking-widest shadow-inner">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Level Up Your Game Nights
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 leading-tight">
              Μπες στο Tabletop Tavern! 🎲
            </h1>

            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Αναζητάς{" "}
              <span className="text-purple-300 font-semibold">
                4o παίκτη για Catan
              </span>
              , <span className="text-cyan-300 font-semibold">D&D Party</span> ή{" "}
              <span className="text-pink-300 font-semibold">
                Euro-game strategists
              </span>
              ; Δημιούργησε τραπέζι ή βρες την επόμενη παρέα σου!
            </p>

            <div className="pt-4 flex justify-center gap-4">
              <SignInButton mode="modal">
                <button className="relative group px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-900/40 hover:shadow-purple-600/30 hover:scale-105 active:scale-95 transition cursor-pointer overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    ⚔️ Γίνε μέλος στο Party
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </SignInButton>
            </div>
          </div>
        </section>
      )}

      {/* --- MAIN EVENTS GRID --- */}
      <main className="max-w-7xl mx-auto px-4 pt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-2">
              <span className="text-purple-400">🛡️</span> Ανοιχτά Τραπέζια
            </h2>
            <p className="text-slate-400 text-sm">
              Εξερεύνησε τα ενεργά quest sessions της κοινότητας
            </p>
          </div>

          {userId && (
            <Link
              href="/events/create"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition text-sm flex items-center gap-2 border border-purple-400/30"
            >
              <span>➕</span> Νέο Τραπέζι
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-md">
            <p className="text-slate-400 text-lg mb-4">
              🧙‍♂️ Δεν βρέθηκαν ενεργά τραπέζια...
            </p>
            {userId && (
              <Link
                href="/events/create"
                className="text-purple-400 font-semibold hover:text-purple-300 underline"
              >
                Γίνε ο Dungeon Master & φτιάξε το πρώτο!
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.dateTime).toLocaleDateString(
                "el-GR",
                {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              const isFull = event._count.participants >= event.maxPlayers;

              return (
                <div
                  key={event.id}
                  className="group relative bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-sm"
                >
                  {/* Top Ambient Highlight */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition" />

                  <div>
                    {/* Header: Location & Time */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="px-3 py-1 text-xs font-mono font-medium bg-slate-800 text-purple-300 rounded-lg border border-purple-500/20 flex items-center gap-1">
                        📍 {event.city || "Board Game Cafe"}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        🕒 {eventDate}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-purple-300 transition line-clamp-1">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                      {event.description || "Δεν έχει προστεθεί περιγραφή..."}
                    </p>
                  </div>

                  {/* Footer: Slots & Action */}
                  <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <span
                      className={`font-mono font-semibold px-2.5 py-1 rounded-md ${
                        isFull
                          ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                          : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                      }`}
                    >
                      👥 {event._count.participants} / {event.maxPlayers} Slots
                    </span>

                    <Link
                      href={`/events/${event.id}`}
                      className="font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 group-hover:translate-x-1 duration-200"
                    >
                      Join Session →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
