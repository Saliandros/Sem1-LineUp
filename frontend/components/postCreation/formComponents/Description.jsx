import { useState } from "react";

export default function DescriptionComponent({ setDescription, description }) {
  const [isEditingDesciption, setIsEditingDesciption] = useState(true);

  return (
    <div
      className={`flex items-start align-top gap-2 transition-colors duration-200 ease-in-out ${
        isEditingDesciption ? "bg-input-background" : "bg-input-background/0"
      }`}
    >
      {isEditingDesciption ? (
        <textarea
          className="relative w-full p-3 align-top pr-14 h-50 placeholder:text-gray-400"
          type="text"
          name="description"
          value={description}
          placeholder="Write a description"
          onChange={(e) => setDescription(e.target.value)}
        />
      ) : (
        <div className="w-full overflow-hidden">
          <h3 className="max-w-full p-3 text-black break-words pr-14">
            {description}
          </h3>
          <input type="hidden" name="description" value={description} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsEditingDesciption(!isEditingDesciption)}
        className="absolute py-3 right-9 text-neutral-grey"
        disabled={!description.trim()}
      >
        {isEditingDesciption ? "Done" : "Edit"}
      </button>
    </div>
  );
}
