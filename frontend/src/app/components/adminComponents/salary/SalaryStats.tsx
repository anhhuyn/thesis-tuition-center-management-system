// src/app/components/salary/SalaryStats.tsx
import React from 'react';
import { FileText, Users, DollarSign, Trophy } from 'lucide-react';

interface SalaryStatsProps {
  stats: {
    totalAgreements: number;
    totalTeachers: number;
    averageRate: number;
    highestRate: number;
  };
}

export const SalaryStats: React.FC<SalaryStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Tổng thỏa thuận',
      value: stats.totalAgreements,
      icon: FileText,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Tổng giáo viên',
      value: stats.totalTeachers,
      icon: Users,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Lương trung bình',
      value: `${stats.averageRate}k`,
      icon: DollarSign,
      unit: '/h',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Lương cao nhất',
      value: `${stats.highestRate}k`,
      icon: Trophy,
      unit: '/h',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className={`p-3 ${card.bgColor} rounded-xl ${card.iconColor} inline-block mb-4`}>
            <card.icon className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
            {card.title}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {card.value}
            {card.unit && <span className="text-lg text-gray-500 ml-1">{card.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};