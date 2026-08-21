import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProfileTermsBox from "@/components/ProfileTermsBox";
import { getReliabilityScore } from "@/lib/reliability";
import { getRankProgress, getAllBadgesWithStatus } from "@/lib/badges";

export default async function ProfilePage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const clerkUser = await currentUser();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      xp: true,
      acceptedTerms: true,
      attendedCount: true,
      noShowCount: true,
      lateCancelCount: true,
      hostedEvents: {
        orderBy: { dateTime: "asc" },
        include: {
          _count: { select: { participants: true } },
        },
      },
      participations: {
        include: {
          event: {
            include: {
              host: true,
              _count: { select: { participants: true } },
            },
          },
        },
      },
    },
  });

  const userXp = dbUser?.xp || 0;
  const reliability = getReliabilityScore(dbUser);
  const { currentRank, nextRank, progressPercentage, xpNeeded } =
    getRankProgress(userXp);
  const allBadges = getAllBadgesWithStatus(userXp);

  const hostedEvents = dbUser?.hostedEvents || [];
  const joinedEvents =
    dbUser?.participations
      ?.map((p) => p.event)
      .filter((e) => e.host.clerkId !== clerkId) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pt-6 pb-24 sm:py-12 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-purple-400 hover:text-purple-300 transition group active:scale-95"
        >
          <span className="group-hover:-translate-x-1 transition">←</span>{" "}
          Επιστροφή στην Αρχική
        </Link>

        {/* --- USER HEADER CARD --- */}
        <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-purple-600/10 blur-[80px] pointer-events-none rounded-full" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-xl shadow-purple-950/50 shrink-0">
              {clerkUser?.imageUrl ? (
                <Image
                  src={clerkUser.imageUrl}
                  alt="Profile Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-black text-2xl sm:text-3xl text-white">
                  {clerkUser?.firstName?.[0] || "G"}
                </div>
              )}
            </div>

            {/* Info & Stats */}
            <div className="space-y-3 sm:space-y-4 text-center sm:text-left flex-1 w-full">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-mono border ${currentRank.color}`}
                  >
                    <img
                      src={currentRank.icon}
                      alt={currentRank.title}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain"
                    />
                    <span>{currentRank.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                    {userXp} XP
                  </span>
                </div>

                <h1 className="text-xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 truncate max-w-xs sm:max-w-none mx-auto sm:mx-0">
                  {clerkUser?.fullName || clerkUser?.username || "Gamer"}
                </h1>
                <p className="text-[11px] sm:text-xs font-mono text-slate-400 mt-0.5 truncate">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              {/* Progress Bar */}
              {nextRank && (
                <div className="w-full sm:max-w-md bg-slate-950/60 border border-slate-800 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl space-y-1">
                  <div className="flex justify-between text-[11px] sm:text-xs font-mono">
                    <span className="text-slate-400 truncate">
                      Level:{" "}
                      <strong className="text-slate-200">
                        {nextRank.title}
                      </strong>
                    </span>
                    <span className="text-amber-400 font-bold shrink-0 ml-2">
                      {xpNeeded} XP ακόμα
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats - Mobile Horizontal Scrollable Row */}
              <div className="flex items-center gap-2.5 pt-1 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 shrink-0">
                  <span className="text-base sm:text-lg">👑</span>
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">
                      Hosted
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-purple-300">
                      {hostedEvents.length} Sessions
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 shrink-0">
                  <span className="text-base sm:text-lg">⚔️</span>
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">
                      Joined
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-cyan-300">
                      {joinedEvents.length} Sessions
                    </div>
                  </div>
                </div>

                <div
                  className={`border px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 shrink-0 transition ${reliability.color}`}
                >
                  <span className="text-base sm:text-lg">🌱</span>
                  <div className="text-left">
                    <div className="text-[9px] sm:text-[10px] font-mono opacity-80 uppercase">
                      Reliability
                    </div>
                    <div className="text-xs sm:text-sm font-bold">
                      {reliability.isNew
                        ? reliability.label
                        : `${reliability.score}%`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- TROPHY CABINET (Mobile Scrollable) --- */}
        <section className="space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="text-amber-400">🏆</span> Trophy Cabinet
            </h2>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-5 gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            {allBadges.map((badge) => (
              <div
                key={badge.title}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 shrink-0 w-28 sm:w-auto transition-all ${
                  badge.isUnlocked
                    ? badge.color
                    : "opacity-30 grayscale border-slate-800 bg-slate-900/30"
                }`}
              >
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <img
                    src={badge.icon}
                    alt={badge.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-1">
                  {badge.title}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono opacity-70">
                  {badge.minXp} XP
                </span>
              </div>
            ))}
          </div>
        </section>

        <ProfileTermsBox initialAccepted={Boolean(dbUser?.acceptedTerms)} />

        {/* --- HOSTED EVENTS SECTION --- */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="text-purple-400">👑</span> Τραπέζια που
              Διοργανώνω
            </h2>
            <Link
              href="/events/create"
              className="hidden sm:inline-flex px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl font-mono text-xs font-bold transition active:scale-95"
            >
              + Νέο Event
            </Link>
          </div>

          {hostedEvents.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-xs sm:text-sm mb-2">
                Δεν έχεις δημιουργήσει ακόμα κάποιο τραπέζι.
              </p>
              <Link
                href="/events/create"
                className="text-purple-400 font-semibold text-xs sm:text-sm hover:underline"
              >
                Δημιούργησε το πρώτο σου Session →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {hostedEvents.map((event) => {
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

                return (
                  <div
                    key={event.id}
                    className="relative bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-mono bg-purple-950 text-purple-300 rounded-md sm:rounded-lg border border-purple-800">
                          📍 {event.city || "Spot"}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                          🕒 {eventDate}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-white mb-1 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                        {event.description || "Χωρίς περιγραφή..."}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-400 text-[11px]">
                        👥 {event._count.participants} / {event.maxPlayers}{" "}
                        Slots
                      </span>
                      <Link
                        href={`/events/${event.id}`}
                        className="font-bold text-purple-400 hover:text-purple-300 transition text-xs after:absolute after:inset-0"
                      >
                        Προβολή →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* --- JOINED EVENTS SECTION --- */}
        <section className="space-y-3 sm:space-y-4">
          <div className="border-b border-slate-800 pb-2.5">
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="text-cyan-400">⚔️</span> Sessions που Συμμετέχω
            </h2>
          </div>

          {joinedEvents.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-xs sm:text-sm mb-2">
                Δεν συμμετέχεις σε κάποιο τραπέζι αυτή τη στιγμή.
              </p>
              <Link
                href="/"
                className="text-cyan-400 font-semibold text-xs sm:text-sm hover:underline"
              >
                Ανακάλυψε ανοιχτά τραπέζια στην Αρχική →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {joinedEvents.map((event) => {
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

                return (
                  <div
                    key={event.id}
                    className="relative bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-mono bg-cyan-950 text-cyan-300 rounded-md sm:rounded-lg border border-cyan-800">
                          📍 {event.city || "Spot"}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                          🕒 {eventDate}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-white mb-1 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">
                        DM / Host:{" "}
                        <span className="text-slate-200 font-bold">
                          {event.host.name || "Gamer"}
                        </span>
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-400 text-[11px]">
                        👥 {event._count.participants} / {event.maxPlayers}{" "}
                        Slots
                      </span>
                      <Link
                        href={`/events/${event.id}`}
                        className="font-bold text-cyan-400 hover:text-cyan-300 transition text-xs after:absolute after:inset-0"
                      >
                        Λεπτομέρειες →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* --- MOBILE FLOATING ACTION BUTTON --- */}
      <div className="fixed bottom-4 right-4 z-50 sm:hidden">
        <Link
          href="/events/create"
          className="flex items-center gap-1.5 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-full shadow-lg shadow-purple-950/80 border border-purple-400/30 active:scale-95 transition"
        >
          <span>✨</span>
          <span>Νέο Event</span>
        </Link>
      </div>
    </div>
  );
}
