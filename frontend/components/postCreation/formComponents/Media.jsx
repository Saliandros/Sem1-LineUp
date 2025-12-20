import { useRef, useState } from "react";

export default function MediaComponent({ onChangeFile, file }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  function handleChange(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`The file is too big. Max ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      e.target.value = null;
      // Clear the file and preview when error occurs
      onChangeFile(null);
      setPreview(null);
      return;
    }

    setError(null);
    onChangeFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  return (
    <div
      className="relative cursor-pointer upload"
      onClick={() => fileInputRef.current.click()}
    >
      {error && (
        <div className="p-3 mb-2 text-sm text-red-500 border border-red-300 rounded bg-red-50">
          {error}
        </div>
      )}

      {!file && (
        <button
          type="button"
          className="px-2 py-1 text-left border rounded-full"
        >
          + Add media
        </button>
      )}

      {file && file.type.startsWith("image") && (
        <img
          src={preview}
          alt="Preview"
          className="object-cover w-full rounded max-h-65"
        />
      )}

      {file && file.type.startsWith("video") && (
        <video src={preview} controls className="max-w-full rounded max-h-65" />
      )}

      {file && (
        <div className="absolute inset-0 flex items-center justify-center text-white transition opacity-0 trans bg-black/50 hover:opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 19 19"
            fill="none"
          >
            <path
              d="M11.1903 2.81563L12.6703 1.33564C13.4513 0.554587 14.7177 0.554587 15.4987 1.33564L16.9129 2.74985C17.694 3.5309 17.694 4.79723 16.9129 5.57828L15.4329 7.05827M11.1903 2.81563L1.57464 12.4313C1.24257 12.7634 1.03794 13.2017 0.996615 13.6695L0.754529 16.4099C0.699758 17.0299 1.21863 17.5488 1.83865 17.494L4.57906 17.252C5.04687 17.2106 5.48521 17.006 5.81728 16.6739L15.4329 7.05827M11.1903 2.81563L15.4329 7.05827"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        name="media"
        hidden
        accept="image/png, image/jpeg, video/*"
        onChange={handleChange}
      />
    </div>
  );
}
