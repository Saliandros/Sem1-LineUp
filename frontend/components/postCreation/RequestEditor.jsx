/**
 * RequestEditor.jsx - Create Request Post Component
 * ==================================================
 * FORMÅL: Form til at oprette et "request" post
 * 
 * HVAD ER EN REQUEST?
 * En type post hvor user søger noget specifikt:
 * - Musiker søger producer
 * - Band søger venue
 * - Søger samarbejdspartner
 * Etc.
 * 
 * FORM FIELDS:
 * - Titel (required)
 * - Beskrivelse (required)
 * - Genres (mindst én required)
 * - Lokation/Address (required)
 * - Medie/fil (optional)
 * - Toggle for noget? (pt. ikke brugt)
 * 
 * VALIDATION:
 * Client-side validation før submit:
 * - Tjek for tomme required felter
 * - Vis fejl besked øverst på siden
 * - Prevent submit hvis validation fejler
 * 
 * REACT ROUTER FORM:
 * Bruger React Router's <Form> component:
 * - method="post" → Trigger action function
 * - action=".." → Parent route's action
 * - encType="multipart/form-data" → For fil upload
 * 
 * CLIENTLOADER:
 * Henter current user profile data:
 * - For at vise hvem der opretter
 * - Kunne bruges til pre-fill felter
 * - React Router 7 pattern: clientLoader (ikke server loader)
 * 
 * CONTROLLED INPUTS:
 * Alle felter er controlled via useState:
 * - title, description, genres, address, file, toggled
 * - Giver fuld kontrol over form state
 * - Nemmere at validere før submit
 * 
 * GENRE LIST:
 * Hardcoded liste af 30+ genres:
 * - Pop, Rock, Jazz, Electronic, etc.
 * - Multiselect via TagComponent
 * - Kunne udvides til database fetch
 * 
 * FLOW:
 * User udfylder → Validation → Submit → Parent action → API call → Navigate
 * 
 * LAVET AF: Jimmi Larsen & Mikkel Ruby
 */

import { useState } from "react";
import { Form, useLoaderData, useActionData } from "react-router-dom";
import TitleComponent from "./formComponents/Title";
import MediaComponent from "./formComponents/Media";
import DescriptionComponent from "./formComponents/Description";
import TagComponent from "./formComponents/Tag";
import AddressComponent from "./formComponents/Adress";
import Switch from "../ui/Switch";
import { getCurrentUserProfile } from "../../lib/api";

// CLIENTLOADER: Hent current user profile
// React Router 7 pattern - kører client-side, ikke server
export async function clientLoader() {
  try {
    const profile = await getCurrentUserProfile();
    return { profile };
  } catch (error) {
    console.error("Failed to load profile:", error);
    return { error: error.message, profile: null };
  }
}

export default function RequestEditor() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const profileData = loaderData?.profile;

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState([]);
  const [address, setAddress] = useState("");
  const [toggled, setToggled] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    // Clear previous validation error
    setValidationError("");

    // Validate required fields
    const missing = [];
    if (!title || title.trim().length === 0) missing.push("Titel");
    if (!description || description.trim().length === 0) missing.push("Beskrivelse");
    if (!genres || genres.length === 0) missing.push("Mindst én genre");
    if (!address || address.trim().length === 0) missing.push("Lokation");

    if (missing.length > 0) {
      e.preventDefault();
      setValidationError(`Manglende felter: ${missing.join(", ")}`);
      window.scrollTo(0, 0);
      return;
    }
  };

  const genreList = [
    "Pop",
    "Rock",
    "Hip-Hop",
    "Rap",
    "R&B",
    "Soul",
    "Funk",
    "Jazz",
    "Blues",
    "Classical",
    "Electronic",
    "Dance",
    "House",
    "Techno",
    "Trance",
    "Ambient",
    "Experimental",
    "Folk",
    "Country",
    "Reggae",
    "Dub",
    "Ska",
    "Metal",
    "Punk",
    "Alternative",
    "Indie",
    "Grunge",
    "Gospel",
    "Christian",
    "World",
    "Latin",
    "Afro",
    "K-Pop",
    "J-Pop",
  ];

  return (
    <section>
      <Form
        method="post"
        action=".."
        encType="multipart/form-data"
        className="flex flex-col gap-6 px-4 pb-24"
        onSubmit={handleSubmit}
      >
        {(actionData?.error || validationError) && (
          <div className="bg-red-500 text-white p-4 rounded-lg">
            <p className="font-semibold">Fejl ved oprettelse:</p>
            <p>{validationError || actionData.error}</p>
          </div>
        )}
        <input type="hidden" name="submission_target" value="collaborations" />

        <TitleComponent title={title} setTitle={setTitle} />
        <input type="hidden" name="collab_title" value={title} />

        <MediaComponent onChangeFile={setFile} file={file} />
        <input
          type="file"
          name="collab_image"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />

        <DescriptionComponent
          description={description}
          setDescription={setDescription}
        />
        <input type="hidden" name="collab_description" value={description} />

        <TagComponent
          onChangeTags={setGenres}
          availableTags={genreList}
          label="Genres"
          name="genres"
        />
        <input
          type="hidden"
          name="collab_genres"
          value={JSON.stringify(genres)}
        />

        <AddressComponent address={address} setAddress={setAddress} />
        <input type="hidden" name="collab_location" value={address} />

        <Switch isOn={toggled} handleToggle={() => setToggled(!toggled)} />
        <input
          type="hidden"
          name="collab_paid"
          value={toggled ? "true" : "false"}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="py-2 leading-none rounded-full primary-btn bg-primary-yellow px-9 w-fit"
          >
            Post
          </button>
        </div>
      </Form>
    </section>
  );
}
