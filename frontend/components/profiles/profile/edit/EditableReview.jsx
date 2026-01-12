import { useState } from "react";

/**
 * Editable Review Komponent
 * Redigerbar review med stjerne rating, antal reviews og tekst
 * Tillader brugeren at klikke på stjerner for at ændre rating
 * Inkluderer "See more/less" funktionalitet for lang tekst
 */
export default function EditableReview({
  rating,
  count,
  text,
  onRatingChange,
  onCountChange,
  onTextChange,
}) {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="space-y-3">
      <p className="font-medium">Featured review</p>
      <div className="space-y-2 rounded-2xl border border-neutral-light-border bg-neutral-light-bg px-4 py-3">
        <div className="flex items-center gap-3 text-sm text-neutral-medium-gray">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onRatingChange(idx + 1)}
                className={`text-[18px] ${
                  idx < rating ? "text-primary-yellow" : "text-neutral-border"
                }`}
                aria-label={`Set rating to ${idx + 1}`}
              >
                ★
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1">
            <span>Reviews</span>
            <input
              type="number"
              min="0"
              value={count}
              onChange={(e) =>
                onCountChange(Math.max(0, Number(e.target.value) || 0))
              }
              className="w-20 rounded-lg border border-neutral-border px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-black"
            />
          </label>
        </div>

        <textarea
          rows={4}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className={`w-full rounded-xl border border-neutral-border px-3 py-2 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-neutral-black resize-none ${
            showFull
              ? "max-h-[320px] overflow-y-auto"
              : "max-h-24 overflow-hidden"
          }`}
          placeholder="Write a featured review"
        />
        <button
          type="button"
          onClick={() => setShowFull((prev) => !prev)}
          className="text-sm text-neutral-medium-gray hover:text-neutral-black font-medium self-start"
        >
          {showFull ? "See less" : "See more"}
        </button>
      </div>
    </div>
  );
}
