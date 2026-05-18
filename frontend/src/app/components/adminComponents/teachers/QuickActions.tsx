// src/app/components/teachers/QuickActions.tsx
import React from 'react';
import { FileText, Calendar, Bell, Download } from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  onExport?: () => void;  // 👈 add prop for export
}

const QuickActions: React.FC<QuickActionsProps> = ({ onExport }) => {
  const actions: QuickAction[] = [
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Báo cáo',
      onClick: () => console.log('Báo cáo clicked')
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Lịch học',
      onClick: () => console.log('Lịch học clicked')
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Thông báo',
      onClick: () => console.log('Thông báo clicked')
    },
    {
      icon: <Download className="w-5 h-5" />,
      label: 'Xuất dữ liệu',
      onClick: onExport
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-4">Thao tác nhanh</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-100 hover:border-purple-500 hover:shadow-md transition-all group"
          >
            <div className="p-2.5 bg-purple-50 rounded-xl mb-2 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-purple-600">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;