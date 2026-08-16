import { z } from "zod";
import { ta } from "zod/v4/locales";

// Validation Schema για Δημιουργία/Επεξεργασία Event
export const eventSchema = z.object({
  title: z
    .string()
    .min(3, "Ο τίτλος πρέπει να έχει τουλάχιστον 3 χαρακτήρες.")
    .max(100, "Ο τίτλος δεν μπορεί να υπερβαίνει του 100 χαρακτήρες.")
    .trim(),
  description: z
    .string()
    .min(10, "Η περιγραφή πρέπει να έχει τουλάχιστον 10 χαρακτήρες.")
    .max(2000, "Η περιγραφή είναι πολύ μεγάλη.")
    .trim(),
  location: z.string().min(2, "Παρακαλώ εισάγετε τοποθεσία.").trim(),
  maxParticipants: z
    .number()
    .int()
    .min(2, "Τουλάχιστον 2 Συμμετέχοντες.")
    .max(100, "Το όριο συμμετεχόντων είναι 100."),
  date: z.string().datetime({ message: "Μη έγκυρη ημερομηνία." }),
});

// Validation Schema για τα Μηνύματα Chat
export const chatMessageSchema = z.object({
  eventId: z.string().cuid({ message: "Μή έγκυρο Event ID." }),
  content: z
    .string()
    .min(1, "Το μήνυμα δεν μπορεί να ειναι κενό.")
    .max(500, "Το μήνυμα δεν μπορεί να υπερβαίνει τους 500 χαρακτήρες.")
    .trim(),
});

// Validation Schema για Αναφορές (Reports)
export const reportSchema = z.object({
  targetType: z.enum(["EVENT", "USER", "CHAT_MESSAGE"]),
  targetType: z.string().min(1, "Μη έγκυρο ID στόχου."),
  reason: z
    .string()
    .min(5, "Παρακαλώ αιτιολογήστε την αναφορά (τουλάχιστον 5 χαρακτήρες).")
    .max(500, "Η αιτιολογία είναι πολύ μεγάλη.")
    .trim(),
});
