export async function uploadToCloudinary(file: File | string) {
  const formData = new FormData();

  // If it's a base64 string (from camera)
  if (typeof file === "string") {
    formData.append("file", file);
  } else {
    formData.append("file", file);
  }

  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "images_preset");

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "djpyy3s9u";
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary error:", data);
    throw new Error(data?.error?.message || "Upload failed");
  }

  return data;
}
