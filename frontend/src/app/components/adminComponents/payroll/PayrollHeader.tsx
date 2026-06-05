import React from 'react';
import { Sparkles } from 'lucide-react';
import './payroll.css';

interface PayrollHeaderProps {
  onCreatePayroll: () => void;
}

const PayrollHeader: React.FC<PayrollHeaderProps> = ({ onCreatePayroll }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-14">
      <div className="space-y-3">
        <h1 className="text-display-lg font-headline font-extrabold tracking-tight text-on-surface">
          Quản lý bảng lương giáo viên
        </h1>
        <p className="text-secondary font-body max-w-2xl text-lg leading-relaxed">
          Kiểm tra, xác nhận và chốt lương giáo viên theo từng kỳ thanh toán một cách minh bạch và chính xác nhất.
        </p>
      </div>
      
      <button
        onClick={onCreatePayroll}
        className="gradient-btn text-on-primary px-8 py-4 rounded-xl font-headline font-bold flex items-center gap-3 transition-all active:scale-95"
      >
        <Sparkles className="w-5 h-5" />
        <span>Khởi tạo bảng lương</span>
      </button>
    </header>
  );
};

export default PayrollHeader;