import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import "./globals.css";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://tabletoptavern.gr",
  ),
  title: {
    default: "Tabletop Tavern | Βρες παρέα για Board Games & TRPGs",
    template: "%s | Tabletop Tavern",
  },
  description:
    "Η ελληνική πλατφόρμα για να οργανώσεις και να βρεις επιτραπέζια παιχνίδια, D&D sessions και TRPGs στην περιοχή σου!",
  openGraph: {
    title: "Tabletop Tavern | Βρες παρέα για Board Games & TRPGs",
    description: "Οργάνωσε ή μπες σε board game & TRPG sessions εύκολα!",
    url: "/",
    siteName: "Tabletop Tavern",
    locale: "el_GR",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Tabletop Tavern Logo & Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabletop Tavern",
    description: "Βρες την επόμενη παρέα σου για board games & TRPGs!",
    images: ["/og-default.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020617",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="el"
        className={cn("dark bg-slate-950 font-mono", jetbrainsMono.variable)}
        suppressHydrationWarning
      >
        <body
          className="antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white overflow-x-hidden"
          suppressHydrationWarning
        >
          {/* Header */}
          <Header />

          {/* Main Content Area */}
          <Suspense
            fallback={
              <div className="p-8 text-center text-xs font-mono text-slate-500 bg-slate-950 flex-1 flex items-center justify-center">
                Loading Tavern...
              </div>
            }
          >
            <main className="flex-1 bg-slate-950 w-full">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Responsive Flex/Grid Container */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                  {/* Περιεχόμενο Σελίδας - Πάντα 1ο στο Mobile */}
                  <div className="w-full lg:w-3/4 min-w-0 order-1">
                    {children}
                  </div>

                  {/* Leaderboard Sidebar - Collapsible στο Mobile */}
                  <aside className="w-full lg:w-1/4 lg:sticky lg:top-8 shrink-0 order-2">
                    {/* Accordion για Mobile */}
                    <details className="lg:hidden bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all group">
                      <summary className="p-4 flex items-center justify-between cursor-pointer font-bold text-sm text-purple-400 select-none">
                        <span className="flex items-center gap-2">
                          <span>🏆</span> Leaderboard
                        </span>
                        <span className="text-xs text-slate-500 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="p-4 pt-0 border-t border-slate-800/50">
                        <Leaderboard />
                      </div>
                    </details>

                    {/* Standard Sidebar για Desktop */}
                    <div className="hidden lg:block">
                      <Leaderboard />
                    </div>
                  </aside>
                </div>
              </div>
            </main>
          </Suspense>

          {/* Footer */}
          <Footer />

          {/* Mobile vs Desktop Notifications */}
          <Toaster
            position="bottom-center"
            richColors
            closeButton
            className="sm:hidden"
          />
          <Toaster
            position="top-right"
            richColors
            closeButton
            className="hidden sm:block"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
