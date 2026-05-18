// src/app/components/leaves/QuickActions.tsx
import React from 'react';
import { Zap, Download } from 'lucide-react';

interface QuickActionsProps {
  onQuickCreate: () => void;
  onExport: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onQuickCreate, onExport }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 font-headline">Thao tác nhanh</h2>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={onQuickCreate}
          className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800 text-sm">Tạo nhanh</p>
            <p className="text-xs text-gray-400">Sử dụng mẫu có sẵn</p>
          </div>
        </button>
        <button
          onClick={onExport}
          className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
            <Download className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800 text-sm">Xuất Excel</p>
            <p className="text-xs text-gray-400">Tải báo cáo tháng 4</p>
          </div>
        </button>
      </div>
    </section>
  );
};