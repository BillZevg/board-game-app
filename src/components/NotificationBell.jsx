"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Φέρνουμε τις ειδοποιήσεις του χρήστη
    fetch(`/api/notifications`)
      .then((res) => res.json())
      .then((data) => setNotifications(data));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-800 cursor-pointer"
      >
        <Bell className="w-6 h-6 text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute tp-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-p border-slate-700 font-bold text-white">
            Ειδοποιήσεις
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">
                Δεν έχετε ειδοποιήσεις
              </p>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => markAsRead(n.id)}
                  className={`block p-3 border-b border-slate-800 text-sm hover:bg-slate-800 transition   ${
                    !n.isRead
                      ? "bg-slate-800/50 font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  <p className="text-white">{n.title}</p>
                  <p className="text-xs text-slate-300">{n.message}</p>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
