// utils/fileHelpers.ts
import { FileText, File, Video, LucideIcon } from "lucide-react";

export interface FileStyle {
  icon: LucideIcon;
  iconBg: string;
  text: string;
  border: string;
}

export const getFileStyle = (type: string): FileStyle => {
  const fileType = type.toLowerCase();

  if (fileType.includes("pdf")) {
    return {
      icon: FileText,
      iconBg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-100 dark:border-red-800",
    };
  }

  if (fileType.includes("doc") || fileType.includes("docx") || fileType.includes("word")) {
    return {
      icon: File,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-800",
    };
  }

  if (fileType.includes("ppt") || fileType.includes("pptx") || fileType.includes("powerpoint")) {
    return {
      icon: File,
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-100 dark:border-orange-800",
    };
  }

  if (fileType.includes("mp4") || fileType.includes("video")) {
    return {
      icon: Video,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-100 dark:border-purple-800",
    };
  }

  if (fileType.includes("xls") || fileType.includes("xlsx")) {
    return {
      icon: File,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-800",
    };
  }

  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z")) {
    return {
      icon: File,
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-800",
    };
  }

  return {
    icon: File,
    iconBg: "bg-slate-50 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  };
};