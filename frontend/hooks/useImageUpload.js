import { useState } from "react";

export function useImageUpload() {
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      setSubmitError(`File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setSubmitError(null);
  };

  return {
    selectedImageFile,
    imagePreview,
    submitError,
    setSubmitError, // In case you need to clear it elsewhere
    handleImageChange,
  };
}
