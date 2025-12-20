import { getVideoEmbedInfo } from "../utils/embedHelpers";

/**
 * Video Embed Komponent
 * Viser en video embed player for YouTube, Vimeo eller andre platforme
 * Hvis platformen ikke understøttes, vises et link i stedet
 */
export default function VideoEmbed({ videoUrl }) {
  const { url: embedUrl, valid } = getVideoEmbedInfo(videoUrl);

  if (!videoUrl) {
    return null;
  }

  // Hvis vi kan embedde videoen (YouTube eller Vimeo)
  if (valid) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ paddingBottom: "56.25%" }}
      >
        <iframe
          src={embedUrl}
          title="Video player"
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Hvis det er et almindeligt link, vis en knap
  return (
    <a
      href={embedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full px-4 py-3 bg-neutral-black text-white rounded-2xl text-center font-medium hover:bg-secondary-dark-grey transition"
    >
      Se video →
    </a>
  );
}
