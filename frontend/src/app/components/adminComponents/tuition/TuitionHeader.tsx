// src/components/adminComponents/tuition/TuitionHeader.tsx
import React from 'react';
import { Plus, Calendar, FileText } from 'lucide-react';

interface TuitionHeaderProps {
  onCreateInvoice?: () => void;
  currentMonth?: number;
  currentYear?: number;
}

const TuitionHeader: React.FC<TuitionHeaderProps> = ({ 
  onCreateInvoice,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear()
}) => {
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <FileText className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quản lý học phí</h2>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {monthNames[currentMonth - 1]} {currentYear}
          </p>
        </div>
      </div>

      <button
        onClick={onCreateInvoice}
        className="flex-1 md:flex-none btn-gradient text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Tạo Học Phí
      </button>
    </div>
  );
};

export default TuitionHeader;