import { useState } from "react";

export default function TitleComponent({ setTitle, title }) {
  const [isEditingTitle, setIsEditingTitle] = useState(true);

  return (
    <div
      className={`flex items-center gap-2 transition-colors duration-200 ease-in-out ${
        isEditingTitle ? "bg-input-background" : "bg-input-background/0"
      }`}
    >
      {isEditingTitle ? (
        <input
          className="relative w-full p-3"
          type="text"
          value={title}
          name="title"
          placeholder="Write a title"
          onChange={(e) => setTitle(e.target.value)}
        />
      ) : (
        <>
          <h3 className="w-full p-3 text-black">{title}</h3>
          <input type="hidden" name="title" value={title} />
        </>
      )}

      <button
        type="button"
        onClick={() => setIsEditingTitle(!isEditingTitle)}
        className="absolute right-[36px] text-neutral-grey"
        disabled={!title.trim()}
      >
        {isEditingTitle ? "Done" : "Edit"}
      </button>
    </div>
  );
}
