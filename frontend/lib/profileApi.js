// In api.js (or profileApi.js)
export async function updateProfileWithImage(profileData, imageFile = null) {
  const tokenKey = "sb-vcmpzamxviwppvorclbk-auth-token";
  const tokenData = localStorage.getItem(tokenKey);
  if (!tokenData) {
    throw new Error("No auth token found!");
  }
  const { access_token } = JSON.parse(tokenData);

  const formData = new FormData();
  Object.keys(profileData).forEach((key) =>
    formData.append(key, profileData[key])
  );
  if (imageFile) {
    formData.append("user_image", imageFile);
  }

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const response = await fetch(`${API_BASE}/api/profiles`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update profile");
  }

  return response.json(); // Or whatever success data you need
}
