/**
 * Collaborations Section Komponent
 * Viser Past Collaborations med cirkulære billeder af samarbejdspartnere
 * Conditional rendering - vises kun hvis der er collaborations i profilen
 */
export default function CollaborationsSection({ collaborations }) {
  if (!collaborations || collaborations.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-[15px]">Past Collaborations</p>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {collaborations.slice(0, 3).map((collab) => (
            <div
              key={collab.id}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm"
            >
              <img
                src={collab.image}
                alt="Collaborator"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="w-12 h-12 rounded-full bg-secondary-charcoal flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm">
            +14
          </div>
        </div>
        <button
          type="button"
          className="text-sm text-neutral-medium-gray hover:text-neutral-black font-medium"
        >
          See all
        </button>
      </div>
    </div>
  );
}
