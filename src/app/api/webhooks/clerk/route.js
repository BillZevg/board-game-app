import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma"; // Χρήση του absolute import alias

export async function POST(req) {
  // 1. Λήψη του CLERK_WEBHOOK_SECRET απο το .env
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Παρακαλώ προσθέστε το CLERK_WEBHOOK_SECRET στο .env.local",
    );
  }

  // 2. Λήψη των Svix headers για επαλήθευση
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Σφάλμα: Λείπουν τα Svix headers", { status: 400 });
  }

  // 3. Λήψη του raw body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 4. Επαλήθευση της υπογραφής με το Svix
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Σφάλμα επαλήθευσης webhook:", err);
    return new Response("Σφάλμα: Μη έγκυρη υπογραφή", { status: 400 });
  }

  // 5. Διαχείριση των events
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, username } =
      evt.data;

    // ΔΙΟΡΘΩΣΗ: email_address (ενικός)
    const primaryEmail = email_addresses?.[0]?.email_address || "";
    const fullName =
      [first_name, last_name].filter(Boolean).join(" ") ||
      username ||
      "Adventurer";

    // Χρήση upsert ώστε να καλύπτει και δημιουργία και ενημέρωση χωρίς crash
    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email: primaryEmail,
        name: fullName,
        imageUrl: image_url || null,
        avatarUrl: image_url || null,
      },
      create: {
        clerkId: id,
        email: primaryEmail,
        name: fullName,
        imageUrl: image_url || null,
        avatarUrl: image_url || null,
      },
    });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      // Χρήση deleteMany για να μην πετάξει error αν ο χρήστης έχει ήδη διαγραφεί
      await prisma.user.deleteMany({
        where: { clerkId: id },
      });
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
