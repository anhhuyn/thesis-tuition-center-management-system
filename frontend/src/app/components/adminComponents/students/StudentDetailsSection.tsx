// src/app/components/adminComponents/students/StudentDetailsSection.tsx
import { Phone, Mail, User, Calendar, MapPin, Users, FileText, Edit, Star, GraduationCap } from "lucide-react";
import type { Student } from "../../../utils/types/student";

interface StudentDetailsSectionProps {
  student: Student;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Chưa có';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const calculateAge = (birthDateStr: string) => {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const StudentDetailsSection = ({ student }: StudentDetailsSectionProps) => {
  const age = calculateAge(student.dateOfBirth);
  const birthDisplay = `${formatDate(student.dateOfBirth)}${age !== null ? ` (${age} tuổi)` : ''}`;

  const basicInfoFields = [
    { label: "HỌ VÀ TÊN", value: student.fullName, icon: User },
    { label: "NGÀY SINH", value: birthDisplay, icon: Calendar },
    { label: "EMAIL", value: student.email, icon: Mail },
    { label: "ĐỊA CHỈ", value: student.address?.details || 'Chưa cập nhật', icon: MapPin },
    { label: "TRƯỜNG", value: student.schoolName, icon: GraduationCap },
    { label: "LỚP", value: `Lớp ${student.grade}`, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            Thông tin cơ bản
          </h3>
          <button className="text-purple-600 font-medium text-sm hover:underline flex items-center gap-1">
            <Edit className="w-3 h-3" />
            Cập nhật
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {basicInfoFields.map((field, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <field.icon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 mb-1">{field.label}</div>
                <p className="font-medium text-gray-800">{field.value || 'Chưa có'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guardian Information */}
      {student.parents && student.parents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Thông tin phụ huynh
            </h3>
          </div>
          <div>
            {student.parents.map((parent, index) => (
              <div key={parent.id} className={`p-6 ${index > 0 ? 'border-t border-gray-100' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{parent.fullName}</h4>
                      <p className="text-sm text-gray-500 mb-2">{parent.relationship}</p>
                      <div className="flex flex-wrap gap-4">
                        {parent.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span className="text-sm text-gray-600">{parent.phoneNumber}</span>
                          </div>
                        )}
                        {parent.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span className="text-sm text-gray-600">{parent.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="px-2 py-1 bg-amber-100 border border-amber-200 rounded text-amber-700 font-bold text-[10px] tracking-tight whitespace-nowrap">
                      LIÊN HỆ KHẨN CẤP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Subjects */}
      {student.subjects && student.subjects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Môn học đã đăng ký
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {student.subjects.map(subject => (
                <span key={subject.id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {subject.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes – tạm thời chưa có API, giữ placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Ghi chú nội bộ
          </h3>
          <Edit className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-purple-600 transition-colors" />
        </div>
        <div className="p-6">
          <div className="bg-purple-50 rounded-lg border border-purple-100 p-4">
            <p className="text-sm text-gray-700">Chưa có ghi chú nào.</p>
          </div>
        </div>
      </div>

      {/* Documents – tạm thời chưa có API */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Tài liệu
          </h3>
          <button className="flex items-center gap-1 text-purple-600 font-medium text-sm hover:underline">
            Tải lên
          </button>
        </div>
        <div className="p-6 text-center text-gray-500">Chưa có tài liệu nào.</div>
      </div>
    </div>
  );
};