"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function BggGameSearch({ onSelectGame, initialTitle = "" }) {
  const [searchTerm, setSearchTerm] = useState(initialTitle);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const wrapperRef = useRef(null);

  // Κλείσιμο του dropdown όταν κάνουμε κλικ έξω
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. EVENT HANDLER: Διαχειρίζεται άμεσα τις αλλαγές στο input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (selectedGame) {
      setSelectedGame(null);
      if (onSelectGame) onSelectGame(null);
    }

    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
    }
  };

  // 2. EFFECT: Debounced Fetching
  useEffect(() => {
    if (
      (selectedGame && searchTerm === selectedGame.title) ||
      searchTerm.trim().length < 2
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/bgg/search?query=${encodeURIComponent(searchTerm)}`,
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setResults(data);
          setIsOpen(true);
        } else {
          setResults([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedGame]);

  const handleSelect = async (gameItem) => {
    setIsOpen(false);
    setSearchTerm(gameItem.name);
    setFetchingDetails(true);

    try {
      const res = await fetch(`/api/bgg/search?id=${gameItem.id}`);
      const details = await res.json();

      if (details && !details.error) {
        setSelectedGame(details);
        if (onSelectGame) onSelectGame(details);
      }
    } catch (err) {
      console.error("Details fetch error:", err);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedGame(null);
    setResults([]);
    setIsOpen(false);
    if (onSelectGame) onSelectGame(null);
  };

  return (
    <div ref={wrapperRef} className="relative w-full space-y-2">
      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
        🎲 Επιλογή Επιτραπεζίου (BGG Search)
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Πληκτρολογήστε όνομα (π.χ. Catan, Carcassonne)..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition pr-10"
        />

        {loading && (
          <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        )}

        {searchTerm && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs font-mono"
          >
            ✖
          </button>
        )}
      </div>

      {/* Dropdown Αποτελεσμάτων */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800">
          {results.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 hover:bg-purple-950/60 cursor-pointer transition flex justify-between items-center text-sm"
            >
              <span className="font-semibold text-slate-100">{item.name}</span>
              {item.year && (
                <span className="text-xs font-mono text-slate-400">
                  ({item.year})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Loading Details Status */}
      {fetchingDetails && (
        <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs font-mono text-purple-300 flex items-center gap-2 animate-pulse">
          <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          Ανάκτηση πληροφοριών από το BoardGameGeek...
        </div>
      )}

      {/* Selected Game Preview */}
      {selectedGame && (
        <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl flex items-center gap-4">
          {selectedGame.thumbnail ? (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-800">
              {/* unoptimized + referrerPolicy="no-referrer" για να φορτώνει απροβλημάτιστα το CDN του BGG */}
              <Image
                src={selectedGame.thumbnail}
                alt={selectedGame.title}
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-2xl">
              🎲
            </div>
          )}

          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <span>{selectedGame.title}</span>
              {selectedGame.yearPublished && (
                <span className="text-xs font-mono text-slate-500 font-normal">
                  ({selectedGame.yearPublished})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-slate-400">
              <span>
                👥 {selectedGame.minPlayers}-{selectedGame.maxPlayers} Παίκτες
              </span>
              <span>⏱️ {selectedGame.playingTime}′</span>
              {Number(selectedGame.minAge) > 0 && (
                <span>🔞 {selectedGame.minAge}+</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
