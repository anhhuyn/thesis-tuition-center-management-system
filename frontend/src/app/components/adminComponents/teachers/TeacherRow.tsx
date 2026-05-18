// src/app/components/teachers/TeacherRow.tsx
import React from 'react';
import { MoreVertical, Edit, Mail, Award } from 'lucide-react';
import type { Teacher } from '../../../utils/types/teacher';

interface TeacherRowProps {
  teacher: Teacher;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onEdit?: (teacher: Teacher) => void;
  onClick?: (teacher: Teacher) => void;
  onEditClick?: (e: React.MouseEvent) => void;
}

// Helper to get full image URL from Vite environment variables
const getFullImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE || import.meta.env.VITE_BACKEND_URL || '';
  const cleanBaseUrl = baseUrl.replace(/\/v1\/api$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${path}`;
};

const TeacherRow: React.FC<TeacherRowProps> = ({
  teacher,
  isSelected,
  onSelect,
  onEdit,
  onClick,
  onEditClick,
}) => {
  const getStatusText = (status: boolean) => (status ? 'Đang hoạt động' : 'Ngưng hoạt động');
  const getStatusStyle = (status: boolean) =>
    status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
  const getStatusDot = (status: boolean) => (status ? 'bg-emerald-500' : 'bg-amber-500');

  const initials = teacher.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleCheckboxChange = (e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    onSelect(teacher.id, !isSelected);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) onEditClick(e);
    else onEdit?.(teacher);
  };

  const handleRowClick = () => onClick?.(teacher);

  const subject = teacher.specialty || 'Chưa phân loại';
  const department = teacher.specialty || 'Chưa phân loại';
  const experience = '';

  return (
    <tr
      className={`hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-purple-50/30' : ''}`}
      onClick={handleRowClick}
    >
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {teacher.image ? (
            <img
              src={getFullImageUrl(teacher.image) || undefined}
              alt={teacher.fullName}
              className="w-8 h-8 rounded-full ring-2 ring-purple-100 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
              {initials}
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-slate-900">{teacher.fullName}</div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Mail className="w-3 h-3" />
              {teacher.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 font-mono">GV{teacher.id}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{subject}</td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{department}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${getStatusStyle(teacher.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(teacher.status)}`} />
          {getStatusText(teacher.status)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <Award className="w-3.5 h-3.5 text-purple-500" />
          {experience || 'Chưa cập nhật'}
        </div>
      </td>
      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleEditClick} className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default TeacherRow;