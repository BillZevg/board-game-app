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
    <form action={handleSubmit} className="space-y-6">
      {/* Κρυφό πεδίο για το locationType ώστε να στέλνεται πάντα STORE */}
      <input type="hidden" name="locationType" value="STORE" />

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium">
          Σφάλμα: {error}
        </div>
      )}

      {/* Τίτλος */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Τίτλος Event *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={event.title}
          required
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
        />
      </div>

      {/* Περιγραφή */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Περιγραφή
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={event.description || ""}
          rows="4"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
          placeholder="Λεπτομέρειες για το event, τα παιχνίδια, κλπ."
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ημερομηνία & Ώρα */}
        <div>
          <label
            htmlFor="dateTime"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Ημερομηνία & Ώρα *
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            defaultValue={formattedDateTime}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
          />
        </div>

        {/* Μέγιστος Αριθμός Παικτών */}
        <div>
          <label
            htmlFor="maxPlayers"
            className="block text-sm font-semibold text-gray-700 mb-1"
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
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
          />
        </div>
      </div>

      {/* Στοιχεία Μαγαζιού / Τοποθεσίας (Πάντα εμφανή) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Πόλη *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            defaultValue={event.city || ""}
            required
            className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
            placeholder="π.χ. Αθήνα"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Όνομα Μαγαζιού / Διεύθυνση *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            defaultValue={event.address || ""}
            required
            className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
            placeholder="π.χ. Playhouse, Πανεπιστημίου 12"
          />
        </div>
      </div>

      {/* Κουμπί Υποβολής */}
      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 shadow-sm"
        >
          {loading ? "Αποθήκευση..." : "Αποθήκευση Αλλαγών"}
        </button>
      </div>
    </form>
  );
}
