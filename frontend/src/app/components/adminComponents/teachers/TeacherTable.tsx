// src/app/components/teachers/TeacherTable.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import TeacherRow from './TeacherRow';
import type { Teacher } from '../../../utils/types/teacher';

interface TeacherTableProps {
  teachers: Teacher[];
  loading?: boolean;
  total?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSelectionChange?: (selectedIds: number[]) => void;
  onEditTeacher?: (teacher: Teacher) => void;
  onViewTeacher?: (teacher: Teacher) => void;
}

const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  loading = false,
  total = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSelectionChange,
  onEditTeacher,
  onViewTeacher,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = checked ? teachers.map(t => t.id) : [];
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelectedIds = checked ? [...selectedIds, id] : selectedIds.filter(selectedId => selectedId !== id);
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleRowClick = (teacher: Teacher) => onViewTeacher?.(teacher);
  const handleEditClick = (teacher: Teacher, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTeacher?.(teacher);
  };

  const allSelected = teachers.length > 0 && selectedIds.length === teachers.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < teachers.length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-2 text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => { if (input) input.indeterminate = someSelected; }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Giáo viên</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mã số</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Môn học</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Khoa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kinh nghiệm</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Không có dữ liệu giáo viên</td>
              </tr>
            ) : (
              teachers.map(teacher => (
                <TeacherRow
                  key={teacher.id}
                  teacher={teacher}
                  isSelected={selectedIds.includes(teacher.id)}
                  onSelect={handleSelectRow}
                  onEdit={onEditTeacher}
                  onClick={handleRowClick}
                  onEditClick={(e) => handleEditClick(teacher, e)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            Hiển thị {teachers.length} trên {total} giáo viên
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Trước
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-purple-50 hover:border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Sau <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTable;