import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignInButton } from "@clerk/nextjs";
import EventFilters from "@/components/EventFilters";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
  const { userId } = await auth();
  const params = await searchParams;

  const search = params?.search || "";
  const city = params?.city || "";
  const gameId = params?.gameId || "";
  const openOnly = params?.openOnly === "true";
  const statusTab = params?.status || "all";

  const now = new Date();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  // 1. Δυναμικό χτίσιμο των Prisma Wheres
  const whereConditions = {
    AND: [
      gameId ? { gameId } : {},
      city ? { city: { equals: city, mode: "insensitive" } } : {},
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { gameTitle: { contains: search, mode: "insensitive" } }, // Έλεγχος στο πεδίο gameTitle του Event
              { game: { title: { contains: search, mode: "insensitive" } } }, // 👈 Διορθώθηκε από name σε title
            ],
          }
        : {},
    ],
  };

  // 2. Φιλτράρισμα Status απευθείας στη βάση
  if (statusTab === "open") {
    whereConditions.AND.push({
      isCompleted: false,
      dateTime: { gt: now },
    });
  } else if (statusTab === "live") {
    whereConditions.AND.push({
      isCompleted: false,
      dateTime: { lte: now, gte: fourHoursAgo },
    });
  } else if (statusTab === "completed") {
    whereConditions.AND.push({
      OR: [{ isCompleted: true }, { dateTime: { lt: fourHoursAgo } }],
    });
  }

  let events = [];
  let citiesList = [];

  try {
    const [rawEvents, distinctCities] = await Promise.all([
      prisma.event.findMany({
        where: whereConditions,
        orderBy: { dateTime: "asc" },
        include: {
          host: true,
          game: true,
          _count: { select: { participants: true } },
        },
      }),
      prisma.event.groupBy({
        by: ["city"],
        where: { city: { not: "" } },
      }),
    ]);

    // 3. Post-filter για το openOnly (maxPlayers vs participants)
    events = rawEvents.filter((event) => {
      if (openOnly) {
        const isFull = event._count.participants >= event.maxPlayers;
        if (event.isCompleted || isFull) return false;
      }
      return true;
    });

    citiesList = distinctCities
      .map((c) => c.city)
      .filter((c) => Boolean(c && c.trim()));
  } catch (error) {
    console.error("Error loading HomePage events:", error);
  }

  const createTabQuery = (status) => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.set("status", status);
    if (city) queryParams.set("city", city);
    if (search) queryParams.set("search", search);
    if (gameId) queryParams.set("gameId", gameId);
    return `/?${queryParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {!userId && (
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-b border-indigo-900/40 py-20 px-4 text-center">
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

      <main className="max-w-7xl mx-auto px-4 pt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-wide text-white flex items-center gap-2">
              <span className="text-purple-400">👾</span> Όλα τα Τραπέζια
            </h2>
            <p className="text-slate-400 text-sm">
              Εξερεύνησε τα ενεργά, ζωντανά & ολοκληρωμένα quest sessions της
              κοινότητας
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

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "all", label: "🎲 Όλα", color: "purple" },
            { id: "open", label: "📅 Προγραμματισμένα", color: "indigo" },
            { id: "live", label: "🟢 Live / Σε Εξέλιξη", color: "emerald" },
            { id: "completed", label: "🏆 Ολοκληρωμένα", color: "amber" },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={createTabQuery(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? `bg-${tab.color}-600 text-white border border-${tab.color}-400 shadow-lg`
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                {tab.id === "live" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {tab.label}
              </Link>
            );
          })}
        </div>

        <EventFilters cities={citiesList} />

        {events.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-md">
            <p className="text-slate-400 text-lg mb-4">
              🧙‍♂️ Δεν βρέθηκαν τραπέζια με αυτά τα κριτήρια...
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
              const d = new Date(event.dateTime);
              const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

              const isFull = event._count.participants >= event.maxPlayers;
              const isCompleted =
                Boolean(event.isCompleted) ||
                now.getTime() - d.getTime() > 4 * 60 * 60 * 1000;
              const isLive =
                !event.isCompleted &&
                d <= now &&
                now.getTime() - d.getTime() <= 4 * 60 * 60 * 1000;

              // Ανάκτηση εικόνας είτε από το Event είτε από το Relation Game
              const gameImageUrl = event.imageUrl || event.game?.imageUrl;
              const displayGameTitle = event.gameTitle || event.game?.title;

              return (
                <div
                  key={event.id}
                  className={`group relative bg-slate-900/80 border rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-sm ${
                    isLive
                      ? "border-emerald-500/60 shadow-emerald-950/40 hover:border-emerald-400"
                      : isCompleted
                        ? "border-amber-900/30 opacity-80 hover:opacity-100"
                        : "border-slate-800 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20"
                  }`}
                >
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition pointer-events-none" />

                  {/* Banner Εικόνας */}
                  {gameImageUrl && (
                    <div className="relative w-full h-44 bg-slate-950 overflow-hidden border-b border-slate-800">
                      <img
                        src={gameImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent pointer-events-none" />

                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                        {displayGameTitle && (
                          <span className="bg-slate-950/80 text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-cyan-500/30 backdrop-blur-sm">
                            🎲 {displayGameTitle}
                          </span>
                        )}
                        {event.minPlayers && (
                          <span className="bg-slate-950/80 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-purple-500/30 backdrop-blur-sm">
                            👥 {event.minPlayers}-{event.maxPlayers}
                          </span>
                        )}
                        {event.playingTime && (
                          <span className="bg-slate-950/80 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-500/30 backdrop-blur-sm">
                            ⏱ {event.playingTime}′
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4 gap-2">
                        <span className="px-3 py-1 text-xs font-mono font-medium bg-slate-800 text-purple-300 rounded-lg border border-purple-500/20 flex items-center gap-1">
                          📍 {event.city || "Board Game Cafe"}
                        </span>

                        {isLive ? (
                          <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 rounded-full flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            LIVE ΤΩΡΑ
                          </span>
                        ) : isCompleted ? (
                          <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                            🏆 Ολοκληρώθηκε
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">
                            🕒 {formattedDate}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-purple-300 transition line-clamp-1">
                        {event.title}
                      </h3>

                      <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {event.description || "Δεν έχει προστεθεί περιγραφή..."}
                      </p>
                    </div>

                    {/* Host Info */}
                    {event.host && (
                      <div className="flex items-center gap-2 mb-4 pt-3 border-t border-slate-800/60">
                        {event.host.avatarUrl ? (
                          <img
                            src={event.host.avatarUrl}
                            alt={event.host.name || "Host"}
                            className="w-6 h-6 rounded-full object-cover border border-purple-500/40"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-900 text-purple-300 text-[10px] flex items-center justify-center font-bold">
                            {event.host.name?.[0]?.toUpperCase() || "H"}
                          </div>
                        )}
                        <span className="text-xs text-slate-400 font-mono truncate">
                          Host:{" "}
                          <strong className="text-slate-200">
                            {event.host.name || "Άγνωστος"}
                          </strong>
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                      <span
                        className={`font-mono font-semibold px-2.5 py-1 rounded-md ${
                          isLive
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-700/50"
                            : isCompleted
                              ? "bg-amber-950/40 text-amber-400 border border-amber-800/30"
                              : isFull
                                ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                                : "bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
                        }`}
                      >
                        {isCompleted
                          ? "🎉 Quest Ended"
                          : isLive
                            ? "🟢 Playing Now"
                            : `👥 ${event._count.participants} / ${event.maxPlayers} Slots`}
                      </span>

                      <Link
                        href={`/events/${event.id}`}
                        className="font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 group-hover:translate-x-1 duration-200"
                      >
                        {isCompleted
                          ? "Δες το Quest →"
                          : isLive
                            ? "Μπες στο Τραπέζι →"
                            : "Join Session →"}
                      </Link>
                    </div>
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
