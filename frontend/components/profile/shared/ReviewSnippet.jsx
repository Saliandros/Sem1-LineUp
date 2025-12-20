/**
 * Review Snippet Komponent
 * Viser en featured review med stjerne rating, antal reviews og review tekst
 * Bruges til at vise anmeldelser på profilen
 */
export default function ReviewSnippet({ rating, count, text }) {
  return (
    <div className="space-y-2 rounded-2xl border border-neutral-light-border bg-neutral-light-bg px-4 py-3">
      <div className="flex items-center gap-2 text-neutral-medium-gray text-sm font-medium">
        <div className="flex items-center gap-1 text-primary-yellow">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span
              key={idx}
              aria-hidden="true"
              className={
                idx < rating ? "text-primary-yellow" : "text-neutral-border"
              }
            >
              ★
            </span>
          ))}
        </div>
        <span>{count} reviews</span>
      </div>
      <p className="text-[15px] text-neutral-black leading-relaxed">
        {text || "No review added yet."}
      </p>
      <button
        type="button"
        className="text-sm text-neutral-medium-gray hover:text-neutral-black font-medium"
      >
        See more
      </button>
    </div>
  );
}
