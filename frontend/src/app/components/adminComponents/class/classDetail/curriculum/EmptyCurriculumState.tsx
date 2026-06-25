// src/components/class/curriculum/EmptyCurriculumState.tsx
import { motion } from "framer-motion";
import { BookOpen, Plus, RefreshCw } from "lucide-react";

interface EmptyCurriculumStateProps {
  isTeacher?: boolean;
  onRefresh?: () => void;
  onCreate?: () => void;
}

export const EmptyCurriculumState = ({
  isTeacher,
  onRefresh,
  onCreate,
}: EmptyCurriculumStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm"
  >
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-5">
      <BookOpen className="w-10 h-10 text-slate-400" />
    </div>
    <p className="text-base font-semibold text-slate-700">Chưa có lộ trình học</p>
    <p className="text-sm text-slate-400 mt-1 max-w-sm">
      {isTeacher
        ? "Hãy tạo lộ trình đầu tiên cho môn học này để bắt đầu giảng dạy"
        : "Giáo viên chưa tạo lộ trình học cho môn này"}
    </p>
    {isTeacher && (
      <div className="flex gap-3 mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2.5 btn-gradient text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          Tạo lộ trình mới
        </motion.button>
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRefresh}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw size={16} />
            Làm mới
          </motion.button>
        )}
      </div>
    )}
  </motion.div>
);