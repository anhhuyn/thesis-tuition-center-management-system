// src/components/teacherComponents/payroll/TeacherPayrollStats.tsx
import { motion } from 'framer-motion';
import { DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';

interface TeacherPayrollStatsProps {
  stats: {
    totalPayrolls: number;
    totalAmount: number;
    totalSessions: number;
    pendingCount: number;
    confirmedCount: number;
    finalizedCount: number;
  };
}

export const TeacherPayrollStats = ({ stats }: TeacherPayrollStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const statCards = [
    {
      title: 'Tổng thu nhập',
      value: formatCurrency(stats.totalAmount),
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Tổng số buổi',
      value: `${stats.totalSessions} buổi`,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Chờ xác nhận',
      value: stats.pendingCount,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Đã xác nhận',
      value: stats.confirmedCount,
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
              <card.icon size={20} className={card.textColor} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};