import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import "./globals.css";
import { Toaster } from "sonner";
import { Suspense } from "react";

export const metadata = {
  title: "Tabletop Tavern",
  description: "Βρες την επόμενη παρέα σου για board games & TRPGs!",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="el" suppressHydrationWarning>
        <body
          className="antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col"
          suppressHydrationWarning
        >
          {/* 1. Το Header μπαίνει πρώτο στην κορυφή */}
          <Header />

          {/* 2. Το main παίρνει τον υπόλοιπο χώρο (flex-1) */}
          <Suspense
            fallback={
              <div className="p-4 text-center text-xs text-slate-500">
                Loading Tavern...
              </div>
            }
          >
            <main className="flex-1">{children}</main>
          </Suspense>

          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
