import Link from "next/link";

export default function TermsPage() {
  const sections = [
    { id: "age-restriction", title: "1. Ηλικιακός Περιορισμός (18+)" },
    { id: "safety", title: "2. Φυσικές Συναντήσεις & Ασφάλεια" },
    { id: "community", title: "3. Συμπεριφορά στο Tavern Chat" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pt-6 pb-20 sm:py-12 px-4 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono text-purple-400 hover:text-purple-300 transition active:scale-95"
      >
        <span>←</span> Πίσω στην Αρχική
      </Link>

      {/* Main Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          📜 Όροι Χρήσης & Προϋποθέσεις
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono">
          Τελευταία ενημέρωση: Αύγουστος 2026
        </p>
      </div>

      {/* Mobile Quick Navigation Chips */}
      <div className="flex sm:hidden overflow-x-auto gap-2 no-scrollbar pb-1 -mx-4 px-4">
        {sections.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 whitespace-nowrap active:bg-purple-950/50 active:border-purple-800 transition"
          >
            {item.title}
          </a>
        ))}
      </div>

      {/* Content Cards */}
      <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base border-t border-slate-800/80 pt-6">
        {/* Section 1 */}
        <section
          id="age-restriction"
          className="scroll-mt-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 space-y-2 shadow-md backdrop-blur-sm"
        >
          <h2 className="text-base sm:text-lg font-bold text-purple-400 flex items-center gap-2">
            <span>🔞</span> 1. Ηλικιακός Περιορισμός (18+)
          </h2>
          <p className="text-xs sm:text-sm leading-normal sm:leading-relaxed text-slate-300">
            Η χρήση της πλατφόρμας{" "}
            <strong className="text-white">Tabletop Tavern</strong> επιτρέπεται{" "}
            <strong className="text-purple-300">
              αποκλειστικά και μόνο σε άτομα άνω των 18 ετών
            </strong>
            . Με την εγγραφή σας, δηλώνετε υπεύθυνα ότι είστε ενήλικος. Η
            πλατφόρμα δεν φέρει ευθύνη για ψευδείς δηλώσεις ηλικίας.
          </p>
        </section>

        {/* Section 2 */}
        <section
          id="safety"
          className="scroll-mt-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 space-y-2 shadow-md backdrop-blur-sm"
        >
          <h2 className="text-base sm:text-lg font-bold text-purple-400 flex items-center gap-2">
            <span>🛡️</span> 2. Φυσικές Συναντήσεις & Ασφάλεια
          </h2>
          <p className="text-xs sm:text-sm leading-normal sm:leading-relaxed text-slate-300">
            Το Tabletop Tavern διευκολύνει τη διοργάνωση συναντήσεων για
            επιτραπέζια παιχνίδια σε δημόσιους ή ιδιωτικούς χώρους. Οι χρήστες
            συμμετέχουν σε συναντήσεις με δική τους αποκλειστική ευθύνη.
            Συνιστούμε οι συναντήσεις να πραγματοποιούνται σε δημόσιους χώρους
            (π.χ. Board Game Cafes).
          </p>
        </section>

        {/* Section 3 */}
        <section
          id="community"
          className="scroll-mt-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 space-y-2 shadow-md backdrop-blur-sm"
        >
          <h2 className="text-base sm:text-lg font-bold text-purple-400 flex items-center gap-2">
            <span>💬</span> 3. Συμπεριφορά στο Tavern Chat
          </h2>
          <p className="text-xs sm:text-sm leading-normal sm:leading-relaxed text-slate-300">
            Απαγορεύεται αυστηρά η παρενόχληση, η ρητορική μίσους, η αποστολή
            ανεπιθύμητου περιεχομένου (spam) και η κοινοποίηση ευαίσθητων
            προσωπικών δεδομένων άλλων χρηστών.
          </p>
        </section>
      </div>

      {/* Floating Bottom Link for Mobile */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-purple-300 border border-purple-500/30 rounded-full text-xs font-mono font-semibold shadow-lg backdrop-blur-md active:scale-95 transition"
        >
          <span>←</span> Αρχική
        </Link>
      </div>
    </div>
  );
}
