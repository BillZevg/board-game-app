import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header"; // ή η δική σας διαδρομή
import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="el" suppressHydrationWarning>
        <body
          className="antialiased min-h-screen bg-gray-50"
          suppressHydrationWarning
        >
          <Header />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
