// src/app/components/salary/TeacherCard.tsx
import React from 'react';
import { Edit, Trash2, User, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TeacherSubject } from '../../../utils/types/teacherSubject';

interface TeacherCardProps {
  agreement: TeacherSubject;
  onEdit: (agreement: TeacherSubject) => void;
  onDelete: (id: number) => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({ agreement, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const isActive = true; // Backend không có status riêng, coi như đang áp dụng
  const statusClass = 'bg-emerald-100 text-emerald-700';
  const statusDot = 'bg-emerald-500';

  // Trích xuất số từ chuỗi lương (vd "150,000 VNĐ/giờ")
  const hourlyRate = agreement.salaryRate.match(/(\d+(?:,\d+)*)/)?.[0].replace(/,/g, '') || '0';

  const handleViewDetail = () => {
    // Điều hướng đến trang chi tiết thỏa thuận (dùng id của agreement)
    navigate(`/admin/teacher-subject/${agreement.id}`);
  };

  return (
    <div
      className="bg-white p-6 rounded-2xl flex flex-col transition-all hover:shadow-lg relative overflow-hidden border border-gray-100 cursor-pointer"
      onClick={handleViewDetail}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          {agreement.teacherAvatar ? (
            <img
              src={agreement.teacherAvatar}
              alt={agreement.teacherName}
              className="w-12 h-12 rounded-full object-cover bg-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <User className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="font-bold text-gray-900">{agreement.teacherName}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-tighter">
              ID: GV{agreement.teacherId}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(agreement);
            }}
            className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition-colors"
            title="Sửa"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(agreement.id);
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
          {agreement.subjectName} {agreement.grade ? `(Lớp ${agreement.grade})` : ''}
        </span>
      </div>

      <div className="mt-auto">
        <div className="text-gray-500 text-xs font-medium mb-1">Mức lương thỏa thuận</div>
        <div className="text-2xl font-extrabold text-purple-600 mb-4">
          {agreement.salaryRate}
        </div>
        <div className="space-y-2 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Giờ tối đa/tháng:</span>
            <span className="font-bold text-gray-900">Chưa cập nhật</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Ngày áp dụng:</span>
            <span className="font-bold text-gray-900">{agreement.createdAt}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${statusClass}`}>
            <Circle className={`w-2 h-2 fill-current ${statusDot}`} />
            Đang áp dụng
          </span>
        </div>
      </div>
    </div>
  );
};