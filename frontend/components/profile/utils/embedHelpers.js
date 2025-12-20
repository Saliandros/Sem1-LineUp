/**
 * Konverterer et Spotify link eller URI til embed format
 * @param {string} input - Spotify URL eller URI (f.eks. https://open.spotify.com/track/xyz eller spotify:track:xyz)
 * @returns {object} - { url: embed URL, type: track/playlist/album/artist }
 */
export function getSpotifyEmbedInfo(input) {
  if (!input) return { url: "", type: "" };
  let type = "";
  let id = "";
  try {
    const url = new URL(input);
    if (url.hostname.includes("spotify.com")) {
      const match = url.pathname.match(
        /^\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)(?:\?.*)?$/
      );
      if (match) {
        type = match[1];
        id = match[2];
        return { url: `https://open.spotify.com/embed/${type}/${id}`, type };
      }
    }
  } catch {
    if (input.startsWith("spotify:")) {
      const parts = input.split(":");
      if (parts.length >= 3) {
        type = parts[1];
        id = parts[2];
        return { url: `https://open.spotify.com/embed/${type}/${id}`, type };
      }
    }
  }
  return { url: "", type: "" };
}

/**
 * Konverterer et video link til embed format
 * Understøtter YouTube, Vimeo og andre video platforme
 * @param {string} input - Video URL (f.eks. https://www.youtube.com/watch?v=xyz eller https://vimeo.com/123456)
 * @returns {object} - { url: embed URL, type: youtube/vimeo/other, valid: boolean }
 */
export function getVideoEmbedInfo(input) {
  if (!input) return { url: "", type: "other", valid: false };

  try {
    const url = new URL(input);

    // YouTube detection
    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtu.be")
    ) {
      let videoId = "";

      // Standard YouTube URL: youtube.com/watch?v=VIDEO_ID
      if (url.hostname.includes("youtube.com") && url.searchParams.has("v")) {
        videoId = url.searchParams.get("v");
      }
      // Short YouTube URL: youtu.be/VIDEO_ID
      else if (url.hostname.includes("youtu.be")) {
        videoId = url.pathname.slice(1);
      }

      if (videoId) {
        return {
          url: `https://www.youtube.com/embed/${videoId}`,
          type: "youtube",
          valid: true,
        };
      }
    }

    // Vimeo detection
    if (url.hostname.includes("vimeo.com")) {
      const match = url.pathname.match(/\/(\d+)/);
      if (match && match[1]) {
        return {
          url: `https://player.vimeo.com/video/${match[1]}`,
          type: "vimeo",
          valid: true,
        };
      }
    }

    // Andre video links
    return { url: input, type: "other", valid: false };
  } catch {
    return { url: input, type: "other", valid: false };
  }
}
