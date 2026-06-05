// src/components/class/curriculum/Legend.tsx
import {
  CheckCircle,
  Circle,
  Play,
  AlertCircle,
  GripVertical,
} from "lucide-react";

interface LegendProps {
  isTeacher: boolean;
}

export const Legend = ({ isTeacher }: LegendProps) => (
  <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-200/60">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full" />
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Chú thích
      </p>
    </div>
    <div className="flex flex-wrap gap-5 text-xs">
      <div className="flex items-center gap-2">
        <CheckCircle size={14} className="text-emerald-500" />
        <span className="text-slate-600">Đã hoàn thành</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Circle size={14} className="text-slate-300" />
          <Play
            size={8}
            className="text-indigo-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <span className="text-slate-600">Buổi hiện tại</span>
      </div>
      <div className="flex items-center gap-2">
        <Circle size={14} className="text-slate-300" />
        <span className="text-slate-600">Chưa học</span>
      </div>
      <div className="flex items-center gap-2">
        <AlertCircle size={14} className="text-amber-500" />
        <span className="text-slate-600">Dạy lệch kế hoạch</span>
      </div>
      {isTeacher && (
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-400" />
          <span className="text-slate-600">Kéo thả để sắp xếp</span>
        </div>
      )}
    </div>
  </div>
);