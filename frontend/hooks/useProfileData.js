import { useEffect, useState } from "react";

const STORAGE_KEY = "profileData";

/**
 * Custom Hook til profil data management
 * Håndterer al state og localStorage logik
 * Kan bruges i både EditProfile og profile.jsx
 */
export function useProfileData() {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("Singer-songwriter, guitarist");
  const [about, setAbout] = useState(
    "Music is my way of feeling everything at once and turning it into something that connects people."
  );
  const [lookingFor, setLookingFor] = useState([
    "Band",
    "Jam Sessions",
    "New Friends",
  ]);
  const [genres, setGenres] = useState(["Indie", "Pop", "Acoustic"]);
  const [spotifyUrl, setSpotifyUrl] = useState(
    "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
  );
  const [reviewRating, setReviewRating] = useState(4);
  const [reviewCount, setReviewCount] = useState(36);
  const [reviewText, setReviewText] = useState(
    "Freja's music feels like a late-night conversation you didn't know you needed — tender, nostalgic, and full of quiet strength. Her sound drifts somewhere between dream and reality, and you can't help but get lost in it. – Anna"
  );

  const [artists, setArtists] = useState([
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1445375011782-2f028d6e4365?auto=format&fit=crop&w=200&q=80",
    },
  ]);

  const [videos, setVideos] = useState([
    { id: 1, url: "" },
    { id: 2, url: "" },
  ]);

  const [collaborations, setCollaborations] = useState([
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
  ]);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "What do you do when you're not making music?",
      answer: "Skate / Read / Cook / Scroll TikTok for inspiration 😂",
    },
    {
      id: 2,
      question: "What's your go-to comfort song?",
      answer: '"Good News" – Mac Miller',
    },
    { id: 3, question: "Hidden talent?", answer: "Make a mean grilled cheese" },
    {
      id: 4,
      question: "Biggest musical influence?",
      answer: "My grandma's vinyl collection",
    },
    {
      id: 5,
      question: "One thing on your bucket list?",
      answer: "Play a rooftop show",
    },
  ]);

  // Load data fra localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
        if (parsed.headline) setHeadline(parsed.headline);
        if (parsed.about) setAbout(parsed.about);
        if (Array.isArray(parsed.lookingFor)) setLookingFor(parsed.lookingFor);
        if (Array.isArray(parsed.genres)) setGenres(parsed.genres);
        if (parsed.spotifyUrl) setSpotifyUrl(parsed.spotifyUrl);
        if (parsed.reviewRating) setReviewRating(parsed.reviewRating);
        if (parsed.reviewCount) setReviewCount(parsed.reviewCount);
        if (parsed.reviewText) setReviewText(parsed.reviewText);
        if (Array.isArray(parsed.artists)) setArtists(parsed.artists);
        if (Array.isArray(parsed.videos)) setVideos(parsed.videos);
        if (Array.isArray(parsed.collaborations))
          setCollaborations(parsed.collaborations);
        if (Array.isArray(parsed.questions)) setQuestions(parsed.questions);
      } catch {
        // ignore
      }
    }
  }, []);

  // Helper function til at toggle items i arrays
  function toggleItem(list, value, setList) {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  }

  // Gem alt data til localStorage
  function saveProfile() {
    const data = {
      name,
      headline,
      about,
      lookingFor,
      genres,
      spotifyUrl: spotifyUrl.trim(),
      reviewRating,
      reviewCount,
      reviewText,
      artists,
      videos,
      collaborations,
      questions,
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    return data;
  }

  return {
    // State values
    name,
    headline,
    about,
    lookingFor,
    genres,
    spotifyUrl,
    reviewRating,
    reviewCount,
    reviewText,
    artists,
    videos,
    collaborations,
    questions,
    // Setters
    setName,
    setHeadline,
    setAbout,
    setLookingFor,
    setGenres,
    setSpotifyUrl,
    setReviewRating,
    setReviewCount,
    setReviewText,
    setArtists,
    setVideos,
    setCollaborations,
    setQuestions,
    // Helper functions
    toggleItem,
    saveProfile,
  };
}
