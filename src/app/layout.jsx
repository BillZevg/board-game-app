import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import "./globals.css";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata = {
  title: "Tabletop Tavern",
  description: "Βρες την επόμενη παρέα σου για board games & TRPGs!",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="el" className={cn("dark bg-slate-950", "font-mono", jetbrainsMono.variable)} suppressHydrationWarning>
        <body
          className="antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white"
          suppressHydrationWarning
        >
          {/* Header */}
          <Header />

          {/* Main Content */}
          <Suspense
            fallback={
              <div className="p-8 text-center text-xs font-mono text-slate-500 bg-slate-950">
                Loading Tavern...
              </div>
            }
          >
            <main className="flex-1 bg-slate-950 w-full">
              <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Responsive Flex/Grid Container */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Περιεχόμενο Σελίδας */}
                  <div className="w-full lg:w-3/4 min-w-0">{children}</div>

                  {/* Leaderboard Sidebar */}
                  <aside className="w-full lg:w-1/4 lg:sticky lg:top-8 shrink-0">
                    <Leaderboard />
                  </aside>
                </div>
              </div>
            </main>
          </Suspense>

          {/* Footer */}
          <Footer />

          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
