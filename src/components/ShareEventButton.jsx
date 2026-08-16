"use client";

import { useState } from "react";

export default function ShareEventButton({ eventId, title, date, location }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Δημιουργία του πλήρους URL του Event
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${eventId}`
      : "";

  // Κείμενο πρόσκλησης για τα social media
  const shareText = `🎲 Έλα να παίξουμε! Event: "${title}"${
    date ? ` στις ${date}` : ""
  }${location ? ` (${location})` : ""}. Δες λεπτομέρειες και δήλωσε συμμετοχή εδώ:`;

  // Native Web Share API (για κινητά / υποστηριζόμενους browsers)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share Error:", err);
        }
        return;
      }
    }

    // Fallback: Ανοίγουμε το Modal αν δεν υποστηρίζεται το native share
    setIsOpen(true);
  };

  // Αντιγραφή στο Clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Direct Social Links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`,
  )}`;

  const viberUrl = `viber://forward?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`,
  )}`;

  return (
    <>
      {/* Κύριο Κουμπί Share */}
      <button
        onClick={handleNativeShare}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl border border-purple-400/30 transition shadow-lg shadow-purple-900/20 flex items-center gap-2 cursor-pointer"
        title="Κοινοποίηση Event"
      >
        <span>🔗</span>
        <span>Πρόσκληση Φίλων</span>
      </button>

      {/* Fallback Modal για Desktop/Browsers χωρίς Web Share */}
      {isOpen && (
        <div className="fixed inset-0 z-50 items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative">
            {/* Κουμπί Κλεισίματος */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-lg font-mono"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>📣</span>Κοινοποίηση Event
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Προώθησε το event στην παρέα σου για να μαζευτούν οι παίχτες!
              </p>
            </div>

            {/* Επιλογές Social Sharing */}
            <div className="grid grid-cols-1 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-2xl text-emerald-300 font-mono text-xs font-bold transition"
              >
                <span className="text-base">💬</span>
                <span>WhatsApp</span>
              </a>

              {/* Viber */}
              <a
                href={viberUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/60 rounded-2xl text-purple-300 font-mono text-xs font-bold transition"
              >
                <span className="text-base">🟣</span>
                <span>Viber</span>
              </a>

              {/* Discord / Γενική Αντιγραφή */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-between p-3 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/60 rounded-2xl text-indigo-300 font-mono text-xs font-bold transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">👾</span>
                  <span>Discord (Αντιγραφή για Paste)</span>
                </div>
              </button>

              {/* Γενική Αντιγραφή Συνδέσμου */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-200 font-mono text-xs font-bold transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">📋</span>
                  <span>{copied ? "Αντιγράφηκε!" : "Αντιγραφή Συνδέσμου"}</span>
                </div>
                {copied && <span className="text-emerald-400 text-xs">✓</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
