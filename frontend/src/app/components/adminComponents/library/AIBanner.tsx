// src/app/components/library/AIBanner.tsx
import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

export const AIBanner: React.FC = () => {
  return (
    <section className="relative group cursor-pointer overflow-hidden rounded-3xl p-6 bg-slate-900 text-white shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-purple-600/20 opacity-20 group-hover:opacity-30 transition-opacity animate-pulse"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 bg-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold">AI Smart Assistant</h3>
              <span className="px-2 py-0.5 bg-purple-600/30 text-[10px] font-black uppercase tracking-tighter rounded-full border border-purple-500/50">
                Pro
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Bạn có 3 tài liệu mới đang chờ tóm tắt. Dựa trên lịch giảng dạy, bộ đề thi Toán 12 có thể phù hợp cho tuần tới.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all">
            Xem gợi ý
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs font-bold transition-all">
            Tóm tắt ngay
          </button>
        </div>
      </div>
    </section>
  );
};