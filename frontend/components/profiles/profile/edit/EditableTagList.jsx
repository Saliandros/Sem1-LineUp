/**
 * Editable Tag List Komponent
 * Toggle tags hvor brugeren kan vælge/fravælge tags
 * Ændrer styling baseret på om tag er valgt eller ej
 */
export default function EditableTagList({
  title,
  tags,
  selectedTags,
  onToggle,
}) {
  return (
    <div>
      <p className="mb-2 font-medium">{title}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`px-4 py-2 rounded-full text-[13px] ${
              selectedTags.includes(tag)
                ? "bg-secondary-charcoal text-white"
                : "bg-neutral-light-border text-neutral-black"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
