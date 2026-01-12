/**
 * Questions Section Komponent
 * Viser Q&A sektion med spørgsmål og svar + "Ask me a question" input felt
 * Conditional rendering - vises kun hvis der er spørgsmål i profilen
 */
export default function QuestionsSection({ questions }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-[15px]">Questions</p>

      {/* Liste af spørgsmål og svar */}
      <div className="space-y-4">
        {questions.map((item) => (
          <div key={item.id} className="space-y-1">
            <p className="text-[14px] font-semibold text-neutral-black">
              {item.question}
            </p>
            <p className="text-[14px] text-neutral-medium-gray">
              {item.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Ask me a question input felt */}
      <div className="pt-3 border-t border-neutral-light-border">
        <p className="font-semibold text-[15px] mb-2">Ask me a question</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your question here..."
            className="flex-1 rounded-full border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black"
          />
          <button
            type="button"
            className="w-12 h-12 rounded-full bg-secondary-charcoal flex items-center justify-center text-white hover:bg-secondary-cyan transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
