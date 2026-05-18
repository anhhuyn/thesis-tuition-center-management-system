// src/app/components/leaves/LeaveHeader.tsx
import React from 'react';
import { Plus } from 'lucide-react';

interface LeaveHeaderProps {
  onCreateRequest: () => void;
}

export const LeaveHeader: React.FC<LeaveHeaderProps> = ({ onCreateRequest }) => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 font-headline">
          Quản lý lịch nghỉ giáo viên
        </h1>
        <p className="text-gray-500 font-medium">
          Hệ thống phê duyệt và theo dõi nhân sự tự động.
        </p>
      </div>
      <button
        onClick={onCreateRequest}
        className="btn-gradient from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Tạo yêu cầu nghỉ
      </button>
    </header>
  );
};