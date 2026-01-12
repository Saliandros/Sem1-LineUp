/**
 * Artists Section Komponent
 * Viser Artists I like med cirkulære artiste billeder
 * Conditional rendering - vises kun hvis der er artiste i profilen
 */
export default function ArtistsSection({ artists }) {
  if (!artists || artists.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-[15px]">Artists I like</p>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {artists.slice(0, 3).map((artist) => (
            <div
              key={artist.id}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm"
            >
              <img
                src={artist.image}
                alt="Artist"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="w-12 h-12 rounded-full bg-secondary-charcoal flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm">
            +5
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
