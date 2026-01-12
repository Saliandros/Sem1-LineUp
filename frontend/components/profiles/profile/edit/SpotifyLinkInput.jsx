/**
 * Spotify Link Input Komponent
 * Input felt hvor brugeren kan indsætte Spotify links
 * Viser hjælpetekst om at gemme ændringer
 */
export default function SpotifyLinkInput({ value, onChange }) {
  return (
    <div className="w-full flex flex-col gap-2">
      <input
        type="text"
        placeholder="Indsæt Spotify-link (track, playlist, album, artist...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black placeholder:text-gray-400"
      />
    </div>
  );
}
