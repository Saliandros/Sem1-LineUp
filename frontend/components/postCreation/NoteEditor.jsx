import { useState } from "react";
import { Form, useLoaderData, useActionData } from "react-router-dom";
import TitleComponent from "./formComponents/Title";
import MediaComponent from "./formComponents/Media";
import TagComponent from "./formComponents/Tag";
import DescriptionComponent from "./formComponents/Description";
import { getCurrentUserProfile } from "../../lib/api.js";

export async function clientLoader() {
  try {
    const profile = await getCurrentUserProfile();
    return { profile };
  } catch (error) {
    console.error("Failed to load profile:", error);
    return { error: error.message, profile: null };
  }
}

export default function NoteEditor() {
  const loaderData = useLoaderData();
  const actionData = useActionData();

  const profileData = loaderData?.profile;

  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [title, setTitle] = useState("");

  const tagList = [
    "Question",
    "Concert",
    "Equipment",
    "Tutorial",
    "Music-theory",
    "Recording",
    "Guitar",
    "Singing",
    "Strings",
    "Saxophones",
    "Keys",
  ];

  return (
    <section>
      <Form
        method="post"
        action=".."
        encType="multipart/form-data"
        className="flex flex-col gap-6 px-4 pb-24"
      >
        {actionData?.error && (
          <div className="bg-red-500 text-white p-4 rounded-lg">
            <p className="font-semibold">Fejl ved oprettelse:</p>
            <p>{actionData.error}</p>
          </div>
        )}
        <input type="hidden" name="submission_target" value="posts" />

        <TagComponent
          onChangeTags={setTags}
          availableTags={tagList}
          label="Tags"
          name="tags"
        />
        <input type="hidden" name="post_tags" value={JSON.stringify(tags)} />

        <TitleComponent title={title} setTitle={setTitle} />
        <input type="hidden" name="post_title" value={title} />

        <MediaComponent onChangeFile={setFile} file={file} />
        <input
          type="file"
          name="post_image"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />

        <DescriptionComponent
          description={description}
          setDescription={setDescription}
        />
        <input type="hidden" name="post_description" value={description} />

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
