import VideoEmbed from "../shared/VideoEmbed";

/**
 * Videos Section Komponent
 * Viser video embeds (YouTube, Vimeo osv.)
 * Conditional rendering - vises kun hvis der er videoer i profilen
 */
export default function VideosSection({ videos }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-[15px]">Videos</p>
      <div className="space-y-3">
        {videos.map((video) => (
          <div key={video.id}>
            <VideoEmbed videoUrl={video.url} />
          </div>
        ))}
      </div>
    </div>
  );
}
