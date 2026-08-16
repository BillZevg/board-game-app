import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

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

  // 3. Λήψη του RAW body ως text (ΟΧΙ req.json())
  const body = await req.text();

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

  // 5. Parsing του επαληθευμένου payload
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, username } =
      evt.data;

    const primaryEmail = email_addresses?.[0]?.email_address || "";
    const fullName =
      [first_name, last_name].filter(Boolean).join(" ") ||
      username ||
      "Adventurer";

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
      await prisma.user.deleteMany({
        where: { clerkId: id },
      });
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
