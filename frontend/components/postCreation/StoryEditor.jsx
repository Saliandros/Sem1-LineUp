import { Form } from "react-router";

export default function StoryEditor() {
  /*===============================================
=          Submit handeling           =
===============================================*/

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Something went wrong");
      const data = await response.json();
      console.log("Post created:", data);
    } catch (err) {
      console.error(err);
    }

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  };

  return (
    <section>
      <Form className="flex flex-col gap-6 px-4">
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
