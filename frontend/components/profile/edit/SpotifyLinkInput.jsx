/**
 * Spotify Link Input Komponent
 * Input felt hvor brugeren kan indsætte Spotify links
 * Viser hjælpetekst om at gemme ændringer
 */
export default function SpotifyLinkInput({ value, onChange }) {
  return (
    <div className="w-full flex flex-col items-center gap-2">
      <input
        type="text"
        placeholder="Indsæt Spotify-link (track, playlist, album, artist...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border px-3 py-2 text-base shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <p className="text-xs text-neutral-dark-gray">
        Gemmer når du trykker Save nederst.
      </p>
    </div>
  );
}
