// src/app/components/teachers/TeacherStats.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TeacherStatsProps {
  stats: Array<{
    title: string;
    value: number;
    trend?: number;
    trendDirection?: 'up' | 'down';
    subText?: string;
  }>;
}

const TeacherStats: React.FC<TeacherStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
            {stat.trend !== undefined && (
              <div className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${stat.trendDirection === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                {stat.trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stat.trend)}%
              </div>
            )}
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            {stat.subText && <span className="text-xs font-medium text-slate-400 pb-1">{stat.subText}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherStats;