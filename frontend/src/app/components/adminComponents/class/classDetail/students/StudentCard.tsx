// StudentCard.tsx
import { motion } from "framer-motion";
import { cn } from "../../../../../utils/cn";
import { Eye, Pencil, Trash2, School, Calendar } from "lucide-react";
import { Avatar } from "./Avatar";
import { getStatusLabel, statusColors } from "./utils";
import { formatDate } from "../../../../../utils/helpers";
import type { StudentSubject } from "../../../../../utils/types/studentSubject";

type StudentCardProps = {
  student: StudentSubject;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
  isTeacher: boolean;
  overallProgress?: number; 
};

export const StudentCard = ({
  student,
  index,
  isSelected,
  onClick,
  onView,
  onEdit,
  onRemove,
  isTeacher,
  overallProgress = 0 
}: StudentCardProps) => {

  const progress = overallProgress;
  const hasEvaluation = overallProgress > 0 || (student as any).hasAnyEvaluation === true;
  const status = getStatusLabel(progress, hasEvaluation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-violet-300 bg-violet-50/50 shadow-sm"
          : "border-slate-100 bg-white hover:shadow-md hover:border-slate-200"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <Avatar name={student.fullName} size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800">{student.fullName || "Chưa có tên"}</p>
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                student.gender === true
                  ? "bg-blue-50 text-blue-600"
                  : student.gender === false
                    ? "bg-pink-50 text-pink-600"
                    : "bg-slate-100 text-slate-500"
              )}
            >
              {student.gender === true ? "Nam" : student.gender === false ? "Nữ" : "Khác"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1">
              <School size={10} className="text-slate-400" />
              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                {student.schoolName || "Chưa có trường"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={10} className="text-slate-400" />
              <span className="text-[10px] text-slate-500">
                {student.dateOfBirth ? formatDate(student.dateOfBirth) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block w-24">
          <div className="flex items-center justify-between text-[9px] text-slate-500 mb-0.5">
            <span>Tiến độ</span>
            <span className="font-medium text-violet-600">
              {hasEvaluation ? `${progress}%` : "0%"}
            </span>
          </div>
          {hasEvaluation ? (
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(to right, #8b5cf6, #6366f1)"
                }}
              />
            </div>
          ) : (
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-300"
                style={{ width: "100%" }}
              />
            </div>
          )}
        </div>

        <span className={cn(
          "hidden sm:inline-flex text-[10px] font-semibold px-2 py-1 rounded-full",
          hasEvaluation
            ? statusColors[status.color as keyof typeof statusColors]
            : "bg-slate-100 text-slate-500"
        )}>
          {hasEvaluation ? status.label : "Chưa đánh giá"}
        </span>

        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onView}
            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-50 transition-colors"
          >
            <Eye size={14} />
          </motion.button>
          {!isTeacher && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Pencil size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRemove}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};