import { useMemo, useRef, useState } from "react";

export default function TagComponent({
  onChangeTags,
  availableTags,
  label = "Tags",
  name = "tags",
}) {
  /*===============================================
  =          State management           =
  ===============================================*/

  const inputRef = useRef(null);
  const [showTags, setShowTags] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [committedTags, setCommittedTags] = useState([]);

  /*===============================================
  =          Functions           =
  ===============================================*/

  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((s) => [...s, tag]);
      setQuery("");
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag) => {
    setSelectedTags((s) => s.filter((t) => t !== tag));
    inputRef.current?.focus();
  };

  const filteredTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? availableTags.filter((t) => t.toLowerCase().includes(q))
      : availableTags;
    return base.filter((t) => !selectedTags.includes(t));
  }, [query, availableTags, selectedTags]);

  const onKeyDown = (e) => {
    if (e.key === "Backspace" && !query && selectedTags.length) {
      e.preventDefault();
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const handleTags = (save = true) => {
    if (save) {
      setCommittedTags(selectedTags);
      onChangeTags?.(selectedTags); // informér parent
    } else {
      setSelectedTags(committedTags);
    }
    setShowTags(false);
    inputRef.current?.focus();
  };

  return (
    <>
      {(committedTags.length > 0 || !showTags) && (
        <div className="flex justify-between tag-section">
          <input type="hidden" name={name} value={committedTags.join(",")} />
          {committedTags.length > 0 && !showTags && (
            <div className="flex flex-wrap gap-2">
              {committedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm text-black rounded-full bg-primary-yellow"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {!showTags && (
            <button type="button" onClick={() => setShowTags(!showTags)}>
              + Add {label.toLowerCase()}
            </button>
          )}
        </div>
      )}

      {showTags && (
        <div className="flex flex-col gap-3 p-3 border rounded-lg tags-container fade-up-fast border-black/7">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 py-1 text-sm rounded-full bg-neutral-100"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeTag(tag)}
                      className="text-xs leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="font-medium">{label}</span>
              )}
            </div>

            {selectedTags.length > 0 ? (
              <button
                type="button"
                onClick={() => handleTags(true)}
                className="text-sm min-w-auto"
              >
                Done
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleTags(false);
                  setCommittedTags([]);
                  setSelectedTags([]);
                  onChangeTags?.([]);
                }}
                className="text-sm min-w-auto"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex gap-2.5 items-center">
            <div className="flex items-center w-full gap-2 rounded-full bg-input-background p-2.5 ">
              <input
                ref={inputRef}
                className="w-full px-2 color-neutral-grey"
                placeholder="Search..."
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label={`Search ${label.toLowerCase()}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1 tags">
            {filteredTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="px-3 py-2 leading-none border rounded-full border-neutral-grey tag-button text-neutral-grey"
                onClick={() => addTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
