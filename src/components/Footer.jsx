import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 mt-auto text-center text-xs text-slate-400">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <p className="font-mono">
          © {new Date().getFullYear()} Tabletop Tavern. All rights reserved.
        </p>

        {/* Links & 18+ Compliance Badge */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded font-bold">
            🔞 18+
          </span>
          <Link
            href="/terms"
            className="hover:text-purple-400 transition underline underline-offset-4"
          >
            Όροι Χρήσης
          </Link>
        </div>
      </div>
    </footer>
  );
}
