// src/app/components/teachers/TeacherStats.tsx
import React from 'react';
import { TrendingUp, TrendingDown, Users, UserPlus, UserCheck, UserX, UsersRound, GraduationCap } from 'lucide-react';

export interface TeacherStat {
  title: string;
  value: number | string;
  trend?: number;
  trendDirection?: 'up' | 'down';
  subText?: string;
  chartData?: number[];
  icon?: React.ReactNode;
}

interface TeacherStatsProps {
  stats: TeacherStat[];
}

// Map icons based on title
const getIcon = (title: string) => {
  switch (title) {
    case 'Tổng giáo viên': return <Users className="w-5 h-5 text-purple-500" />;
    case 'Mới trong tháng': return <UserPlus className="w-5 h-5 text-emerald-500" />;
    case 'Đang hoạt động': return <UserCheck className="w-5 h-5 text-green-500" />;
    case 'Ngưng hoạt động': return <UserX className="w-5 h-5 text-amber-500" />;
    case 'Nam': return <UsersRound className="w-5 h-5 text-blue-500" />;
    case 'Nữ': return <UsersRound className="w-5 h-5 text-pink-500" />;
    default: return <GraduationCap className="w-5 h-5 text-slate-400" />;
  }
};

const TeacherStats: React.FC<TeacherStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-purple-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getIcon(stat.title)}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
            </div>
            {stat.trend !== undefined && stat.trend !== null && (
              <div className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
                stat.trendDirection === 'up' 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-rose-600 bg-rose-50'
              }`}>
                {stat.trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stat.trend)}%
              </div>
            )}
          </div>
          
          <div className="flex items-end justify-between mt-1">
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            {stat.subText && <span className="text-xs font-medium text-slate-400 pb-1">{stat.subText}</span>}
          </div>

          {stat.chartData && stat.chartData.length === 1 && (
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                style={{ width: `${Math.min(stat.chartData[0], 100)}%` }}
              />
            </div>
          )}

          {stat.chartData && stat.chartData.length === 2 && (
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
              <div className="h-full bg-purple-600" style={{ width: `${Math.min(stat.chartData[0], 100)}%` }} />
              <div className="h-full bg-purple-200" style={{ width: `${Math.min(stat.chartData[1], 100)}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeacherStats;