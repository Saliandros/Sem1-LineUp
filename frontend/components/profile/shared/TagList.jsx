/**
 * Tag List Komponent
 * Genbrugelig komponent til at vise tags (genres, looking for osv.)
 * Understøtter både dark og light variant
 */
export default function TagList({ title, tags, variant = "dark" }) {
  const bgColor =
    variant === "dark"
      ? "bg-secondary-charcoal text-white"
      : "bg-neutral-light-border text-neutral-black";

  return (
    <div>
      <p className="mb-2 font-semibold text-[15px]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`px-4 py-2 rounded-full text-[13px] ${bgColor}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
