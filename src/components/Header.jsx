"use client";

import { useState } from "react";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/NotificationBell"; // 🔔 Import NotificationBell

export default function Header() {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Σύνδεσμοι με κομψά SVG εικονίδια
  const navLinks = [
    {
      name: "Αρχική",
      href: "/",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Νέο Session",
      href: "/events/create",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
    {
      name: "Προφίλ",
      href: "/profile",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-800/40 bg-slate-950/80 backdrop-blur-2xl transition-all shadow-xl shadow-purple-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO ME ΜΩΒ - ΡΟΖ GRADIENT */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 p-[1px] shadow-lg shadow-pink-950/50 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-xl">
                🎲
              </div>
            </div>
            <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-pink-100 group-hover:to-purple-200 transition duration-300">
              BOARD<span className="text-pink-400">CONNECT</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 bg-purple-950/40 p-1.5 rounded-2xl border border-purple-800/40 shadow-inner">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-pink-200 border border-pink-500/40 shadow-md shadow-pink-950/40"
                      : "text-purple-200/60 hover:text-white hover:bg-purple-900/30"
                  }`}
                >
                  <span
                    className={
                      isActive ? "text-pink-400" : "text-purple-400/70"
                    }
                  >
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* USER ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoaded ? (
              <div className="h-9 w-24 bg-purple-950/50 animate-pulse rounded-xl border border-purple-800/40" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-4 pl-3 border-l border-purple-900/60">
                {/* 🔔 NotificationBell για Desktop */}
                <NotificationBell />

                <Link
                  href="/profile"
                  className="text-xs font-mono font-semibold text-purple-200/70 hover:text-pink-300 transition"
                >
                  My Profile
                </Link>
                <div className="p-0.5 rounded-full ring-2 ring-pink-500/40 hover:ring-pink-400 transition shadow-lg shadow-pink-950/50">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full",
                      },
                    }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={() => openSignIn()}
                className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 rounded-xl group-hover:opacity-100 transition opacity-85" />
                <span className="relative block px-5 py-2 text-xs font-mono font-bold text-white bg-slate-950 rounded-[11px] group-hover:bg-transparent transition duration-200">
                  ⚡ Σύνδεση
                </span>
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <div className="flex md:hidden items-center gap-3">
            {isSignedIn && (
              <>
                {/* 🔔 NotificationBell για Mobile */}
                <NotificationBell />

                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 border border-pink-500/40",
                    },
                  }}
                />
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-200 hover:text-white transition"
              aria-label="Toggle Navigation Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-purple-800/50 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono font-semibold transition ${
                  isActive
                    ? "bg-purple-900/50 text-pink-200 border border-pink-500/40"
                    : "text-purple-200/70 hover:bg-purple-900/30 hover:text-white"
                }`}
              >
                <span
                  className={isActive ? "text-pink-400" : "text-purple-400/70"}
                >
                  {link.icon}
                </span>
                {link.name}
              </Link>
            );
          })}

          {!isSignedIn && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSignIn();
                }}
                className="w-full py-3 text-xs font-mono font-bold text-center text-white bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-950/50"
              >
                ⚡ Σύνδεση
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
