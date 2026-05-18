// src/app/components/library/StorageWidget.tsx
import React from 'react';
import { Database, Zap, Cloud } from 'lucide-react';
import type { StorageStats } from '../../../utils/types/library';

interface StorageWidgetProps {
  stats: StorageStats;
  onUpgrade: () => void;
}
export const StorageWidget: React.FC<StorageWidgetProps> = ({ stats, onUpgrade }) => {
    const percentage = (stats.used / stats.total) * 100;
  
    return (
      <div className="relative p-6 rounded-3xl overflow-hidden shadow-2xl bg-slate-900 text-white group">
        
        {/* Gradient overlay giống AIBanner */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-purple-600/20 opacity-20 group-hover:opacity-30 transition-opacity animate-pulse"></div>
  
        {/* Icon background */}
        <div className="absolute -right-10 -bottom-10 text-white/5 rotate-12">
          <Cloud className="w-40 h-40" />
        </div>
  
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center border border-white/10 backdrop-blur">
                <Database className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                Bộ nhớ
              </span>
            </div>
            <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded uppercase">
              An toàn
            </span>
          </div>
  
          {/* Usage */}
          <div className="mb-5">
            <div className="flex items-baseline gap-1 mb-2">
              <h4 className="text-2xl font-extrabold">
                {stats.used} {stats.unit}
              </h4>
              <span className="text-slate-400 text-sm">
                / {stats.total} {stats.unit}
              </span>
            </div>
  
            {/* Progress */}
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full shadow-[0_0_12px_#a855f7] transition-all"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
  
          {/* Button */}
          <button
            onClick={onUpgrade}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Nâng cấp dung lượng
          </button>
        </div>
      </div>
    );
  };