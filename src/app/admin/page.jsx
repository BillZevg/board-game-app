import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  deleteEventAdminAction,
  cancelEventAction,
  resolveReportAction,
  updateUserXPAction,
} from "@/lib/admin"; // 👈 Ενημερωμένο import από το lib/admin

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.update({
    where: { clerkId: userId },
    data: { role: "ADMIN" },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    redirect("/");
  }

  // Εκτέλεση queries παράλληλα (φέρνουμε και τους χρήστες με τα XP τους)
  const [reports, recentEvents, users, usersCount] = await Promise.all([
    prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { host: { select: { name: true } } },
    }),
    prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 15,
      select: { id: true, name: true, xp: true },
    }),
    prisma.user.count(),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block">
            System Control
          </span>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Admin Dashboard
          </h1>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm font-mono">
          Συνολικοί Χρήστες:{" "}
          <span className="text-purple-400 font-bold">{usersCount}</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Reports Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <span>⚠️ Εκκρεμή Reports ({reports.length})</span>
          </h2>

          {reports.length === 0 ? (
            <p className="text-slate-500 text-sm">
              Δεν υπάρχουν εκκρεμή reports.
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono">
                      {report.targetType}
                    </span>
                    <p className="text-slate-300 font-medium">
                      {report.reason}
                    </p>
                    <span className="text-slate-500 text-[10px]">
                      ID Στόχου: {report.targetId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await resolveReportAction(report.id, "RESOLVED");
                      }}
                    >
                      <button className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition">
                        Επίλυση
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await resolveReportAction(report.id, "DISMISSED");
                      }}
                    >
                      <button className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition">
                        Απόρριψη
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events & Management */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
            <span>📅</span> Πρόσφατα Events
          </h2>

          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 text-sm"
              >
                <div>
                  <h4 className="font-bold text-slate-200">{event.title}</h4>
                  <p className="text-slate-500 text-xs">
                    Host: {event.host?.name || "Άγνωστος"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Ακύρωση Event */}
                  <form
                    action={async () => {
                      "use server";
                      await cancelEventAction(event.id);
                    }}
                  >
                    <button className="px-3 py-1.5 bg-amber-950/60 text-amber-300 border border-amber-800 rounded-lg hover:bg-amber-900/60 transition text-xs">
                      Ακύρωση
                    </button>
                  </form>

                  {/* Οριστική Διαγραφή */}
                  <form
                    action={async () => {
                      "use server";
                      await deleteEventAdminAction(event.id);
                    }}
                  >
                    <button className="px-3 py-1.5 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg hover:bg-rose-900 transition text-xs">
                      Διαγραφή
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⚡ ΝΕΟ SECTION: Διαχείριση XP & Βαθμολογιών Παικτών */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <span>⚡ Διαχείριση XP & Leaderboard</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar p-1">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-200 truncate">
                  {u.name || "Unknown Player"}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-900/50 px-2 py-0.5 rounded">
                  {u.xp} XP
                </span>
              </div>

              {/* Φόρμες για Αφαίρεση / Προσθήκη XP */}
              <div className="flex gap-2">
                <form
                  action={async (formData) => {
                    "use server";
                    const amount = Number(formData.get("amount") || 50);
                    await updateUserXPAction(u.id, amount, "add");
                  }}
                  className="flex-1 flex gap-1"
                >
                  <input
                    type="number"
                    name="amount"
                    defaultValue={50}
                    className="w-14 bg-slate-900 border border-slate-700 rounded px-1 text-center text-xs text-white"
                  />
                  <button className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 py-1 rounded text-xs font-bold transition">
                    +XP
                  </button>
                </form>

                <form
                  action={async (formData) => {
                    "use server";
                    const amount = Number(formData.get("amount") || 50);
                    await updateUserXPAction(u.id, amount, "remove");
                  }}
                  className="flex-1 flex gap-1"
                >
                  <input
                    type="number"
                    name="amount"
                    defaultValue={50}
                    className="w-14 bg-slate-900 border border-slate-700 rounded px-1 text-center text-xs text-white"
                  />
                  <button className="flex-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 py-1 rounded text-xs font-bold transition">
                    -XP
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
