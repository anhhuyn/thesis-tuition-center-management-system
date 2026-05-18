// src/app/components/library/LibraryHeader.tsx
import React from 'react';
import { History, Share2, Upload, ChevronRight } from 'lucide-react';

interface LibraryHeaderProps {
  onUpload: () => void;
  onHistory: () => void;
  onShare: () => void;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({ onUpload, onHistory, onShare }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          <a className="hover:text-purple-600 transition-colors" href="#">Workspace</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900">Kho tài liệu chính</span>
        </nav>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Thư viện học liệu</h1>
        <p className="text-slate-500 font-medium">Quản lý và cộng tác trên hệ thống tài liệu thông minh.</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onHistory}
          className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm text-sm"
        >
          <History className="w-4 h-4" />
          Lịch sử
        </button>
        <button
          onClick={onShare}
          className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm text-sm"
        >
          <Share2 className="w-4 h-4" />
          Chia sẻ
        </button>
        <button
          onClick={onUpload}
          className="px-6 py-2.5 rounded-xl btn-gradient from-purple-600 to-purple-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all text-sm"
        >
          <Upload className="w-4 h-4" />
          Tải học liệu mới
        </button>
      </div>
    </div>
  );
};