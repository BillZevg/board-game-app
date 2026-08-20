import { prisma } from "@/lib/prisma";

export async function createNotification({
  userId,
  title,
  message,
  link,
  type,
}) {
  try {
    return await prisma.notificatin.create({
      data: { userId, title, message, link, type },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
