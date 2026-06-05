// src/components/teacherComponents/payroll/TeacherPayrollToolbar.tsx
import { Search, Download, RefreshCw, Filter } from 'lucide-react';

interface TeacherPayrollToolbarProps {
  searchKeyword: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onExport: () => void;
  onRefresh: () => void;
}

export const TeacherPayrollToolbar = ({
  searchKeyword,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onExport,
  onRefresh,
}: TeacherPayrollToolbarProps) => {
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'DRAFT', label: 'Nháp' },
    { value: 'WAITING_TEACHER_CONFIRMATION', label: 'Chờ xác nhận' },
    { value: 'TEACHER_CONFIRMED', label: 'Đã xác nhận' },
    { value: 'FINALIZED', label: 'Đã chốt' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tháng/năm..."
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white cursor-pointer"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};