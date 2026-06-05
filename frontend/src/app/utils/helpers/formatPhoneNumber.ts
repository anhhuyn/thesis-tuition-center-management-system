export const formatPhoneNumber = (phone?: string | null): string => {
  if (!phone) return "Chưa cập nhật";

  const cleaned = phone.replace(/\D/g, "");

  return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
};