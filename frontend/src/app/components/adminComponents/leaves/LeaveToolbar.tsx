// src/app/components/leaves/LeaveToolbar.tsx
import React from 'react';
import { Search, Calendar, FilterX, Table, CalendarDays } from 'lucide-react';

interface LeaveToolbarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedLeaveType: string;
  onLeaveTypeChange: (type: string) => void;
  onClearFilters: () => void;
  onViewModeChange?: (mode: 'list' | 'calendar') => void;
  currentViewMode?: 'list' | 'calendar';
  statusOptions: string[];
  leaveTypeOptions: string[];
}

export const LeaveToolbar: React.FC<LeaveToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedLeaveType,
  onLeaveTypeChange,
  onClearFilters,
  onViewModeChange,
  currentViewMode = 'list',
  statusOptions,
  leaveTypeOptions
}) => {
  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[300px] relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400"
          placeholder="Tìm kiếm giáo viên hoặc mã GV..."
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer text-gray-700"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={selectedLeaveType}
          onChange={(e) => onLeaveTypeChange(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer text-gray-700"
        >
          {leaveTypeOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors text-gray-700">
          <Calendar className="w-5 h-5 text-purple-500" />
          Khoảng ngày
        </button>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onClearFilters}
          className="p-3 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
          title="Xóa bộ lọc"
        >
          <FilterX className="w-5 h-5" />
        </button>

        {/* View Switcher - Tích hợp vào đây */}
        {onViewModeChange && (
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-xl transition-all flex items-center gap-1 ${currentViewMode === 'list'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-purple-600'
                }`}
              title="Dạng bảng"
            >
              <Table className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Bảng</span>
            </button>
            <button
              onClick={() => onViewModeChange('calendar')}
              className={`p-2 rounded-xl transition-all flex items-center gap-1 ${currentViewMode === 'calendar'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-purple-600'
                }`}
              title="Dạng lịch"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Lịch</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};