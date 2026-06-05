// EmptyState.tsx
import { Users } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: any;
  onAdd?: () => void;
  isTeacher?: boolean;
};

export const EmptyState = ({ 
  title, 
  description, 
  icon: Icon = Users, 
  onAdd, 
  isTeacher 
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-sm font-medium text-slate-700">{title}</p>
    <p className="text-xs text-slate-400 mt-1">{description}</p>
    {!isTeacher && onAdd && (
      <button
        onClick={onAdd}
        className="mt-3 px-3 py-1.5 bg-violet-50 text-violet-600 text-xs font-medium rounded-lg hover:bg-violet-100 transition-colors"
      >
        + Thêm học sinh
      </button>
    )}
  </div>
);