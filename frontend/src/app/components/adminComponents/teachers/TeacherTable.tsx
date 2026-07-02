// src/app/components/teachers/TeacherTable.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  ChevronDown,
  Eye,
  Edit,
  Check,
  Calendar,
  School
} from 'lucide-react';
import { cn } from '../../../utils/cn';
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

// Helper to get full image URL
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE || import.meta.env.VITE_BACKEND_URL || '';
  const cleanBaseUrl = baseUrl.replace(/\/v1\/api$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${path}`;
};

// Custom Checkbox Component
const CustomCheckbox = ({
  checked,
  onChange,
  onClick,
  indeterminate = false,
  className = ""
}: {
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent) => void;
  indeterminate?: boolean;
  className?: string;
}) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onClick={onClick}
        ref={input => {
          if (input) {
            input.indeterminate = indeterminate;
          }
        }}
        className="peer appearance-none w-4 h-4 rounded-md border-2 border-slate-300 bg-white 
          checked:border-purple-600 checked:bg-purple-600 
          hover:border-purple-400 hover:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0
          transition-all duration-200 cursor-pointer
          checked:hover:bg-purple-700 checked:hover:border-purple-700"
      />
      {checked && (
        <Check
          size={10}
          className="absolute text-white pointer-events-none 
            peer-checked:opacity-100 opacity-0 transition-opacity duration-200"
          strokeWidth={3}
        />
      )}
      {indeterminate && !checked && (
        <div className="absolute w-2 h-0.5 bg-purple-600 rounded-full pointer-events-none" />
      )}
    </div>
  );
};

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
  const [expandedTeacher, setExpandedTeacher] = useState<number | null>(null);

  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = checked ? teachers.map(t => t.id) : [];
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedIds, id]
      : selectedIds.filter(selectedId => selectedId !== id);
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleEditClick = (teacher: Teacher, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTeacher?.(teacher);
  };

  const handleViewClick = (teacher: Teacher, e: React.MouseEvent) => {
    e.stopPropagation();
    onViewTeacher?.(teacher);
  };

  const handleRowClick = (teacher: Teacher) => {
    onViewTeacher?.(teacher);
  };

  const toggleExpand = (teacherId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
  };

  const getStatusText = (status: boolean) => status ? 'Đang hoạt động' : 'Ngưng hoạt động';
  const getStatusStyle = (status: boolean) =>
    status
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';
  const getStatusDot = (status: boolean) => (status ? 'bg-emerald-500' : 'bg-amber-500');

  const getFullImageUrlFn = (teacher: Teacher) => {
    if (teacher.image) {
      const url = getFullImageUrl(teacher.image);
      return url ? `url('${url}')` : '';
    }
    const initials = teacher.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return `url('https://ui-avatars.com/api/?background=8B5CF6&color=fff&name=${encodeURIComponent(initials)}')`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const allSelected = teachers.length > 0 && selectedIds.length === teachers.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < teachers.length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">
            Danh sách giáo viên
          </span>
          <span className="text-xs text-slate-400">({total})</span>
        </div>

        {teachers.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium cursor-pointer select-none">
              Chọn tất cả
            </label>
            <CustomCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </div>
        )}
      </div>

      {/* Teachers Grid/Cards */}
      <div className="p-4 space-y-2">
        {teachers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Không có dữ liệu giáo viên</p>
          </div>
        ) : (
          <AnimatePresence>
            {teachers.map((teacher, idx) => {
              const isExpanded = expandedTeacher === teacher.id;
              const avatarStyle = getFullImageUrlFn(teacher);
              const isSelected = selectedIds.includes(teacher.id);
              const subject = teacher.specialty || 'Chưa phân loại';

              return (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  onClick={() => handleRowClick(teacher)}
                  className={cn(
                    "group flex flex-col p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-purple-300 bg-purple-50/50 shadow-sm"
                      : "border-slate-100 bg-white hover:shadow-md hover:border-slate-200"
                  )}
                >
                  {/* Main row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Custom Checkbox */}
                      <CustomCheckbox
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(teacher.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full bg-center bg-cover border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundImage: avatarStyle }}
                      />

                      {/* Teacher Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {teacher.fullName}
                          </p>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 flex-shrink-0">
                            {subject}
                          </span>
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 border",
                            getStatusStyle(teacher.status)
                          )}>
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(teacher.status)}`} />
                              {getStatusText(teacher.status)}
                            </span>
                          </span>
                        </div>

                        {/* Contact Info - Added Date of Birth */}
                        <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Mail size={11} className="text-slate-400 flex-shrink-0" />
                            <span className="text-[11px] text-slate-600 truncate max-w-[150px]">
                              {teacher.email}
                            </span>
                          </div>
                          {teacher.phoneNumber && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={11} className="text-slate-400 flex-shrink-0" />
                              <span className="text-[11px] text-slate-600">
                                {teacher.phoneNumber}
                              </span>
                            </div>
                          )}
                          {teacher.dateOfBirth && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={11} className="text-slate-400 flex-shrink-0" />
                              <span className="text-[11px] text-slate-600">
                                {formatDate(teacher.dateOfBirth)}
                              </span>
                            </div>
                          )}
                          
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      {/* Removed Experience section */}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleViewClick(teacher, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleEditClick(teacher, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => toggleExpand(teacher.id, e)}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            isExpanded
                              ? "text-purple-500 bg-purple-50"
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          )}
                          title="Xem thêm"
                        >
                          <ChevronDown
                            size={14}
                            className={cn(
                              "transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content - Removed Experience, kept others */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* Address */}
                          {teacher.address && (
                            <div className="flex items-start gap-2">
                              <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            
                            </div>
                          )}

                          {/* Specialty/Subjects */}
                          {teacher.specialty && (
                            <div className="flex items-start gap-2">
                              <BookOpen size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[10px] font-medium text-slate-500">Chuyên môn</p>
                                <p className="text-xs text-slate-700">{teacher.specialty}</p>
                              </div>
                            </div>
                          )}

                          {/* Date of Birth */}
                          {teacher.dateOfBirth && (
                            <div className="flex items-start gap-2">
                              <Calendar size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[10px] font-medium text-slate-500">Ngày sinh</p>
                                <p className="text-xs text-slate-700">
                                  {formatDate(teacher.dateOfBirth)}
                                </p>
                              </div>
                            </div>
                          )}

                         
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/30">
          <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            Hiển thị {teachers.length} trên {total} giáo viên
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trước</span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all min-w-[28px]",
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-purple-300'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTable;