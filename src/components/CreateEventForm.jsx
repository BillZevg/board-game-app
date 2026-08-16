"use client";

import { useState } from "react";
import BggGameSearch from "@/components/BggGameSearch";
import DatePicker from "@/components/DateTimePicker";

export default function CreateEventForm({ createEventAction }) {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <form action={createEventAction} className="space-y-6">
      {/* 🎲 BGG Game Search */}
      <BggGameSearch onSelectGame={(game) => setSelectedGame(game)} />

      {/* Hidden inputs για να περάσουν τα BGG data στο Server Action */}
      {selectedGame && (
        <>
          <input type="hidden" name="bggId" value={selectedGame.id || ""} />
          <input
            type="hidden"
            name="bggImage"
            value={selectedGame.thumbnail || ""}
          />
           <input type="hidden" name="bggMinPlayers" value={selectedGame.minPlayers || ""} />
    <input type="hidden" name="bggMaxPlayers" value={selectedGame.maxPlayers || ""} />
    <input type="hidden" name="bggPlayingTime" value={selectedGame.playingTime || ""} />
    <input type="hidden" name="bggMinAge" value={selectedGame.minAge || ""} />
    <input type="hidden" name="bggYearPublished" value={selectedGame.yearPublished || ""} />
    <input type="hidden" name="bggGameTitle" value={selectedGame.title || ""} />
        </>
      )}

      {/* Τίτλος Event */}
      <div>
        <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
          🎲 Τίτλος Event / Όνομα Επιτραπεζίου *
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={selectedGame?.title || ""}
          placeholder="π.χ. Catan Night, D&D 5e One-Shot"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition text-sm"
        />
      </div>

      {/* Πόλη & Τοποθεσία */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            📍 Πόλη *
          </label>
          <input
            type="text"
            name="city"
            required
            placeholder="π.χ. Αθήνα"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            🏰 Κατάστημα / Σημείο
          </label>
          <input
            type="text"
            name="location"
            placeholder="π.χ. The Game Inn, Σπίτι"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition text-sm"
          />
        </div>
      </div>

      {/* Ημερομηνία & Μέγιστοι Παίκτες */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            🕒 Ημερομηνία & Ώρα *
          </label>
          <DatePicker name="dateTime" required />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            👥 Μέγιστοι Παίκτες (Max Slots) *
          </label>
          <input
            type="number"
            name="maxPlayers"
            min="2"
            max="20"
            defaultValue={selectedGame?.maxPlayers || 4}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-purple-500 transition text-sm"
          />
        </div>
      </div>

      {/* Περιγραφή */}
      <div>
        <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
          📜 Περιγραφή & Κανόνες (Προαιρετικό)
        </label>
        <textarea
          name="description"
          rows="4"
          placeholder="Γράψε λεπτομέρειες: Επίπεδο εμπειρίας, διδασκαλία κανόνων κλπ."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition text-sm resize-none"
        ></textarea>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black rounded-xl text-base shadow-xl shadow-purple-950/50 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🔥</span> Δημιουργία Session
        </button>
      </div>
    </form>
  );
}
