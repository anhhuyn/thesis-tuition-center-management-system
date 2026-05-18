// src/app/components/leaves/LeaveStats.tsx
import React from 'react';
import { LayoutDashboard, Clock, CheckCircle, XCircle } from 'lucide-react';

interface LeaveStatItem {
  title: string;
  value: number;
  icon: string; // dashboard, pending_actions, check_circle, cancel
}

interface LeaveStatsProps {
  stats: LeaveStatItem[];
}

export const LeaveStats: React.FC<LeaveStatsProps> = ({ stats }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'dashboard': return <LayoutDashboard className="w-5 h-5" />;
      case 'pending_actions': return <Clock className="w-5 h-5" />;
      case 'check_circle': return <CheckCircle className="w-5 h-5" />;
      case 'cancel': return <XCircle className="w-5 h-5" />;
      default: return <LayoutDashboard className="w-5 h-5" />;
    }
  };

  const getIconBg = (iconName: string) => {
    switch (iconName) {
      case 'dashboard': return 'bg-purple-100 text-purple-600';
      case 'pending_actions': return 'bg-amber-100 text-amber-600';
      case 'check_circle': return 'bg-emerald-100 text-emerald-600';
      case 'cancel': return 'bg-red-100 text-red-600';
      default: return 'bg-purple-100 text-purple-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${getIconBg(stat.icon)}`}>
              {getIcon(stat.icon)}
            </div>
            {stat.title === 'Tổng đơn' && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                +12%
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};