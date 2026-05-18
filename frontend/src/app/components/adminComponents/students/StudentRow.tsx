// src/app/components/students/StudentRow.tsx
import React from 'react';
import { 
  Mail, 
  School, 
  Edit, 
  Eye, 
  MoreVertical,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';
import type { Student } from '../../../utils/types/student';

// Helper to get full image URL using Vite environment variables
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE || import.meta.env.VITE_BACKEND_URL || '';
  const cleanBaseUrl = baseUrl.replace(/\/v1\/api$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${path}`;
};

interface StudentRowProps {
  student: Student;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onEdit?: (student: Student) => void;
  onClick?: (student: Student) => void;
  onView?: (student: Student) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({ 
  student, 
  isSelected, 
  onSelect, 
  onEdit, 
  onClick,
  onView 
}) => {
  const handleCheckboxChange = (e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    onSelect(student.id, !isSelected);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(student);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(student);
  };

  const handleRowClick = () => {
    onClick?.(student);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderText = (gender: boolean) => {
    return gender ? 'Nam' : 'Nữ';
  };

  const fullImageUrl = getFullImageUrl(student.image);
  const avatarStyle = fullImageUrl
    ? { backgroundImage: `url('${fullImageUrl}')` }
    : { backgroundImage: `url('https://ui-avatars.com/api/?background=8B5CF6&color=fff&name=${encodeURIComponent(student.fullName)}')` };

  return (
    <tr 
      className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-purple-50/30' : ''}`}
      onClick={handleRowClick}
    >
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full bg-center bg-cover border-2 border-white shadow-sm"
            style={avatarStyle}
          ></div>
          <div>
            <p className="text-sm font-semibold flex items-center gap-1 text-gray-900">
              {student.fullName}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {student.email}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              {student.phoneNumber}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-gray-500">SĐT: {student.phoneNumber}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(student.dateOfBirth)}
          </p>
          <p className="text-xs text-gray-500">
            {getGenderText(student.gender)}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <School className="w-3.5 h-3.5 text-gray-400" />
          Lớp {student.grade}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-700">
          {student.schoolName}
        </div>
        {student.address && student.address.details && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {student.address.details}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {student.subjects && student.subjects.length > 0 ? (
            student.subjects.slice(0, 2).map(subject => (
              <span key={subject.id} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                {subject.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">Chưa có môn</span>
          )}
          {student.subjects && student.subjects.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{student.subjects.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={handleEditClick}
            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={handleViewClick}
            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Thao tác khác"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StudentRow;