import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProfileTermsBox from "@/components/ProfileTermsBox";
import { getReliabilityScore } from "@/lib/reliability";
import { getRankProgress, getAllBadgesWithStatus } from "@/lib/badges"; // 👈 Εισαγωγή helpers για Badges/Ranks

export default async function ProfilePage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const clerkUser = await currentUser();

  // Φέρνουμε τον χρήστη από τη βάση μαζί με το xp
  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      xp: true, // 👈 Νέο πεδίο XP
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

  // 🛡️ Υπολογισμός Reliability Score
  const reliability = getReliabilityScore(dbUser);

  // 🏆 Υπολογισμός Rank, Progress & Badges
  const { currentRank, nextRank, progressPercentage, xpNeeded } =
    getRankProgress(userXp);
  const allBadges = getAllBadgesWithStatus(userXp);

  const hostedEvents = dbUser?.hostedEvents || [];
  const joinedEvents =
    dbUser?.participations
      ?.map((p) => p.event)
      .filter((e) => e.host.clerkId !== clerkId) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-purple-400 hover:text-purple-300 transition group"
        >
          <span className="group-hover:-translate-x-1 transition">←</span>{" "}
          Επιστροφή στην Αρχική
        </Link>

        {/* --- USER HEADER CARD --- */}
        <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-xl shadow-purple-950/50 shrink-0">
              {clerkUser?.imageUrl ? (
                <Image
                  src={clerkUser.imageUrl}
                  alt="Profile Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-black text-3xl text-white">
                  {clerkUser?.firstName?.[0] || "G"}
                </div>
              )}
            </div>

            {/* Info & Stats */}
            <div className="space-y-4 text-center sm:text-left flex-1">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${currentRank.color}`}
                  >
                    <img
                      src={currentRank.icon}
                      alt={currentRank.title}
                      className="w-4 h-4 object-contain"
                    />
                    <span>{currentRank.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1 rounded-full">
                    {userXp} XP
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
                  {clerkUser?.fullName || clerkUser?.username || "Gamer"}
                </h1>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              {/* Progress Bar για το Επόμενο Rank */}
              {nextRank && (
                <div className="max-w-md bg-slate-950/60 border border-slate-800 p-3 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Επόμενο Level:{" "}
                      <strong className="text-slate-200">
                        {nextRank.title}
                      </strong>
                    </span>
                    <span className="text-amber-400 font-bold">
                      {xpNeeded} XP ακόμα
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Player Stats Badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="text-lg">👑</span>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">
                      Hosted
                    </div>
                    <div className="text-sm font-bold text-purple-300">
                      {hostedEvents.length} Sessions
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="text-lg">⚔️</span>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">
                      Joined
                    </div>
                    <div className="text-sm font-bold text-cyan-300">
                      {joinedEvents.length} Sessions
                    </div>
                  </div>
                </div>

                {/* 🌱 RELIABILITY SCORE BADGE */}
                <div
                  className={`border px-4 py-2 rounded-xl flex items-center gap-2 transition ${reliability.color}`}
                >
                  <span className="text-lg">🌱</span>
                  <div>
                    <div className="text-[10px] font-mono opacity-80 uppercase">
                      Reliability
                    </div>
                    <div className="text-sm font-bold">
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

        {/* --- TROPHY CABINET (ALL BADGES) --- */}
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="text-amber-400">🏆</span> Trophy Cabinet
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {allBadges.map((badge) => (
              <div
                key={badge.title}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                  badge.isUnlocked
                    ? badge.color
                    : "opacity-30 grayscale border-slate-800 bg-slate-900/30"
                }`}
              >
                <div className="relative w-10 h-10">
                  <img
                    src={badge.icon}
                    alt={badge.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-bold leading-tight">
                  {badge.title}
                </span>
                <span className="text-[10px] font-mono opacity-70">
                  {badge.minXp} XP
                </span>
              </div>
            ))}
          </div>
        </section>

        <ProfileTermsBox initialAccepted={Boolean(dbUser?.acceptedTerms)} />

        {/* --- HOSTED EVENTS SECTION --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="text-purple-400">👑</span> Τραπέζια που
              Διοργανώνω
            </h2>
            <Link
              href="/events/create"
              className="px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl font-mono text-xs font-bold transition"
            >
              + Νέο Event
            </Link>
          </div>

          {hostedEvents.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm mb-3">
                Δεν έχεις δημιουργήσει ακόμα κάποιο τραπέζι.
              </p>
              <Link
                href="/events/create"
                className="text-purple-400 font-semibold text-sm hover:underline"
              >
                Δημιούργησε το πρώτο σου Session →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2.5 py-1 text-[11px] font-mono bg-purple-950 text-purple-300 rounded-lg border border-purple-800">
                          📍 {event.city || "Spot"}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          🕒 {eventDate}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                        {event.description || "Χωρίς περιγραφή..."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-400">
                        👥 {event._count.participants} / {event.maxPlayers}{" "}
                        Slots
                      </span>
                      <Link
                        href={`/events/${event.id}`}
                        className="font-bold text-purple-400 hover:text-purple-300 transition"
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
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="text-cyan-400">⚔️</span> Sessions που Συμμετέχω
            </h2>
          </div>

          {joinedEvents.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm mb-3">
                Δεν συμμετέχεις σε κάποιο τραπέζι αυτή τη στιγμή.
              </p>
              <Link
                href="/"
                className="text-cyan-400 font-semibold text-sm hover:underline"
              >
                Ανακάλυψε ανοιχτά τραπέζια στην Αρχική →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2.5 py-1 text-[11px] font-mono bg-cyan-950 text-cyan-300 rounded-lg border border-cyan-800">
                          📍 {event.city || "Spot"}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          🕒 {eventDate}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        DM / Host:{" "}
                        <span className="text-slate-200 font-bold">
                          {event.host.name || "Gamer"}
                        </span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-400">
                        👥 {event._count.participants} / {event.maxPlayers}{" "}
                        Slots
                      </span>
                      <Link
                        href={`/events/${event.id}`}
                        className="font-bold text-cyan-400 hover:text-cyan-300 transition"
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
    </div>
  );
}
