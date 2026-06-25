// src/app/components/students/QuickActions.tsx
import React from 'react';
import { Upload, PlusCircle, Download, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Action {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  onAddStudent?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onCreateClass?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onAddStudent, 
  onExport,
  onImport,
  onCreateClass 
}) => {
  const navigate = useNavigate();

  const actions: Action[] = [
    {
      icon: <Upload className="w-4 h-4" />,
      title: 'Học phí',
      subtitle: 'Thanh toán học phí',
      onClick: onImport || (() => navigate('/admin/tuition'))
    },
    {
      icon: <PlusCircle className="w-4 h-4" />,
      title: 'Tạo lớp học',
      subtitle: 'Thiết lập chương trình',
      onClick: onCreateClass || (() => navigate('/admin/class'))
    },
    {
      icon: <Download className="w-4 h-4" />,
      title: 'Xuất dữ liệu',
      subtitle: 'Excel',
      onClick: onExport || (() => console.log('Xuất dữ liệu'))
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-purple-100 rounded-lg">
          <Zap className="w-4 h-4 text-purple-600" />
        </div>
        Thao tác nhanh
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                {action.icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-gray-400">{action.subtitle}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;