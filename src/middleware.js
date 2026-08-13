import { clerkMiddleware } from "@clerk/nextjs/server";

const isPublicRoute = (req) => {
  const publicRoutes = ["/", "/api/webhooks/clerk(.*)"];
  return publicRoutes.some((route) =>
    new RegExp(`^${route}`).test(req.nextUrl.pathname),
  );
};

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
