// src/app/components/library/QuickActions.tsx
import React from 'react';
import { Scan, Link, Zap } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    { icon: <Scan className="w-5 h-5" />, label: 'Quét tài liệu' },
    { icon: <Link className="w-5 h-5" />, label: 'Tạo link chia sẻ' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Thao tác nhanh</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:border-purple-600 hover:shadow-sm transition-all group"
          >
            <div className="text-slate-400 group-hover:text-purple-600 transition-colors">
              {action.icon}
            </div>
            <span className="text-[11px] font-bold text-slate-600">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};