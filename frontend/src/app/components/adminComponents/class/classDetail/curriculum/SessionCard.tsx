import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Clock,
  Target,
  BookOpen,
  CheckCircle,
  Circle,
  Play,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  NotebookPen,
  FolderPlus,
  GraduationCap,
  Copy,
  Eye,
  Loader2,
  GripVertical,
  Star,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { toast } from "react-hot-toast";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SessionDetailUI } from "./types";
import { EditSessionButton } from "./EditSessionButton";
import type { SessionDetailResponse } from "../../../../../utils/types/curriculum";

const statusStyles = {
  completed: {
    border: "border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-white",
    numberBg: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  },
  deviated: {
    border: "border-amber-200 bg-gradient-to-r from-amber-50/30 to-white",
    numberBg: "bg-amber-100 text-amber-700",
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
  },
  current: {
    border: "border-indigo-200 bg-gradient-to-r from-indigo-50/30 to-white ring-2 ring-indigo-300/50",
    numberBg: "bg-indigo-500 text-white",
    icon: <Play className="w-5 h-5 text-indigo-500" />,
  },
  upcoming: {
    border: "border-slate-100 bg-white",
    numberBg: "bg-slate-100 text-slate-500",
    icon: <Circle className="w-5 h-5 text-slate-300" />,
  },
};

interface SessionCardProps {
  session: SessionDetailUI;
  index: number;
  isTeacher: boolean;
  onStatusChange?: (sessionId: number, completed: boolean) => Promise<void>;
  dragHandleProps?: any;
  curriculumId?: number;
  curriculumTitle?: string;
  onSessionUpdated?: (updated: SessionDetailResponse) => void;
  onSessionDeleted?: (sessionId: number) => void;
  onEditSessionClick?: (
    session: SessionDetailResponse,
    curriculumTitle: string,
    sessionIndex: number
  ) => void;
}

export const SessionCard = ({
  session,
  index,
  isTeacher,
  onStatusChange,
  dragHandleProps,
  curriculumId,
  curriculumTitle,
  onSessionUpdated,
  onSessionDeleted,
  onEditSessionClick,
}: SessionCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const isDeviated = session.isFollowPlan === false;
  const isCompleted = session.isCompleted === true;

  const displayNumber = session.displayOrder + 1;
  const isCurrent = !isCompleted && displayNumber === 3;

  const statusVariant = isCompleted
    ? "completed"
    : isDeviated
      ? "deviated"
      : isCurrent
        ? "current"
        : "upcoming";

  const handleComplete = async () => {
    if (!onStatusChange) return;
    setIsUpdating(true);
    try {
      await onStatusChange(session.id, true);
      toast.success("Đã cập nhật trạng thái buổi học");
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const getDisplayTitle = () => {
    if (session.sessionNumber) {
      return `Bài ${session.sessionNumber}: ${session.topic}`;
    }
    return session.topic;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "border rounded-xl transition-all duration-200",
        statusStyles[statusVariant].border,
        expanded ? "shadow-lg" : "hover:shadow-md"
      )}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {isTeacher && dragHandleProps && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} />
            </div>
          )}

          <div className="relative">
            {statusStyles[statusVariant].icon}
            {isCurrent && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            )}
          </div>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
              statusStyles[statusVariant].numberBg,
              isCurrent && "shadow-md shadow-indigo-300/50"
            )}
          >
            {displayNumber}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {session.isFollowPlan === false && session.actualTopic
                ? session.actualTopic
                : getDisplayTitle()}
            </p>
            {isDeviated && (
              <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-amber-500" />
                Kế hoạch: {session.topic}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {session.quizScore !== undefined && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
              <Star size={12} className="text-amber-500" />
              <span className="text-xs font-medium text-amber-700">
                {session.quizScore}%
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            {session.durationMinutes} phút
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown
              size={16}
              className="text-slate-400 group-hover:text-indigo-500 transition-colors"
            />
          )}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.objectives && (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target size={14} className="text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                        Mục tiêu
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{session.objectives}</p>
                  </div>
                )}
                {session.content && (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BookOpen size={14} className="text-blue-500" />
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        Nội dung
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{session.content}</p>
                  </div>
                )}
              </div>
              {session.homework && (
                <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <NotebookPen size={14} className="text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      Bài tập về nhà
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{session.homework}</p>
                </div>
              )}
              {session.materials && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FolderPlus size={12} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Tài liệu
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{session.materials}</p>
                </div>
              )}
              {isTeacher && session.teacherNotes && (
                <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <GraduationCap size={14} className="text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      Ghi chú giáo viên
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{session.teacherNotes}</p>
                </div>
              )}
              {isTeacher && curriculumId && curriculumTitle && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <EditSessionButton
                    session={session as SessionDetailResponse}
                    curriculumTitle={curriculumTitle}
                    sessionIndex={displayNumber - 1}
                    onClick={onEditSessionClick!}
                  />
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all hover:scale-105">
                    <Copy size={12} />
                    Nhân bản
                  </button>
                  {!session.isCompleted && (
                    <button
                      onClick={handleComplete}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      Đánh dấu hoàn thành
                    </button>
                  )}
                  {session.isCompleted && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg">
                      <Eye size={12} />
                      Xem đánh giá
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface SortableSessionCardProps extends SessionCardProps {}

export const SortableSessionCard = (props: SortableSessionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SessionCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
};