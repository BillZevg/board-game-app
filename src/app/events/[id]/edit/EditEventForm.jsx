"use client";

import { useState } from "react";
import { updateEvent } from "../../create/actions";

export default function EditEventForm({ event, formattedDateTime }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Χρησιμοποιούμε bind για να περάσουμε το eventId στο action
  const updateEventWithId = updateEvent.bind(null, event.id);

  async function handleSubmit(formData) {
    setError(null);
    setLoading(true);
    try {
      await updateEventWithId(formData);
      // Η ανακατεύθυνση γίνεται από το server action
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5 sm:space-y-6">
      {/* Κρυφό πεδίο για το locationType ώστε να στέλνεται πάντα STORE */}
      <input type="hidden" name="locationType" value="STORE" />

      {error && (
        <div className="bg-red-50 text-red-700 p-3.5 sm:p-4 rounded-xl text-sm font-medium border border-red-200">
          Σφάλμα: {error}
        </div>
      )}

      {/* Τίτλος */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 mb-1.5"
        >
          Τίτλος Event *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={event.title}
          required
          className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition outline-none"
        />
      </div>

      {/* Περιγραφή */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 mb-1.5"
        >
          Περιγραφή
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={event.description || ""}
          rows="4"
          className="w-full px-4 py-3 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition outline-none"
          placeholder="Λεπτομέρειες για το event, τα παιχνίδια, κλπ."
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Ημερομηνία & Ώρα */}
        <div>
          <label
            htmlFor="dateTime"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Ημερομηνία & Ώρα *
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            defaultValue={formattedDateTime}
            required
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition outline-none"
          />
        </div>

        {/* Μέγιστος Αριθμός Παικτών */}
        <div>
          <label
            htmlFor="maxPlayers"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Μέγιστος Αριθμός Παικτών *
          </label>
          <input
            type="number"
            id="maxPlayers"
            name="maxPlayers"
            defaultValue={event.maxPlayers}
            required
            min="2"
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition outline-none"
          />
        </div>
      </div>

      {/* Στοιχεία Μαγαζιού / Τοποθεσίας */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-gray-50/80 p-3.5 sm:p-5 rounded-2xl border border-gray-200/60">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Πόλη *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            defaultValue={event.city || ""}
            required
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition outline-none"
            placeholder="π.χ. Αθήνα"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Όνομα Μαγαζιού / Διεύθυνση *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            defaultValue={event.address || ""}
            required
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition outline-none"
            placeholder="π.χ. Playhouse, Πανεπιστημίου 12"
          />
        </div>
      </div>

      {/* Κουμπί Υποβολής */}
      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto h-12 sm:h-11 px-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-medium text-sm transition disabled:opacity-50 shadow-sm flex items-center justify-center min-h-[44px]"
        >
          {loading ? "Αποθήκευση..." : "Αποθήκευση Αλλαγών"}
        </button>
      </div>
    </form>
  );
}
