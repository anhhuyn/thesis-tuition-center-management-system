// src/app/components/library/ActivityChart.tsx
import React from 'react';

export const ActivityChart: React.FC = () => {
  const data = [40, 60, 35, 85, 55, 45, 30];
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-slate-900">Hoạt động tải lên</h3>
          <p className="text-xs text-slate-500">Tần suất học liệu trong 7 ngày qua</p>
        </div>
        <select className="text-xs font-bold bg-slate-50 border-none rounded-lg focus:ring-0">
          <option>Tuần này</option>
          <option>Tháng này</option>
        </select>
      </div>
      <div className="h-32 flex items-end gap-3 justify-between">
        {data.map((height, index) => (
          <div
            key={index}
            className={`flex-1 rounded-t-lg relative group transition-all hover:opacity-80 ${
              index === 3 ? 'bg-purple-600' : 'bg-slate-100'
            }`}
            style={{ height: `${height}%` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
              {height}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400">
        {days.map((day, index) => (
          <span key={index} className={index === 3 ? 'text-purple-600' : ''}>{day}</span>
        ))}
      </div>
    </div>
  );
};