// src/app/components/adminComponents/students/StudentProfileHeaderSection.tsx
import { ArrowLeft, Pencil, Phone, MoreVertical, Mail, User, GraduationCap, Calendar, MapPin } from "lucide-react";

interface StudentProfileHeaderSectionProps {
  onBack?: () => void;
  studentName?: string;
  studentId?: string;
  studentClass?: string;
  studentStatus?: string;
  studentAvatar?: string;
  studentEmail?: string;
  studentPhone?: string;
  enrollmentDate?: string;
}

export const StudentProfileHeaderSection = ({
  onBack,
  studentName = "Học sinh",
  studentId = "#---",
  studentClass = "Chưa có lớp",
  studentStatus = "Đang học",
  studentAvatar,
  studentEmail = "",
  studentPhone = "",
  enrollmentDate = "",
}: StudentProfileHeaderSectionProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Đang học':
        return 'bg-emerald-100 border-emerald-200 text-emerald-700';
      case 'Bảo lưu':
        return 'bg-amber-100 border-amber-200 text-amber-700';
      case 'Đã thôi học':
        return 'bg-red-100 border-red-200 text-red-700';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-700';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Chưa có';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-5">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                {studentAvatar ? (
                  <img src={studentAvatar} alt={studentName} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">{studentName}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider border ${getStatusStyle(studentStatus)}`}>
                    {studentStatus}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Mã số: {studentId}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-sm text-gray-500">{studentClass}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-purple-300 transition-all">
              <Pencil className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Chỉnh sửa</span>
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-6 py-3 text-sm">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">Năm học: 2024-2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">Nhập học: {formatDate(enrollmentDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">{studentEmail || 'Chưa có email'}</span>
            </div>
            {studentPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600">{studentPhone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};