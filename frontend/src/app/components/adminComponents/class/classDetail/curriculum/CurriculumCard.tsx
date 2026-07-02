import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import { toast } from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { CurriculumUI } from "./types";
import { SortableSessionCard, SessionCard } from "./SessionCard";
import { AddSessionButton } from "./AddSessionButton";
import type { SessionDetailResponse } from "../../../../../utils/types/curriculum";

const difficultyColors = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

interface CurriculumCardProps {
  curriculum: CurriculumUI;
  isTeacher: boolean;
  onProgressUpdate?: (
    curriculumId: number,
    sessionId: number,
    completed: boolean
  ) => Promise<void>;
  onReorder?: (curriculumId: number, sessionIdsInOrder: number[]) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddSessionClick?: (curriculumId: number, curriculumTitle: string) => void;
  onEditSessionClick?: (
    session: SessionDetailResponse,
    curriculumTitle: string,
    sessionIndex: number
  ) => void;
  onSessionUpdated?: (curriculumId: number, updatedSession: SessionDetailResponse) => void;
  onSessionDeleted?: (curriculumId: number, sessionId: number) => void;
}

export const CurriculumCard = ({
  curriculum,
  isTeacher,
  onProgressUpdate,
  onReorder,
  onEdit,
  onDelete,
  onAddSessionClick,
  onEditSessionClick,
  onSessionUpdated,
  onSessionDeleted,
}: CurriculumCardProps) => {
  const [expanded, setExpanded] = useState(true);
  const [localSessions, setLocalSessions] = useState(curriculum.sessionDetails);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );


  const handleStatusChange = async (sessionId: number, completed: boolean) => {
    if (onProgressUpdate) {
      await onProgressUpdate(curriculum.id, sessionId, completed);
      setLocalSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, isCompleted: completed } : s
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = localSessions.findIndex((s) => s.id === active.id);
    const newIndex = localSessions.findIndex((s) => s.id === over.id);

    if (oldIndex === newIndex) return;

    const newSessions = [...localSessions];
    const [movedItem] = newSessions.splice(oldIndex, 1);
    newSessions.splice(newIndex, 0, movedItem);

    const updatedSessions = newSessions.map((session, idx) => ({
      ...session,
      displayOrder: idx,
    }));

    setLocalSessions(updatedSessions);

    if (onReorder) {
      setIsReordering(true);
      try {
        const sessionIdsInOrder = updatedSessions.map((s) => s.id);
        await onReorder(curriculum.id, sessionIdsInOrder);
        toast.success("Đã cập nhật thứ tự buổi học");
      } catch (error) {
        setLocalSessions(curriculum.sessionDetails);
        toast.error("Cập nhật thứ tự thất bại");
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleSessionUpdated = (updatedSession: SessionDetailResponse) => {
    setLocalSessions((prev) =>
      prev.map((s) =>
        s.id === updatedSession.id ? { ...s, ...updatedSession } : s
      )
    );
    onSessionUpdated?.(curriculum.id, updatedSession);
  };

  const handleSessionDeleted = (sessionId: number) => {
    setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
    onSessionDeleted?.(curriculum.id, sessionId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div
        className="p-5 border-b border-slate-100 cursor-pointer hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-white transition-all duration-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {curriculum.title}
              </h3>
              {curriculum.difficulty && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    difficultyColors[curriculum.difficulty]
                  )}
                >
                  {curriculum.difficulty === "beginner"
                    ? "Cơ bản"
                    : curriculum.difficulty === "intermediate"
                    ? "Trung cấp"
                    : "Nâng cao"}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {curriculum.semester ? `HK${curriculum.semester}` : "Cả năm"}
              </span>
              {curriculum.totalHours && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1">
                  <Clock size={10} />
                  {curriculum.totalHours} giờ
                </span>
              )}
            </div>
            {curriculum.description && (
              <p className="text-sm text-slate-500 line-clamp-1">
                {curriculum.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isTeacher && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-100"
                  title="Chỉnh sửa lộ trình"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100"
                  title="Xóa lộ trình"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                {localSessions.length}{" "}
                <span className="text-xs font-normal text-slate-400">
                  bài học
                </span>
              </span>

              {isReordering ? (
                <Loader2 size={18} className="text-indigo-500 animate-spin" />
              ) : expanded ? (
                <ChevronUp size={18} className="text-slate-400" />
              ) : (
                <ChevronDown
                  size={18}
                  className="text-slate-400 group-hover:text-indigo-500 transition-colors"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 space-y-2 bg-gradient-to-b from-white to-slate-50/30">
              {isTeacher ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localSessions.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {localSessions.map((session, idx) => (
                      <SortableSessionCard
                        key={session.id}
                        session={session}
                        index={idx}
                        isTeacher={isTeacher}
                        onStatusChange={handleStatusChange}
                        curriculumId={curriculum.id}
                        curriculumTitle={curriculum.title}
                        onSessionUpdated={handleSessionUpdated}
                        onSessionDeleted={handleSessionDeleted}
                        onEditSessionClick={onEditSessionClick}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                localSessions.map((session, idx) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={idx}
                    isTeacher={isTeacher}
                    onStatusChange={handleStatusChange}
                    onEditSessionClick={onEditSessionClick}
                  />
                ))
              )}
              {isTeacher && (
                <div className="mt-3">
                  <AddSessionButton
                    onClick={() => onAddSessionClick?.(curriculum.id, curriculum.title)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};