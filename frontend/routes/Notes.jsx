import { useState, useEffect } from "react";
import { Link } from "react-router";
import ProfileHeader from "../components/profiles/profile/sections/ProfileHeader";

/**
 * NotesScreen - Notes side
 * Viser og gemmer brugerens noter om profilen
 */
export default function NotesScreen() {
  const [notes, setNotes] = useState("");

  // Load notes fra localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("profileNotes");
    if (stored) {
      setNotes(stored);
    }
  }, []);

  // Auto-save notes når de ændres
  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("profileNotes", newNotes);
    }
  };

  return (
    <div className="flex justify-center items-center bg-neutral-light-gray p-4">
      {/* MOBIL LAYOUT CONTAINER */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b from-neutral-light-gray to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-neutral-light-gray to-transparent" />

        <div className="flex flex-col gap-3.5 h-full overflow-y-auto scroll-smooth">
          {/* Profile Header */}
          <ProfileHeader />

          {/* Notes Tab */}
          <section>
            <div className="px-6 pt-4 pb-5 bg-white shadow-sm rounded-4xl">
              {/* Tab Navigation */}
              <div className="flex items-center justify-center gap-10 mb-4 text-[15px]">
                <Link to="/profile">
                  <button className="pb-1 text-gray-400">About</button>
                </Link>
                <div className="h-5 w-px bg-gray-300"></div>
                <Link to="/notes">
                  <button className="font-semibold text-neutral-black border-b-2 border-neutral-black pb-1">
                    Notes
                  </button>
                </Link>
              </div>

              {/* Notes Content */}
              <div className="space-y-3 text-left">
                <p className="text-[14px] text-neutral-medium-gray">
                  Dine noter om denne profil
                </p>
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  rows={10}
                  placeholder="Skriv dine noter her..."
                  className="w-full rounded-2xl border border-neutral-border px-4 py-2.5 text-[14px] bg-neutral-light-bg resize-none focus:outline-none focus:ring-2 focus:ring-neutral-black"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
