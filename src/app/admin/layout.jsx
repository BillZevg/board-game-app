import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const { userId } = await auth();

  // 1. Αν δεν είναι συνδεδεμένος -> Sign In
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Έλεγχος ρόλου στη βάση δεδομένων
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  // 3. Αν δεν είναι ADMIN -> Αρχική σελίδα
  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
