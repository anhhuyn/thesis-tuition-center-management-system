// src/app/components/teachers/TeacherToolbar.tsx
import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, Download, Trash2, LayoutGrid, Table, SlidersHorizontal } from 'lucide-react';

interface TeacherToolbarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onClearFilters: () => void;
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onAddTeacher: () => void;
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
  currentFilters?: { specialty?: string; gender?: string; status?: string };
}

const TeacherToolbar: React.FC<TeacherToolbarProps> = ({
  onSearch,
  onFilterChange,
  onClearFilters,
  selectedCount,
  onBulkAction,
  onAddTeacher,
  viewMode,
  onViewModeChange,
  currentFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (currentFilters) {
      setSpecialtyFilter(currentFilters.specialty || '');
      setGenderFilter(currentFilters.gender || '');
      setStatusFilter(currentFilters.status || '');
    }
  }, [currentFilters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleSpecialtyChange = (value: string) => {
    setSpecialtyFilter(value);
    onFilterChange('specialty', value);
  };

  const handleGenderChange = (value: string) => {
    setGenderFilter(value);
    onFilterChange('gender', value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onFilterChange('status', value);
  };

  const handleClearAll = () => {
    setSpecialtyFilter('');
    setGenderFilter('');
    setStatusFilter('');
    onClearFilters();
  };

  const activeFilterCount = [specialtyFilter, genderFilter, statusFilter].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search Row */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              placeholder="Tìm kiếm giáo viên theo tên, email hoặc mã số..."
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewModeChange('card')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              title="Dạng thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              title="Dạng bảng"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="px-4 py-2 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-400">Bộ lọc:</span>

          <select
            value={specialtyFilter}
            onChange={(e) => handleSpecialtyChange(e.target.value)}
            className="min-w-[160px] px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Tất cả chuyên môn</option>
            <option value="Toán">Toán</option>
            <option value="Văn">Văn</option>
            <option value="Anh">Anh</option>
            <option value="Lý">Lý</option>
            <option value="Hóa">Hóa</option>
            <option value="Sinh">Sinh</option>
            <option value="Sử">Sử</option>
            <option value="Địa">Địa</option>
            <option value="GDCD">GDCD</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => handleGenderChange(e.target.value)}
            className="min-w-[160px] px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="min-w-[160px] px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>

          {activeFilterCount > 0 && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {activeFilterCount} bộ lọc
            </span>
          )}
        </div>

        <button onClick={handleClearAll} className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1">
          <X className="w-3 h-3" />
          Xóa tất cả
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="p-3 bg-purple-50/50 border-t border-purple-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Đã chọn {selectedCount}</span>
            </div>
            <div className="w-px h-4 bg-purple-200" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBulkAction('export')}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất
              </button>
              <button
                onClick={() => onBulkAction('delete')}
                className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded text-xs font-medium hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherToolbar;