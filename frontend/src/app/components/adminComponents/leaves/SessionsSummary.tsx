// src/components/adminComponents/leaves/SessionsSummary.tsx

import { motion } from 'framer-motion';
import { Clock, UserCheck, UserX, XCircle, CheckCircle } from 'lucide-react';
import type { AffectedSession } from '../../../utils/types/teacherLeave';

interface SessionsSummaryProps {
  sessions: AffectedSession[];
}

interface StatItem {
  label: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
}

export const SessionsSummary = ({ sessions }: SessionsSummaryProps) => {
  const stats: StatItem[] = [
    {
      label: 'Chờ phân công',
      value: sessions.filter(s => s.status === 'PENDING').length,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Chờ phản hồi',
      value: sessions.filter(s => s.status === 'ASSIGNED').length,
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Đã từ chối',
      value: sessions.filter(s => s.status === 'DECLINED').length,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Đã nhận dạy',
      value: sessions.filter(s => s.status === 'RESOLVED').length,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Đã hủy',
      value: sessions.filter(s => s.status === 'SKIPPED').length,
      icon: XCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    }
  ];
  
  const total = sessions.length;
  const resolved = sessions.filter(s => s.status === 'RESOLVED' || s.status === 'SKIPPED').length;
  const percentComplete = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Tiến độ xử lý</span>
          <span className="font-medium text-indigo-600">{percentComplete}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full bg-indigo-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {resolved}/{total} buổi đã xử lý xong
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`${stat.bgColor} rounded-xl p-3 text-center`}
          >
            <stat.icon size={20} className={`${stat.color} mx-auto mb-1`} />
            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};