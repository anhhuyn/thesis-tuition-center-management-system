// src/app/components/adminComponents/students/StudentSidebarSection.tsx
import { Award, Trophy, Star, TrendingUp, Clock, Settings, FileText, CalendarCheck, ClipboardList } from "lucide-react";
import type { Student } from "../../../utils/types/student";

interface StudentSidebarSectionProps {
  student: Student;
}

export const StudentSidebarSection = ({ student }: StudentSidebarSectionProps) => {
  // Tạm thời classifications dựa trên subjects hoặc để mock
  const classifications = [
    { icon: Award, label: "Học sinh lớp " + student.grade, bg: "bg-purple-100", border: "border-purple-200", textColor: "text-purple-700" },
  ];
  if (student.subjects && student.subjects.length > 0) {
    classifications.push({
      icon: Trophy,
      label: `${student.subjects.length} môn học`,
      bg: "bg-amber-100",
      border: "border-amber-200",
      textColor: "text-amber-700",
    });
  }

  const adminActions = [
    { label: "Xuất bảng điểm", icon: FileText },
    { label: "Cập nhật điểm danh", icon: CalendarCheck },
    { label: "Báo cáo hạnh kiểm", icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Classifications */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-xs font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-purple-600" />
          PHÂN LOẠI
        </h4>
        <div className="flex flex-wrap gap-2">
          {classifications.map((item) => (
            <div key={item.label} className={`flex items-center gap-1.5 px-3 py-1.5 ${item.bg} ${item.border} rounded-full border`}>
              <item.icon className={`w-3.5 h-3.5 ${item.textColor}`} />
              <span className={`font-semibold text-xs ${item.textColor}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance – mock */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-xs font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
          TỔNG QUAN HỌC TẬP
        </h4>
        <div className="text-center text-gray-500 text-sm">Chưa có dữ liệu điểm số</div>
        <button className="w-full mt-4 py-2.5 border border-purple-200 rounded-lg text-purple-700 font-semibold text-xs hover:bg-purple-50 transition-colors">
          Xem bảng điểm chi tiết
        </button>
      </div>

      {/* Upcoming Assignments – mock */}
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-xs font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-purple-600" />
          BÀI TẬP SẮP TỚI
        </h4>
        <div className="text-center text-gray-500 text-sm">Chưa có bài tập nào</div>
      </div>

      {/* Administrative Actions */}
      <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
        <h4 className="text-xs font-bold text-purple-700 tracking-wider mb-4 flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-purple-600" />
          THAO TÁC QUẢN TRỊ
        </h4>
        <div className="space-y-2">
          {adminActions.map((action) => (
            <button key={action.label} className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all">
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
              <action.icon className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="p-5 bg-purple-600 from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold">Thống kê nhanh</h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">Điểm trung bình</span>
            <span className="font-bold text-lg">Chưa có</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">Tỷ lệ chuyên cần</span>
            <span className="font-bold text-lg">---</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">Xếp hạng lớp</span>
            <span className="font-bold text-lg">---</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/20">
          <button className="w-full py-2 bg-white/20 rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};