// src/app/components/adminComponents/teachers/TeacherDocumentItem.tsx
import React from 'react';
import { FileText, Download } from 'lucide-react';
import type { TeacherDocument } from '../../../utils/types/teacher';

interface TeacherDocumentItemProps {
  document: TeacherDocument;
  onDownload: (doc: TeacherDocument) => void;
}

const TeacherDocumentItem: React.FC<TeacherDocumentItemProps> = ({ document, onDownload }) => {
  return (
    <div
      className="flex items-center justify-between p-3 bg-[#f7f9fb] rounded-xl group hover:bg-purple-50 transition-all cursor-pointer"
      onClick={() => onDownload(document)}
    >
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-lg shadow-sm text-[#4b41e1] group-hover:bg-[#4b41e1] group-hover:text-white transition-colors">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium text-sm">{document.name}</p>
          <p className="text-xs text-gray-400">{document.size}</p>
        </div>
      </div>
      <Download className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default TeacherDocumentItem;