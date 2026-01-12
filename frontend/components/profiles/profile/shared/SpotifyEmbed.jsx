import { getSpotifyEmbedInfo } from "../utils/embedHelpers";

/**
 * Spotify Embed Komponent
 * Viser en Spotify embed player (track, playlist, album eller artist)
 * Justerer højden baseret på type af indhold
 */
export default function SpotifyEmbed({ spotifyUrl }) {
  const { url: embedUrl, type: embedType } = getSpotifyEmbedInfo(spotifyUrl);
  let embedHeight = "120";
  if (embedType === "playlist" || embedType === "album") embedHeight = "520";
  if (embedType === "artist") embedHeight = "400";

  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center w-full h-20 text-gray-400 border rounded bg-gray-50 dark:bg-gray-900">
        Intet embed valgt endnu
      </div>
    );
  }

  return (
    <iframe
      key={embedUrl}
      title="Spotify"
      src={embedUrl}
      width="100%"
      height={embedHeight}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-lg shadow"
    />
  );
}
