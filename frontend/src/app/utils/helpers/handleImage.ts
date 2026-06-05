// Hàm lấy chữ cái đại diện 
export const getInitials = (name?: string): string => {
  if (!name || name === "Chưa có") return "?";
  const words = name.trim().split(" ");
  const lastName = words[words.length - 1];
  return lastName.slice(0, 2).toUpperCase();
};

export const getImageSrc = (image?: string | null): string | null => {
  if (!image) return null;

  if (image.startsWith("http")) return image;

  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE.replace(/\/$/, "");
  const imagePath = image.replace(/^\//, "");

  return `${baseUrl}/${imagePath}`;
};