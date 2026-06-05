import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  Eye, 
  Filter, 
  X, 
  Calendar, 
  User, 
  Tag,
  RefreshCw,
  LayoutGrid,
  Clock,
  FileCheck,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import type { PayrollFilter } from '../../../utils/types/payroll';
import './payroll.css';

interface PayrollToolbarProps {
  activeTab: string;
  onTabChange: (tab: 'preview' | 'list' | 'waiting' | 'finalized') => void;
  filters: PayrollFilter;
  onFilterChange: (filters: Partial<PayrollFilter>) => void;
  onPreviewMonthly?: () => void;
}

// Tab configuration with icons and colors
const tabs = [
  { id: 'list', label: 'Danh sách', icon: LayoutGrid, color: 'purple', description: 'Tất cả bảng lương' },
  { id: 'waiting', label: 'Chờ xác nhận', icon: Clock, color: 'amber', description: 'Cần phản hồi từ GV' },
  { id: 'finalized', label: 'Đã chốt', icon: FileCheck, color: 'emerald', description: 'Hoàn tất chốt lương' },
  { id: 'preview', label: 'Tạo mới', icon: PlusCircle, color: 'blue', description: 'Tạo bảng lương mới' }
];

const months = [
  { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' }, { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' }, { value: 5, label: 'Tháng 5' }, { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' }, { value: 8, label: 'Tháng 8' }, { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' }, { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' }
];

const statusOptions = [
  { value: '', label: 'Tất cả', color: 'slate' },
  { value: 'DRAFT', label: 'Bản nháp', color: 'slate' },
  { value: 'WAITING_TEACHER_CONFIRMATION', label: 'Chờ xác nhận', color: 'amber' },
  { value: 'TEACHER_CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
  { value: 'FINALIZED', label: 'Đã chốt', color: 'purple' },
  { value: 'PAID', label: 'Đã thanh toán', color: 'emerald' }
];

// Animated tab button component
const TabButton: React.FC<{
  tab: typeof tabs[0];
  isActive: boolean;
  onClick: () => void;
}> = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  const colorClasses = {
    purple: { active: 'bg-purple-50 text-purple-700 border-purple-200', inactive: 'text-slate-500 hover:text-purple-600 hover:bg-purple-50/50' },
    amber: { active: 'bg-amber-50 text-amber-700 border-amber-200', inactive: 'text-slate-500 hover:text-amber-600 hover:bg-amber-50/50' },
    emerald: { active: 'bg-emerald-50 text-emerald-700 border-emerald-200', inactive: 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50' },
    blue: { active: 'bg-blue-50 text-blue-700 border-blue-200', inactive: 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/50' }
  };
  const colors = colorClasses[tab.color as keyof typeof colorClasses];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
        isActive 
          ? `${colors.active} border shadow-sm` 
          : `${colors.inactive} border border-transparent`
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{tab.label}</span>
      <span className="sm:hidden">
        {tab.id === 'list' && 'DS'}
        {tab.id === 'waiting' && 'Chờ'}
        {tab.id === 'finalized' && 'Chốt'}
        {tab.id === 'preview' && 'Mới'}
      </span>
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-2 right-2 h-0.5 bg-current rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

// Filter badge component
const ActiveFilterBadge: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-medium text-purple-700"
  >
    {label}
    <button onClick={onRemove} className="hover:bg-purple-100 rounded-full p-0.5 transition-colors">
      <X className="h-3 w-3" />
    </button>
  </motion.span>
);

const PayrollToolbar: React.FC<PayrollToolbarProps> = ({
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  onPreviewMonthly
}) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Count active filters (excluding month/year defaults)
  const activeFilterCount = [
    filters.month && filters.month !== new Date().getMonth() + 1,
    filters.year && filters.year !== currentYear,
    filters.status !== undefined,
    filters.teacherName && filters.teacherName !== ''
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onFilterChange({
      month: new Date().getMonth() + 1,
      year: currentYear,
      status: undefined,
      teacherName: ''
    });
  };

  const getActiveFilterLabels = () => {
    const labels = [];
    if (filters.month && filters.month !== new Date().getMonth() + 1) {
      labels.push(`Tháng ${filters.month}`);
    }
    if (filters.year && filters.year !== currentYear) {
      labels.push(`Năm ${filters.year}`);
    }
    if (filters.status) {
      const status = statusOptions.find(s => s.value === filters.status);
      if (status) labels.push(status.label);
    }
    if (filters.teacherName) {
      labels.push(`GV: ${filters.teacherName}`);
    }
    return labels;
  };

  return (
    <div className="space-y-5">
      {/* Tab Navigation - Premium Glass Panel */}
      <div className="relative">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm w-fit">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => onTabChange(tab.id as any)}
            />
          ))}
        </div>

        {/* Tab description animation */}
        <motion.p
          key={activeTab}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-slate-400 mt-2 ml-2"
        >
          {tabs.find(t => t.id === activeTab)?.description}
        </motion.p>
      </div>

      {/* Filter Section - Always visible, premium design */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Filter Header */}
        <div 
          className="flex items-center justify-between px-5 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition-colors"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
              <SlidersHorizontal className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700">Bộ lọc dữ liệu</h4>
              <p className="text-xs text-slate-400 hidden sm:block">Lọc bảng lương theo tháng, năm, trạng thái và giáo viên</p>
            </div>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                {activeFilterCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Preview Monthly Button - Hiển thị ngay trên header */}
            {onPreviewMonthly && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewMonthly();
                }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-sm shadow-purple-200 hover:shadow-md transition-all"
              >
                <Eye className="h-4 w-4" />
                Xem trước tháng
              </motion.button>
            )}
            
            {activeFilterCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFilters();
                }}
                className="text-xs text-slate-400 hover:text-purple-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Xóa tất cả</span>
              </motion.button>
            )}
            
            <motion.div
              animate={{ rotate: isFilterExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        {/* Filter Content - Collapsible */}
        <AnimatePresence>
          {isFilterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-5">
                {/* Filter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Month Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Tháng
                    </label>
                    <div className="relative">
                      <select
                        value={filters.month || new Date().getMonth() + 1}
                        onChange={(e) => onFilterChange({ month: parseInt(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none appearance-none bg-white text-slate-700 text-sm transition-all"
                      >
                        {months.map(month => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4" />
                    </div>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Năm
                    </label>
                    <div className="relative">
                      <select
                        value={filters.year || currentYear}
                        onChange={(e) => onFilterChange({ year: parseInt(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none appearance-none bg-white text-slate-700 text-sm transition-all"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4" />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Trạng thái
                    </label>
                    <div className="relative">
                      <select
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange({ status: e.target.value as any || undefined })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none appearance-none bg-white text-slate-700 text-sm transition-all"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4" />
                    </div>
                  </div>

                  {/* Teacher Filter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Giáo viên
                    </label>
                    <input
                      type="text"
                      value={filters.teacherName || ''}
                      onChange={(e) => onFilterChange({ teacherName: e.target.value })}
                      placeholder="Tìm theo tên giáo viên..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none bg-white text-slate-700 text-sm placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                {/* Active filters display */}
                {activeFilterCount > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">Đang áp dụng:</span>
                      <AnimatePresence>
                        {getActiveFilterLabels().map((label, idx) => (
                          <ActiveFilterBadge
                            key={idx}
                            label={label}
                            onRemove={() => {
                              if (label.includes('Tháng')) onFilterChange({ month: new Date().getMonth() + 1 });
                              else if (label.includes('Năm')) onFilterChange({ year: currentYear });
                              else if (statusOptions.find(s => s.label === label)) onFilterChange({ status: undefined });
                              else if (label.includes('GV:')) onFilterChange({ teacherName: '' });
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Preview Button - Chỉ hiển thị trên mobile */}
      {onPreviewMonthly && !isFilterExpanded && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPreviewMonthly}
          className="sm:hidden w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium shadow-sm shadow-purple-200 flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Xem trước lương tháng
        </motion.button>
      )}
    </div>
  );
};

export default PayrollToolbar;