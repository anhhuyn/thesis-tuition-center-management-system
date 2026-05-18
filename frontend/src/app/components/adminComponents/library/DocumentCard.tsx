// src/app/components/library/DocumentCard.tsx
import React from 'react';
import { FileText, Video, File, Pin, Download, Eye, User } from 'lucide-react';
import type { Document } from '../../../utils/types/library';

interface DocumentCardProps {
  document: Document;
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView, onDownload }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'doc':
        return <File className="w-6 h-6 text-blue-600" />;
      case 'video':
        return <Video className="w-6 h-6 text-purple-600" />;
      default:
        return <File className="w-6 h-6 text-slate-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-50';
      case 'doc': return 'bg-blue-50';
      case 'video': return 'bg-purple-50';
      default: return 'bg-slate-50';
    }
  };

  const getTagColor = (tag: string) => {
    if (tag === 'Học kỳ 1') return 'bg-emerald-50 text-emerald-600';
    if (tag === 'Vật lý') return 'bg-blue-50 text-blue-600';
    return 'bg-slate-100 text-slate-500';
  };

  return (
    <div className={`doc-card group bg-white rounded-2xl border ${document.isPinned ? 'border-purple-200' : 'border-slate-200/60'} p-5 shadow-sm hover:shadow-lg transition-all relative`}>
      {document.isPinned && (
        <div className="absolute top-4 right-4 text-purple-600">
          <Pin className="w-4 h-4 fill-purple-600" />
        </div>
      )}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 ${getIconBg(document.type)} rounded-xl flex items-center justify-center shadow-inner`}>
          {getIcon(document.type)}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900 truncate pr-6">{document.title}</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{document.version} • {document.size}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {document.tags.map((tag, index) => (
          <span key={index} className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${getTagColor(tag)}`}>
            #{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden ring-1 ring-white flex items-center justify-center">
            <User className="w-3 h-3 text-slate-500" />
          </div>
          <span className="text-[10px] font-bold text-slate-600">{document.author}</span>
        </div>
        <div className="text-[10px] font-bold text-slate-400">{document.uploadDate}</div>
      </div>

      {/* Hover Actions */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={() => onView(document)}
          className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          Xem
        </button>
        <button
          onClick={() => onDownload(document)}
          className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition-all flex items-center gap-1"
        >
          <Download className="w-3 h-3" />
          Tải về
        </button>
      </div>
    </div>
  );
};