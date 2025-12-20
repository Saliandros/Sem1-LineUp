/**
 * Editable Videos Komponent
 * Redigerbare video links med tilføj/fjern funktionalitet
 * Understøtter YouTube, Vimeo og andre video platforme
 * Brugeren kan tilføje flere videoer eller fjerne eksisterende
 */
export default function EditableVideos({ videos, onChange }) {
  const handleRemove = (id) => {
    onChange(videos.filter((v) => v.id !== id));
  };

  const handleAdd = () => {
    const newId =
      videos.length > 0 ? Math.max(...videos.map((v) => v.id)) + 1 : 1;
    onChange([...videos, { id: newId, url: "" }]);
  };

  const handleUrlChange = (id, url) => {
    onChange(videos.map((v) => (v.id === id ? { ...v, url } : v)));
  };

  return (
    <div className="space-y-3">
      <p className="font-medium">Videos</p>

      <div className="space-y-3">
        {videos.map((video, index) => (
          <div key={video.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-medium-gray">
                Video {index + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(video.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Fjern
              </button>
            </div>
            <input
              type="url"
              placeholder="Video URL (YouTube, Vimeo, etc.)"
              value={video.url}
              onChange={(e) => handleUrlChange(video.id, e.target.value)}
              className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg focus:outline-none focus:ring-2 focus:ring-neutral-black"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full py-2.5 rounded-2xl border-2 border-dashed border-neutral-border text-neutral-medium-gray hover:border-neutral-black hover:text-neutral-black font-medium text-[14px] transition"
      >
        + Tilføj video
      </button>
    </div>
  );
}
