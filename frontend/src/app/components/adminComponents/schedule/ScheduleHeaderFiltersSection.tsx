// ScheduleHeaderFiltersSection.tsx
import { useState } from "react";
import { DoorOpen, GraduationCap } from "lucide-react";

interface ScheduleHeaderFiltersSectionProps {
  currentDate?: Date; // Cho phép undefined
  onViewChange?: (view: "tuan" | "ngay") => void;
  activeView?: "tuan" | "ngay";
}

export const ScheduleHeaderFiltersSection = ({ 
  currentDate = new Date(), // Giá trị mặc định là ngày hiện tại
  onViewChange,
  activeView: propActiveView 
}: ScheduleHeaderFiltersSectionProps) => {
  const [internalActiveView, setInternalActiveView] = useState<"tuan" | "ngay">("ngay");
  
  const activeView = propActiveView !== undefined ? propActiveView : internalActiveView;

  const handleViewChange = (view: "tuan" | "ngay") => {
    if (propActiveView !== undefined) {
      onViewChange?.(view);
    } else {
      setInternalActiveView(view);
    }
  };

  // Thêm kiểm tra an toàn
  const formatDisplayDate = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Đang cập nhật...";
    }
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const formatDisplayDateWithCapitalize = (date: Date): string => {
    const formatted = formatDisplayDate(date);
    if (formatted === "Đang cập nhật...") return formatted;
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-3xl font-extrabold text-indigo-950">
          Lịch học chi tiết
        </h1>
        <p className="text-base font-medium text-violet-900 mt-2">
          {formatDisplayDateWithCapitalize(currentDate)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle */}
        <div className="flex p-1 bg-violet-100 rounded-lg">
          <button
            className={`px-4 py-1.5 rounded-md ${
              activeView === "tuan" ? "bg-white shadow" : ""
            }`}
            onClick={() => handleViewChange("tuan")}
          >
            <span
              className={`text-sm ${
                activeView === "tuan"
                  ? "font-semibold text-violet-700"
                  : "text-violet-900"
              }`}
            >
              Tuần
            </span>
          </button>

          <button
            className={`px-4 py-1.5 rounded-md ${
              activeView === "ngay" ? "bg-white shadow" : ""
            }`}
            onClick={() => handleViewChange("ngay")}
          >
            <span
              className={`text-sm ${
                activeView === "ngay"
                  ? "font-semibold text-violet-700"
                  : "text-violet-900"
              }`}
            >
              Ngày
            </span>
          </button>
        </div>

        <div className="w-px h-8 bg-violet-200/30" />
      </div>
    </div>
  );
};