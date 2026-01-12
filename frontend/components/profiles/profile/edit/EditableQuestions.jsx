/**
 * Editable Questions Komponent
 * Liste af foruddefinerede spørgsmål med redigerbare svar
 * Viser spørgsmål som read-only og tillader brugeren at redigere svar
 */
export default function EditableQuestions({ questions, onChange }) {
  const handleAnswerChange = (id, answer) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, answer } : q)));
  };

  return (
    <div className="space-y-3">
      <p className="font-medium">Questions</p>
      <div className="space-y-4">
        {questions.map((item) => (
          <div key={item.id} className="space-y-1">
            <p className="text-[14px] font-semibold text-neutral-black">
              {item.question}
            </p>
            <input
              type="text"
              value={item.answer}
              onChange={(e) => handleAnswerChange(item.id, e.target.value)}
              className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black"
              placeholder="Your answer..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}
