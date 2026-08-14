"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EventChat({
  eventId,
  messages: initialMessages = [],
  currentUserId,
  hostId,
  sendMessageAction,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef(null);
  const router = useRouter();

  // Polling: Αυτόματη ανανέωση δεδομένων από τον Server καθε 4 δευτερόλεπτα

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 4000);
    return () => clearInterval(interval);
  }, [router]);

  //   Auto scroll στο τελευταίο μήνυμα
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isPending) return;

    const messageText = text;
    setText("");

    startTransition(async () => {
      try {
        const res = await sendMessageAction(eventId, messageText);
        if (res?.success && res.message) {
          setMessages((prev) => [...prev, res.message]);
        } else if (res && !res.success) {
          console.error("Chat Server Error:", res.error);
        } else if (res) {
          setMessages((prev) => [...prev, res]);
        }
        router.refresh();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
  };

  return (
    <div className="bg-slate-900/90 border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col h-[520px] overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-48 bg-cyan-600/10 blur-[80px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="relative pb-4 border-4 border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">💬</span>
          <div>
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">
              Party Channel
            </span>
            <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 text-lg">
              Tavern Chat
            </h3>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Members Only
        </span>
      </div>

      {/* Messages Feed */}
      <div className="relative flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm space-y-2">
            <span className="text-3xl">🧙‍♂️</span>
            <p className="font-medium text-slate-400">
              Η ταβέρνα είναι ακόμα ήσυχη...
            </p>
            <p className="text-xs text-slate-600 font-mono">
              Στείλε το πρώτο μήνυμα για να ξεκινήσει η συνεννόηση!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.userId === currentUserId ||
              msg.user?.clerkId === currentUserId ||
              msg.user?.id === currentUserId;

            const isHost =
              msg.userId === hostId ||
              msg.user?.clerkId === hostId ||
              msg.user?.id === hostId;

            const messageContent = msg.content || msg.text || "";

            const messageKey = msg.id || `msg-${msg.createdAt || index}`;

            return (
              <div
                key={messageKey}
                className={`flex items-start gap-3 ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-purple-500/30 shadow-md">
                  {msg.user?.imageUrl ? (
                    <Image
                      src={msg.user.imageUrl}
                      alt={msg.user.name || "User"}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-300">
                      {msg.user?.name?.[0] || "G"}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] space-y-1 ${
                    isMe ? "items-end text-right" : "items-start"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 text-[11px] font-mono text-slate-400 px-1 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-slate-300 font-semibold">
                      {msg.user?.name || "Gamer"}
                    </span>
                    {isHost && (
                      <span
                        title="Host / Tavern Master"
                        className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded text-[10px]"
                      >
                        👑 Host
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-slate-500">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-gradient-to-r from-purple-600 via-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-950/60 font-medium"
                        : "bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none font-medium"
                    }`}
                  >
                    {messageContent}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="relative pt-3 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Γράψε ένα μήνυμα στην ομάδα..."
          disabled={isPending}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50 font-medium"
        />
        <button
          type="submit"
          disabled={!text.trim() || isPending}
          className="px-5 py-3 bg-gradient-to-r border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50 font-medium"
        >
          <span>{isPending ? "..." : "Αποστολή"}</span>
          <span className="text-sm">🚀</span>
        </button>
      </form>
    </div>
  );
}
