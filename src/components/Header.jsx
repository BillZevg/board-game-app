"use client";

import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition transform">
            🎲
          </span>
          <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            BOARDCONNECT
          </span>
        </Link>

        {/* User Actions */}
        <div className="flex items-center gap-5">
          {!isLoaded ? (
            <div className="h-8 w-20 bg-slate-800 animate-pulse rounded-lg" />
          ) : isSignedIn ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-semibold text-slate-300 hover:text-purple-400 transition"
              >
                🛡️ Προφίλ
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-9 h-9 border border-purple-500/40 hover:border-purple-400 transition",
                  },
                }}
              />
            </>
          ) : (
            <button
              onClick={() => openSignIn()}
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border border-purple-500/40 hover:border-purple-400 rounded-xl transition shadow-lg shadow-purple-950/50"
            >
              ⚡ Σύνδεση
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
