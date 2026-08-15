import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans py-12 px-4 max-w-4xl mx-auto space-y-8">
      <Link
        href="/"
        className="text-purple-400 hover:text-purple-300 text-sm font-mono"
      >
        ← Πίσω στην Αρχική
      </Link>

      <h1 className="text-3xl sm:text-4xl font-black text-white">
        📜 Όροι Χρήσης & Προϋποθέσεις
      </h1>

      <div className="space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base border-t border-slate-800 pt-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-purple-400">
            1. Ηλικιακός Περιορισμός (18+)
          </h2>
          <p>
            Η χρήση της πλατφόρμας <strong>Tabletop Tavern</strong> επιτρέπεται{" "}
            <strong>αποκλειστικά και μόνο σε άτομα άνω των 18 ετών</strong>. Με
            την εγγραφή σας, δηλώνετε υπεύθυνα ότι είστε ενήλικος. Η πλατφόρμα
            δεν φέρει ευθύνη για ψευδείς δηλώσεις ηλικίας.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-purple-400">
            2. Φυσικές Συναντήσεις & Ασφάλεια
          </h2>
          <p>
            Το Tabletop Tavern διευκολύνει τη διοργάνωση συναντήσεων για
            επιτραπέζια παιχνίδια σε δημόσιους ή ιδιωτικούς χώρους. Οι χρήστες
            συμμετέχουν σε συναντήσεις με δική τους αποκλειστική ευθύνη.
            Συνιστούμε οι συναντήσεις να πραγματοποιούνται σε δημόσιους χώρους
            (π.χ. Board Game Cafes).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-purple-400">
            3. Συμπεριφορά στο Tavern Chat
          </h2>
          <p>
            Απαγορεύεται αυστηρά η παρενόχληση, η ρητορική μίσους, η αποστολή
            ανεπιθύμητου περιεχομένου (spam) και η κοινοποίηση ευαίσθητων
            προσωπικών δεδομένων άλλων χρηστών.
          </p>
        </section>
      </div>
    </div>
  );
}
