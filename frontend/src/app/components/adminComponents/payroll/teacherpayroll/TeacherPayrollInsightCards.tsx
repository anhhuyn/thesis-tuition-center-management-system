// src/components/teacherComponents/TeacherPayrollInsightCards.tsx
import React from 'react';
import { TrendingUp, Award } from 'lucide-react';
import type { TeacherPayrollSummary } from '../../../../utils/types/payroll';

interface TeacherPayrollInsightCardsProps {
  payrolls: TeacherPayrollSummary[];
}

const TeacherPayrollInsightCards: React.FC<TeacherPayrollInsightCardsProps> = ({ payrolls }) => {
  const amounts = payrolls.map(p => p.amount);
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const avgAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
        <TrendingUp className="w-4 h-4 text-emerald-500" />
        <span className="text-gray-600 text-sm">Thu nhập tháng cao nhất:</span>
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(maxAmount)} đ</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
        <Award className="w-4 h-4 text-amber-500" />
        <span className="text-gray-600 text-sm">Thu nhập trung bình:</span>
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(avgAmount)} đ</span>
      </div>
    </div>
  );
};

export default TeacherPayrollInsightCards;