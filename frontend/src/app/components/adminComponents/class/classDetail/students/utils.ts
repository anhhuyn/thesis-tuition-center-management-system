// utils.ts
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusLabel = (progressValue: number) => {
  if (progressValue >= 80) return { label: "Xuất sắc", color: "emerald" };
  if (progressValue >= 65) return { label: "Ổn định", color: "blue" };
  if (progressValue >= 50) return { label: "Trung bình", color: "amber" };
  return { label: "Yếu", color: "red" };
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "present": return "text-emerald-600 bg-emerald-50";
    case "late": return "text-amber-600 bg-amber-50";
    case "absent": return "text-red-600 bg-red-50";
    default: return "text-slate-600 bg-slate-50";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "present": return "CheckCircle";
    case "late": return "AlertCircle";
    case "absent": return "XCircle";
    default: return null;
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "present": return "Có mặt";
    case "late": return "Đi trễ";
    case "absent": return "Vắng";
    default: return status;
  }
};

export const statusColors = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};