// src/app/components/library/FormatStats.tsx
import React from 'react';

interface FormatStatsProps {
  formats: Array<{ name: string; percentage: number; color: string }>;
  total: number;
}

export const FormatStats: React.FC<FormatStatsProps> = ({ formats, total }) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'stroke-purple-600';
      case 'blue-500': return 'stroke-blue-500';
      default: return 'stroke-slate-300';
    }
  };

  const getFillColor = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-purple-600';
      case 'blue-500': return 'bg-blue-500';
      default: return 'bg-slate-300';
    }
  };

  // Calculate stroke-dasharray for the chart
  const getDashArray = (percentage: number, offset: number = 0) => {
    const circumference = 100;
    const value = (percentage / 100) * circumference;
    return `${value}, ${circumference - value}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
      <h3 className="font-bold text-slate-900 mb-4">Cơ cấu định dạng</h3>
      <div className="flex items-center gap-8">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle className="stroke-slate-100" cx="18" cy="18" fill="none" r="16" strokeWidth="4"></circle>
            <circle
              className="stroke-purple-600"
              cx="18" cy="18" fill="none" r="16"
              strokeDasharray={getDashArray(formats[0].percentage)}
              strokeWidth="4"
            ></circle>
            <circle
              className="stroke-blue-500"
              cx="18" cy="18" fill="none" r="16"
              strokeDasharray={getDashArray(formats[1].percentage, -formats[0].percentage)}
              strokeDashoffset={-formats[0].percentage}
              strokeWidth="4"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black">{total.toFixed(0)}</span>
          </div>
        </div>
        <div className="space-y-2">
          {formats.map((format, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${getFillColor(format.color)}`}></span>
              <span className="text-[11px] font-bold text-slate-600">{format.name} ({format.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-medium text-slate-500 italic">"PDF là định dạng được ưa chuộng nhất."</p>
      </div>
    </div>
  );
};