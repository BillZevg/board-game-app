import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Ορίζουμε ποιες σελίδες είναι ΔΗΜΟΣΙΕΣ (προσβάσιμες χωρίς login)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sessions(.*)", // 👈 Επιτρέπει την πρόσβαση σε όλα τα sessions!
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx|xlsx|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
