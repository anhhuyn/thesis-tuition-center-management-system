// src/app/components/students/StudentToolbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Download,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { studentApi } from '../../../utils/api';

interface StudentToolbarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onAddStudent?: () => void;
  // Thêm props để nhận filter hiện tại từ cha (nếu cần đồng bộ)
  currentFilters?: {
    grade?: string;
    status?: string;
    gender?: string;
    school?: string;
  };
}

const StudentToolbar: React.FC<StudentToolbarProps> = ({
  onSearch,
  onFilterChange,
  selectedCount,
  onBulkAction,
  onAddStudent,
  currentFilters
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Thêm state và useEffect để load schools
  const [schools, setSchools] = useState<string[]>([]);

  useEffect(() => {
  const fetchSchools = async () => {
    try {
      const data = await studentApi.getSchools();
      console.log('Raw data from getSchools:', data);
      console.log('Is array?', Array.isArray(data));
      setSchools(Array.isArray(data) ? data : []);
      console.log('Schools state after set:', schools); // vẫn là giá trị cũ do closure
    } catch (error) {
      console.error('Failed to load schools:', error);
      setSchools([]);
    }
  };
  fetchSchools();
}, []);
  // State cho các bộ lọc
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');

  // Đồng bộ filter từ props (nếu có)
  useEffect(() => {
    if (currentFilters) {
      setGradeFilter(currentFilters.grade || '');
      setStatusFilter(currentFilters.status || '');
      setGenderFilter(currentFilters.gender || '');
      setSchoolFilter(currentFilters.school || '');
    }
  }, [currentFilters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleGradeChange = (value: string) => {
    setGradeFilter(value);
    onFilterChange('grade', value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    // Chuyển đổi 'active'/'inactive' thành 'true'/'false' cho backend
    let statusValue = '';
    if (value === 'active') statusValue = 'true';
    else if (value === 'inactive') statusValue = 'false';
    onFilterChange('status', statusValue);
  };

  const handleGenderChange = (value: string) => {
    setGenderFilter(value);
    onFilterChange('gender', value);
  };

  const handleSchoolChange = (value: string) => {
    setSchoolFilter(value);
    onFilterChange('school', value);
  };

  const handleClearAll = () => {
    setGradeFilter('');
    setStatusFilter('');
    setGenderFilter('');
    setSchoolFilter('');
    onFilterChange('clear', 'all');
  };

  // Đếm số lượng filter đang active
  const activeFilterCount = [gradeFilter, statusFilter, genderFilter, schoolFilter].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Search Row */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              placeholder="Tìm kiếm theo tên, email hoặc mã số học sinh..."
            />
          </div>

        </div>
      </div>

            {/* Filters Row */}
      <div className="px-4 py-3 bg-gray-50/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-400">Bộ lọc:</span>

            {/* Dropdown Lớp */}
            <select
              value={gradeFilter}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="min-w-[160px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Tất cả lớp</option>
              <option value="6">Lớp 6</option>
              <option value="7">Lớp 7</option>
              <option value="8">Lớp 8</option>
              <option value="9">Lớp 9</option>
              <option value="10">Lớp 10</option>
              <option value="11">Lớp 11</option>
              <option value="12">Lớp 12</option>
            </select>

            {/* Dropdown Trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="min-w-[160px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngưng hoạt động</option>
            </select>

            {/* Dropdown Giới tính */}
            <select
              value={genderFilter}
              onChange={(e) => handleGenderChange(e.target.value)}
              className="min-w-[160px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Tất cả giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>

            {/* Dropdown Trường */}
            <select
              value={schoolFilter}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Tất cả trường</option>
              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>

            {activeFilterCount > 0 && (
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full ml-1">
                {activeFilterCount} bộ lọc
              </span>
            )}
          </div>

          <button
            onClick={handleClearAll}
            className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Xóa tất cả
          </button>
        </div>
      </div>
    
            {/* Bulk Actions (chỉ hiển thị khi có học sinh được chọn) */}
      {selectedCount > 0 && (
        <div className="p-3 bg-purple-50/50 border-t border-purple-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Đã chọn {selectedCount}
              </span>
            </div>
            <div className="w-px h-4 bg-purple-200" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBulkAction('assign')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-purple-300 hover:text-purple-600 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất
              </button>
              <button
                onClick={() => onBulkAction('delete')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </div>
          </div>
        </div> )}
      </div>

  );
};

export default StudentToolbar;