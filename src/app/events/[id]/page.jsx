import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  deleteEvent,
  toggleAttendance,
  sendChatMessage,
} from "@/app/events/create/actions";
import JoinButton from "./JoinButton";
import DeleteEventButton from "@/components/DeleteEventButton";
import EventChat from "@/components/EventChat";
import { getUserRank } from "@/lib/badges";

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();

  // ⚡ Parallel Queries για μείωση του Latency
  const [event, currentUser] = await Promise.all([
    prisma.event.findUnique({
      where: { id: id },
      include: {
        host: true,
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    clerkId ? prisma.user.findUnique({ where: { clerkId } }) : null,
  ]);

  if (!event) {
    notFound();
  }

  // // Φέρνουμε το event, host, participants και τα messages
  // const event = await prisma.event.findUnique({
  //   where: { id: id },
  //   include: {
  //     host: true,
  //     participants: {
  //       include: {
  //         user: true,
  //       },
  //     },
  //     messages: {
  //       include: {
  //         user: true,
  //       },
  //       orderBy: { createdAt: "asc" },
  //     },
  //   },
  // });

  // if (!event) {
  //   notFound();
  // }

  // Βρίσκουμε τον συνδεδεμένο χρήστη στη Βάση Δεδομένων
  // const currentUser = clerkId
  //   ? await prisma.user.findUnique({ where: { clerkId } })
  //   : null;

  // Έλεγχος αν ο συνδεδεμένος χρήστης είναι ο host ή αν συμμετέχει
  const isHost = clerkId === event.host?.clerkId;
  const isAttending = event.participants.some(
    (p) => p.userId === currentUser?.id || p.user?.clerkId === clerkId,
  );
  const isFull = event.participants.length >= event.maxPlayers;
  const canChat = isHost || isAttending;

  // --- ΕΛΕΓΧΟΣ STATUS EVENT (Finished / Live / Upcoming) ---
  const now = new Date();
  const eventDate = event.dateTime ? new Date(event.dateTime) : null;
  // Υποθέτουμε μέση διάρκεια συνεδρίας 3 ώρες
  const eventEndDate = eventDate
    ? new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)
    : null;

  const isFinished = eventEndDate ? now > eventEndDate : false;
  const isLive =
    eventDate && eventEndDate ? now >= eventDate && now <= eventEndDate : false;

  // --- ΑΣΦΑΛΗΣ ΜΟΡΦΟΠΟΙΗΣΗ ΗΜΕΡΟΜΗΝΙΑΣ ---
  let formattedDate = "Δεν έχει οριστεί ημερομηνία";
  if (eventDate && !isNaN(eventDate.getTime())) {
    formattedDate = eventDate.toLocaleString("el-GR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ⚠️ Serialization των messages για το Client Component (EventChat)
  const serializedMessages = event.messages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt ? msg.updatedAt.toISOString() : null,
  }));

  // Rank του Host
  const hostRank = getUserRank(event.host?.xp || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Πίσω στην Αρχική Σελίδα */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-purple-400 hover:text-purple-300 transition group"
        >
          <span className="group-hover:-translate-x-1 transition">←</span> Πίσω
          σε όλα τα Events
        </Link>

        {/* --- MAIN EVENT CARD --- */}
        <div
          className={`relative bg-slate-900/90 border rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md overflow-hidden transition ${
            isFinished ? "border-slate-800/60 opacity-85" : "border-slate-800"
          }`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[90px] pointer-events-none rounded-full" />

          {/* Τίτλος Event & Status Badge & Κουμπιά Host */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                  🎲 Session Details
                </span>

                {/* Status Badge */}
                {isFinished && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    🏁 Ολοκληρώθηκε
                  </span>
                )}
                {isLive && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-950/80 text-red-400 border border-red-800 animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    🔴 LIVE
                  </span>
                )}
                {!isFinished && !isLive && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    ⏳ Προγραμματισμένο
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
                {event.title}
              </h1>
            </div>

            {isHost && (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>✏️</span> Επεξεργασία
                </Link>

                <DeleteEventButton
                  eventId={event.id}
                  deleteAction={deleteEvent}
                />
              </div>
            )}
          </div>

          {/* Πληροφορίες Διοργανωτή (Host) με Rank Badge */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-800">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50 shrink-0">
              {event.host?.avatarUrl ? (
                <Image
                  src={event.host.avatarUrl}
                  alt={event.host.name || "Host"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-900 text-purple-300 flex items-center justify-center font-bold text-lg">
                  {event.host?.name?.[0]?.toUpperCase() || "H"}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Tavern Master (Host)
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                  👑 Host
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-200 text-sm">
                  {event.host?.name || "Άγνωστος"}
                </p>

                {/* Host Rank Badge */}
                <div
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] leading-none ${hostRank.color}`}
                  title={`${hostRank.rarity} Rank • ${event.host?.xp || 0} XP`}
                >
                  <div className="relative w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                    <Image
                      src={hostRank.icon}
                      alt={hostRank.title}
                      fill
                      className="w-full h-full object-contain filter drop-shadow block max-w-none"
                    />
                  </div>
                  <span className="font-semibold whitespace-nowrap">
                    {hostRank.title}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Λεπτομέρειες */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                📅 Ημερομηνία & Ώρα
              </span>
              <p className="text-slate-200 font-semibold text-sm capitalize">
                {formattedDate}
              </p>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                📍 Τοποθεσία
              </span>
              <p className="text-slate-200 font-semibold text-sm">
                {event.locationType === "STORE"
                  ? `${event.address ? `${event.address}, ` : ""}${
                      event.city || "Δεν έχει οριστεί"
                    }`
                  : "🌐 Online Session"}
              </p>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                👥 Θέσεις
              </span>
              <p className="text-slate-200 font-semibold text-sm">
                {event.participants.length} / {event.maxPlayers} Παίκτες
              </p>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                ⚡ Κατάσταση
              </span>
              <p className="font-semibold text-sm">
                {isFinished ? (
                  <span className="text-slate-500 font-bold">
                    🏁 Η συνεδρία ολοκληρώθηκε
                  </span>
                ) : isFull ? (
                  <span className="text-red-400 font-bold">🔒 Πλήρες</span>
                ) : (
                  <span className="text-emerald-400 font-bold">
                    ✨ Διαθέσιμες Θέσεις
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Περιγραφή Event */}
          {event.description && (
            <div className="mb-8 pb-6 border-b border-slate-800">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                📜 Περιγραφή & Κανόνες
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Status / Κουμπιά Ενεργειών */}
          <div className="flex justify-end items-center pt-2">
            {isFinished ? (
              <div className="bg-slate-950 border border-slate-800 text-slate-500 px-5 py-3 rounded-xl font-mono text-xs font-bold flex items-center gap-2">
                🏁 Το Quest έχει ολοκληρωθεί
              </div>
            ) : isHost ? (
              <div className="bg-purple-950/60 border border-purple-800/50 text-purple-300 px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2">
                👑 Είστε ο Tavern Master αυτού του Event
              </div>
            ) : (
              <JoinButton
                eventId={event.id}
                isAttending={isAttending}
                isFull={isFull}
                toggleAction={toggleAttendance}
              />
            )}
          </div>
        </div>

        {/* --- ΛΙΣΤΑ ΣΥΜΜΕΤΕΧΟΝΤΩΝ ME RANK BADGES --- */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
              <span>👥</span> Συμμετέχοντες ({event.participants.length})
            </h2>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              {event.participants.length} / {event.maxPlayers} Slots
            </span>
          </div>

          {event.participants.length === 0 ? (
            <p className="text-slate-500 font-mono text-sm italic">
              Δεν υπάρχουν ακόμα συμμετέχοντες. Γίνε ο πρώτος!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {event.participants.map((attendee) => {
                const name = attendee.user?.name || "Χρήστης";
                const avatar = attendee.user?.avatarUrl;
                const userRank = getUserRank(attendee.user?.xp || 0);

                return (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-md hover:border-slate-700 transition"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-purple-500/30 shrink-0">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 text-purple-300 text-xs flex items-center justify-center font-bold">
                          {name[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    <div className="truncate flex-1 space-y-1">
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {name}
                      </p>

                      {/* Rank Badge */}
                      <div
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] leading-none ${userRank.color}`}
                        title={`${userRank.rarity} Rank • ${attendee.user?.xp || 0} XP`}
                      >
                        <div className="relative w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                          <Image
                            src={userRank.icon}
                            alt={userRank.title}
                            fill
                            className="w-full h-full object-contain filter drop-shadow block max-w-none"
                          />
                        </div>
                        <span className="font-semibold whitespace-nowrap">
                          {userRank.title}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- TAVERN CHAT --- */}
        {canChat ? (
          <EventChat
            eventId={event.id}
            messages={event.messages || []}
            currentUserId={currentUser?.id}
            hostId={event.hostId}
            sendMessageAction={sendChatMessage}
          />
        ) : (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400 space-y-1">
            <p className="font-bold text-slate-300 text-sm">
              🔒 Το Tavern Chat είναι κλειδωμένο
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Γίνε μέλος στο τραπέζι για να συνομιλήσεις με τον Host και τους
              συμπαίκτες σου!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
