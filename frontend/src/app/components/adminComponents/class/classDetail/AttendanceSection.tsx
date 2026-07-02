import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  Clock,
  MoreHorizontal,
  Edit2,
  Save,
  UserCheck,
  UserX,
  Clock as ClockIcon,
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  ClipboardList,
  AlertCircle,
  Loader2,
  School,
  Calendar,
  Users
} from "lucide-react";
import clsx from "clsx";
import type { Subject } from "../../../../utils/types/subject";
import { sessionApi } from "../../../../utils/api";
import type { SessionOfSubject } from "../../../../utils/types/session";
import { attendanceApi } from "../../../../utils/api/attendance.api";
import type { AttendanceResponse, AttendanceItem } from "../../../../utils/types/attendance";
import type { TeacherAttendanceItem, TeacherAttendanceResponse } from "../../../../utils/types/teacher-attendance";
import { teacherAttendanceApi } from "../../../../utils/api/teacherAttendance.api";
import { useOutletContext } from "react-router-dom";
import { SessionContentModal } from "./SessionContentModal";
import { cn } from "../../../../utils/cn";

type StatusType = "present" | "late" | "absent";

interface Student {
  id: string;
  name: string;
  gender: boolean | null;
  schoolName: string | null;
  avatar: string;
  status: StatusType;
  note?: string | null;
}

export interface Session {
  id: number;
  title: string;
  date: string;
  time: string;
  sessionDate?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
  status?: string;
}

interface SessionContent {
  displayTopic: string | null;
  displayContent: string | null;
  displayHomework: string | null;
  isFollowingPlan: boolean;
  plannedTopic: string | null;
  deviationReason: string | null;
  noteForNextSession: string | null;
}

const statusConfig = {
  present: {
    label: "Có mặt",
    icon: CheckCircle,
    color: "emerald",
    bgLight: "bg-emerald-50",
    textLight: "text-emerald-600",
    bgDark: "dark:bg-emerald-950/40",
    ringColor: "ring-emerald-500",
  },
  late: {
    label: "Muộn",
    icon: Clock,
    color: "amber",
    bgLight: "bg-amber-50",
    textLight: "text-amber-600",
    bgDark: "dark:bg-amber-950/40",
    ringColor: "ring-amber-500",
  },
  absent: {
    label: "Vắng",
    icon: XCircle,
    color: "red",
    bgLight: "bg-red-50",
    textLight: "text-red-600",
    bgDark: "dark:bg-red-950/40",
    ringColor: "ring-red-500",
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const useCountUp = (end: number, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
};

const retryRequest = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;

      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Helper: Generate initials from full name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Avatar component with initials fallback
const Avatar = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  const initials = getInitials(name);
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 font-semibold shadow-sm",
      sizeClasses[size]
    )}>
      {initials}
    </div>
  );
};

// ============================================================================
// COMPONENTS
// ============================================================================

// ----- Month Selector Component -----
const MonthSelector: React.FC<{
  selectedMonth: number;
  onMonthChange: (month: number) => void;
}> = ({ selectedMonth, onMonthChange }) => {
  const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);

  const goToPreviousMonth = () => {
    const newMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    onMonthChange(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    onMonthChange(newMonth);
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-1 shadow-inner">
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.5)" }}
        whileTap={{ scale: 0.95 }}
        onClick={goToPreviousMonth}
        className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all"
      >
        <ChevronDown size={14} className="rotate-90" />
      </motion.button>

      <div className="relative">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="appearance-none px-3 py-1.5 pr-7 text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
        >
          {months.map((month, index) => (
            <option key={index + 1} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.5)" }}
        whileTap={{ scale: 0.95 }}
        onClick={goToNextMonth}
        className="p-1.5 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all"
      >
        <ChevronDown size={14} className="-rotate-90" />
      </motion.button>
    </div>
  );
};

// ----- Session Card with Vertical Stepper -----
const SessionCard: React.FC<{
  sessions: Session[];
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  loadingSchedule?: boolean;
  selectedSessionId?: number;
  onSessionClick?: (session: Session) => void;
}> = ({ sessions, selectedMonth, onMonthChange, loadingSchedule, selectedSessionId, onSessionClick }) => {
  const completedCount = sessions.filter(s => s.isCurrent || s.isCompleted).length;
  const totalSessions = sessions.length;

  const getDotColor = (session: Session) => {
    if (session.isCurrent) {
      return "border-indigo-500 bg-white dark:bg-gray-900 shadow-lg shadow-indigo-500/40";
    }
    if (session.isCompleted) {
      return "border-emerald-500 bg-white dark:bg-gray-900";
    }
    return "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900";
  };

  const getDotIcon = (session: Session) => {
    if (session.isCurrent) {
      return <CheckCircle size={12} className="text-indigo-500" />;
    }
    if (session.isCompleted) {
      return <CheckCircle size={12} className="text-emerald-500" />;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
            <Calendar size={14} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Lịch trình
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            {completedCount} / {totalSessions}
          </div>
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={onMonthChange} />
        </div>
      </div>

      <div className="p-5 max-h-[500px] overflow-y-auto custom-scrollbar">
        {loadingSchedule ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pl-10 py-3">
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : totalSessions === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Không có buổi học trong tháng {selectedMonth}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[13px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-indigo-200 via-purple-200 to-gray-100 dark:from-indigo-800 dark:via-purple-800 dark:to-gray-800 rounded-full" />

            <div className="space-y-4">
              {sessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => onSessionClick?.(session)}
                  className={clsx(
                    "relative pl-10 py-2 rounded-xl transition-all duration-300 cursor-pointer group",
                    session.isCurrent && "bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/40 dark:to-purple-950/40 shadow-sm",
                    selectedSessionId === session.id && "ring-2 ring-indigo-500 ring-offset-2"
                  )}
                >
                  <div className={clsx(
                    "absolute left-[6px] top-3 w-[18px] h-[18px] rounded-full border-[3px] flex items-center justify-center transition-all duration-300 z-10",
                    getDotColor(session),
                    "group-hover:scale-125"
                  )}>
                    {getDotIcon(session)}
                  </div>

                  <div className={clsx(
                    "transition-all duration-300",
                    session.isCurrent && "transform translate-x-1"
                  )}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={clsx(
                        "text-sm font-semibold",
                        session.isCurrent
                          ? "text-indigo-700 dark:text-indigo-400"
                          : session.isCompleted
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-600 dark:text-gray-400"
                      )}>
                        {session.title}
                      </span>

                      {session.status === "completed" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
                          Hoàn thành
                        </span>
                      )}
                      {session.status === "scheduled" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                          Sắp tới
                        </span>
                      )}
                      {session.status === "expired" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300">
                          Chưa xử lý
                        </span>
                      )}
                      {session.status === "ongoing" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 animate-pulse">
                          Đang diễn ra
                        </span>
                      )}
                      {session.status === "canceled" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400">
                          Đã hủy
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={10} className="text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{session.date}</span>
                      </div>
                      <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} className="text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{session.time}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-900/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span className="text-xs text-gray-500">Đã qua</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20 animate-pulse" />
              <span className="text-xs text-gray-500">Hiện tại</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs text-gray-500">Sắp tới</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ----- Stats Card with Progress -----
const StatsCard: React.FC<{ students: Student[] }> = ({ students }) => {
  const presentCount = students.filter(s => s.status === "present").length;
  const lateCount = students.filter(s => s.status === "late").length;
  const absentCount = students.filter(s => s.status === "absent").length;
  const total = students.length;
  const completed = presentCount + lateCount;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  const animatedCompleted = useCountUp(completed, 800);
  const animatedPresent = useCountUp(presentCount, 800);
  const animatedLate = useCountUp(lateCount, 800);
  const animatedAbsent = useCountUp(absentCount, 800);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Thống kê buổi học
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {animatedCompleted}
            <span className="text-sm text-gray-400 font-normal">/{total}</span>
          </div>
        </div>

        <div className="mb-5">
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">Đã điểm danh</span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { status: "present", count: animatedPresent, icon: UserCheck, color: "emerald", label: "Có mặt" },
            { status: "late", count: animatedLate, icon: ClockIcon, color: "amber", label: "Muộn" },
            { status: "absent", count: animatedAbsent, icon: UserX, color: "red", label: "Vắng mặt" },
          ].map((item) => (
            <motion.div
              key={item.status}
              whileHover={{ x: 4 }}
              className={clsx(
                "flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                `bg-${item.color}-50 dark:bg-${item.color}-950/20`
              )}
            >
              <div className="flex items-center gap-2">
                <item.icon size={14} className={`text-${item.color}-500`} />
                <span className={`text-xs font-medium text-${item.color}-600 dark:text-${item.color}-400`}>
                  {item.label}
                </span>
              </div>
              <span className={`text-sm font-bold text-${item.color}-600 dark:text-${item.color}-400`}>
                {item.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ----- Teacher Card Component -----
interface TeacherCardProps {
  subject: Subject | null;
  session: Session | null;
  teacherStatus: StatusType;
  teacherNote: string | null;
  onStatusChange: (status: StatusType) => void;
  onNoteChange: (note: string | null) => void;
  isReadOnly?: boolean;
  isCanceled?: boolean;
}

const TeacherCard: React.FC<TeacherCardProps> = ({
  subject,
  session,
  teacherStatus,
  teacherNote,
  onStatusChange,
  onNoteChange,
  isReadOnly = false,
  isCanceled = false
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(teacherNote || "");

  const teacher = subject?.teacherSubjects?.[0]?.teacher;
  const teacherName = teacher?.user?.fullName || "Chưa có giáo viên";
  const gender = teacher?.user?.gender;
  const teacherPrefix = gender === true ? "Thầy" : gender === false ? "Cô" : "GV";
  const startTime = session?.time?.split(" - ")[0] || "--:--";

  useEffect(() => {
    setNoteValue(teacherNote || "");
  }, [teacherNote]);

  const handleNoteSubmit = () => {
    onNoteChange(noteValue);
    setIsEditingNote(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNoteSubmit();
    } else if (e.key === "Escape") {
      setNoteValue(teacherNote || "");
      setIsEditingNote(false);
    }
  };

  const statusButtons = [
    { key: "present" as const, label: "Có mặt", icon: CheckCircle, color: "emerald" },
    { key: "late" as const, label: "Muộn", icon: Clock, color: "amber" },
    { key: "absent" as const, label: "Vắng", icon: XCircle, color: "red" },
  ];

  if (isCanceled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-red-100/40 to-orange-100/40 dark:from-red-900/20 dark:to-orange-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative p-5">
          <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle size={32} className="text-red-500 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                Buổi học đã bị hủy
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Không thể điểm danh cho buổi học này
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-100/40 to-violet-100/40 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-emerald-100/20 to-teal-100/20 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center">
                  <GraduationCap size={30} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className={clsx(
                "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-900 transition-all duration-300",
                teacherStatus === "present" ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" :
                  teacherStatus === "late" ? "bg-amber-500 shadow-lg shadow-amber-500/30" :
                    "bg-red-500 shadow-lg shadow-red-500/30"
              )} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
                  {teacherPrefix} {teacherName}
                </h3>
                <span className={clsx(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-300",
                  teacherStatus === "present"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : teacherStatus === "late"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                )}>
                  {teacherStatus === "present" ? "Đang dạy" : teacherStatus === "late" ? "Đi muộn" : "Vắng mặt"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs">Bắt đầu: {startTime}</span>
                </div>
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl backdrop-blur-sm">
                {statusButtons.map((btn) => {
                  const Icon = btn.icon;
                  const isActive = teacherStatus === btn.key;
                  const config = statusConfig[btn.key];

                  return (
                    <motion.button
                      key={btn.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onStatusChange(btn.key)}
                      className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                        isActive
                          ? `${config.bgLight} ${config.textLight} shadow-sm`
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      )}
                    >
                      <Icon size={12} />
                      <span className="hidden sm:inline">{btn.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="relative min-w-[200px]">
                {isEditingNote ? (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <input
                      ref={(ref) => ref?.focus()}
                      type="text"
                      value={noteValue}
                      onChange={(e) => setNoteValue(e.target.value)}
                      onBlur={handleNoteSubmit}
                      onKeyDown={handleKeyDown}
                      placeholder="Thêm ghi chú..."
                      className="flex-1 px-3 py-1.5 text-xs bg-transparent border-none focus:outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setIsEditingNote(true)}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-2",
                      teacherNote
                        ? "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                        : "text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                    )}
                  >
                    <Edit2 size={10} className="flex-shrink-0" />
                    <span className="truncate">{teacherNote || "Thêm ghi chú..."}</span>
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const StudentCard: React.FC<{
  student: Student;
  onStatusChange: (id: string, status: StatusType) => void;
  onNoteChange: (id: string, note: string) => void;
  index: number;
  isUpdatingStatus?: boolean;
  isUpdatingNote?: boolean;
}> = ({ student, onStatusChange, onNoteChange, index, isUpdatingStatus, isUpdatingNote }) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(student.note || "");
  const [isHoveringNote, setIsHoveringNote] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingNote && inputRef.current) inputRef.current.focus();
  }, [isEditingNote]);

  const handleNoteSubmit = () => {
    onNoteChange(student.id, noteValue);
    setIsEditingNote(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNoteSubmit();
    } else if (e.key === "Escape") {
      setNoteValue(student.note || "");
      setIsEditingNote(false);
    }
  };

  const getStatusLabel = (status: StatusType) => {
    switch (status) {
      case "present": return { label: "Có mặt", color: "emerald" };
      case "late": return { label: "Đi muộn", color: "amber" };
      case "absent": return { label: "Vắng", color: "red" };
      default: return { label: "Chưa điểm danh", color: "gray" };
    }
  };

  const statusInfo = getStatusLabel(student.status);

  const statusColors = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    gray: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900/50 border-slate-100 dark:border-gray-800 hover:shadow-md hover:border-slate-200 dark:hover:border-gray-700"
    >
      <div className="flex items-center gap-3 flex-1">
        <Avatar name={student.name} size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">{student.name}</p>
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              statusColors[statusInfo.color as keyof typeof statusColors]
            )}>
              {statusInfo.label}
            </span>
            {(isUpdatingStatus || isUpdatingNote) && (
              <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1">
             <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              student.gender === true
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : student.gender === false
                  ? "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            )}>
              {student.gender === true ? "Nam" : student.gender === false ? "Nữ" : "Khác"}
            </span>
            </div>
            <div className="flex items-center gap-1">
              <School size={10} className="text-slate-400" />
              <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                {student.schoolName || "Chưa có trường"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Toggle Buttons */}
        <div className="flex items-center gap-0.5 bg-gray-100/80 dark:bg-gray-800/80 p-0.5 rounded-lg">
          {["present", "late", "absent"].map((status) => {
            const isActive = student.status === status;
            const config = statusConfig[status as keyof typeof statusConfig];
            const Icon = config.icon;

            return (
              <motion.button
                key={status}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStatusChange(student.id, status as StatusType)}
                className={cn(
                  "p-1 rounded-lg transition-all duration-200",
                  isActive
                    ? `${config.bgLight} ${config.textLight} shadow-sm`
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                )}
                title={config.label}
              >
                <Icon size={14} />
              </motion.button>
            );
          })}
        </div>

        {/* Note Input */}
        <div 
          className="relative min-w-[160px] sm:min-w-[180px] md:min-w-[200px]"
          onMouseEnter={() => setIsHoveringNote(true)}
          onMouseLeave={() => setIsHoveringNote(false)}
        >
          {isEditingNote ? (
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-violet-500 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                onBlur={handleNoteSubmit}
                onKeyDown={handleKeyDown}
                placeholder="Nhập ghi chú..."
                className="flex-1 px-2 py-1 text-xs bg-transparent border-none focus:outline-none w-32 sm:w-36 md:w-44"
                disabled={isUpdatingNote}
                autoFocus
              />
            </div>
          ) : (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={() => !isUpdatingNote && setIsEditingNote(true)}
                className={cn(
                  "w-full text-left px-2 py-1 rounded-lg text-xs transition-all duration-200 flex items-center gap-1",
                  student.note
                    ? "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                    : "text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-violet-50 dark:hover:bg-violet-950/30 border border-transparent hover:border-violet-200 dark:hover:border-violet-800"
                )}
                disabled={isUpdatingNote}
              >
                <Edit2 size={10} className="flex-shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-[140px]">
                  {student.note || "Ghi chú"}
                </span>
              </motion.button>

              {student.note && isHoveringNote && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-xl max-w-xs break-words">
                    {student.note}
                    <div className="absolute -bottom-1 left-3 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MoreHorizontal size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ----- Session Content Card -----
const SessionContentCard: React.FC<{
  sessionId: number;
  onEdit?: () => void;
  isCanceled?: boolean;
}> = ({ sessionId, onEdit, isCanceled = false }) => {
  const [content, setContent] = useState<SessionContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { setAlert } = useOutletContext<any>();

  useEffect(() => {
    const fetchContent = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);
        const data = await sessionApi.getSessionContent(sessionId);
        setContent(data);
      } catch (error) {
        console.error("Error fetching session content:", error);
        setAlert?.({
          type: "error",
          message: "Không thể tải nội dung buổi học!",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [sessionId, setAlert]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const hasContent = content.displayTopic || content.displayContent || content.displayHomework;

  if (!hasContent && !isCanceled) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Chưa cập nhật nội dung buổi học
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              Vui lòng cập nhật nội dung trước khi điểm danh
            </p>
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all"
              >
                <Edit2 size={12} />
                Cập nhật nội dung
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isCanceled) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
            <XCircle size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
              Buổi học đã bị hủy
            </h3>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Không thể điểm danh cho buổi học này
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Nội dung buổi học
            </h3>
          </div>

          {content.isFollowingPlan !== undefined && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium ${content.isFollowingPlan
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              }`}>
              {content.isFollowingPlan ? (
                <CheckCircle size={10} />
              ) : (
                <AlertCircle size={10} />
              )}
              <span>{content.isFollowingPlan ? 'Đúng kế hoạch' : 'Lệch kế hoạch'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {content.displayTopic && (
          <div>
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <ClipboardList size={12} />
              CHỦ ĐỀ
            </label>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
              {content.displayTopic}
            </p>
          </div>
        )}

        {content.displayContent && (
          <div>
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText size={12} />
              NỘI DUNG
            </label>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {content.displayContent}
            </div>
          </div>
        )}

        {content.displayHomework && (
          <div>
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <ClipboardList size={12} />
              BÀI TẬP VỀ NHÀ
            </label>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {content.displayHomework}
            </p>
          </div>
        )}

        {content.deviationReason && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border-l-2 border-amber-400">
            <label className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              LÝ DO THAY ĐỔI
            </label>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {content.deviationReason}
            </p>
          </div>
        )}

        {content.noteForNextSession && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-l-2 border-blue-400">
            <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              GHI CHÚ CHO BUỔI SAU
            </label>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {content.noteForNextSession}
            </p>
          </div>
        )}

        {!content.isFollowingPlan && content.plannedTopic && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              KẾ HOẠCH THAM KHẢO
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-through mt-1">
              {content.plannedTopic}
            </p>
          </div>
        )}

        {onEdit && (
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEdit}
              className="w-full py-2 text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <Edit2 size={12} />
              Chỉnh sửa nội dung
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ----- Loading Skeleton -----
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-48 bg-slate-100 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-gray-700" />
          <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-gray-700" />
          <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-gray-700" />
        </div>
      </div>
    ))}
  </div>
);

// ----- Empty State -----
interface EmptyStateProps {
  hasStudents?: boolean;
  isLoading?: boolean;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hasStudents = false,
  isLoading = false,
  message
}) => {
  if (isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-3">
        <Users className="w-6 h-6 text-slate-400 dark:text-gray-500" />
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
        {message || (hasStudents ? "Không có học sinh hợp lệ" : "Không có học sinh")}
      </p>
      <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 max-w-sm">
        {message || (hasStudents
          ? "Tất cả học sinh trong buổi học này đều chưa được đăng ký, đã bị xóa hoặc đã hoàn thành khóa học trước đó."
          : "Chưa có dữ liệu điểm danh cho buổi học này. Vui lòng kiểm tra lại.")}
      </p>
    </motion.div>
  );
};


interface AttendanceSectionProps {
  subject: Subject | null;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({ subject }) => {
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [originalStudentList, setOriginalStudentList] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [teacherStatus, setTeacherStatus] = useState<StatusType>("present");
  const [originalTeacherStatus, setOriginalTeacherStatus] = useState<StatusType>("present");
  const [teacherNote, setTeacherNote] = useState<string | null>(null);
  const [originalTeacherNote, setOriginalTeacherNote] = useState<string | null>(null);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);
  const [updatingType, setUpdatingType] = useState<"status" | "note" | null>(null);
  const isCurrentSessionCanceled = selectedSession?.status === "canceled";

  const [showContentModal, setShowContentModal] = useState(false);
  const [hasUpdatedContent, setHasUpdatedContent] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<StatusType | "">("");

  const { setAlert } = useOutletContext<any>();

  const checkForChanges = () => {
    const studentChanges = JSON.stringify(studentList) !== JSON.stringify(originalStudentList);
    const teacherChanges = teacherStatus !== originalTeacherStatus || teacherNote !== originalTeacherNote;
    setHasChanges(studentChanges || teacherChanges);
  };

  const checkSessionContentStatus = async (sessionId: number) => {
    try {
      const content = await sessionApi.getSessionContent(sessionId);
      setHasUpdatedContent(!!content.displayTopic);
      return !!content.displayTopic;
    } catch (error) {
      console.error('Error checking session content:', error);
      return false;
    }
  };

  const fetchSchedule = async (subjectId: number) => {
    try {
      setLoadingSchedule(true);
      const res = await sessionApi.getScheduleBySubject(subjectId);

      const mapped = res.sessions
        .filter((item: SessionOfSubject) => new Date(item.sessionDate).getMonth() + 1 === selectedMonth)
        .sort((a: SessionOfSubject, b: SessionOfSubject) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
        .map((item: SessionOfSubject, index: number) => {
          const today = new Date();
          const start = new Date(`${item.sessionDate}T${item.startTime}`);
          const end = new Date(`${item.sessionDate}T${item.endTime}`);

          const isCurrentSession = today >= start && today <= end;
          const isCompletedSession = today > end;
          const apiStatus = item.status || "scheduled";

          return {
            id: item.id,
            title: `Buổi ${index + 1}: ${item.Room?.name || "Phòng học"}`,
            date: today.toDateString() === start.toDateString() ? "Hôm nay" : start.toLocaleDateString("vi-VN"),
            time: `${item.startTime.slice(0, 5)} - ${item.endTime.slice(0, 5)}`,
            sessionDate: item.sessionDate,
            isCurrent: isCurrentSession,
            isCompleted: isCompletedSession,
            status: apiStatus
          };
        });

      setSessions(mapped);
      if (mapped.length > 0 && !selectedSession) {
        setSelectedSession(mapped.find(s => s.isCurrent) || mapped[0]);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch học:", error);
      setAlert?.({
        type: "error",
        message: "Không thể tải lịch học. Vui lòng thử lại!",
      });
    } finally {
      setLoadingSchedule(false);
    }
  };

  const fetchAttendanceData = async (subjectId: number, sessionId: number) => {
    try {
      setIsLoading(true);

      const response = await attendanceApi.getBySubject(subjectId);
      const data: AttendanceResponse = response.data;

      const mappedStudents: Student[] = [];

      for (const student of data.students) {
        const attendance = student.attendances.find(
          (att: AttendanceItem) => att.sessionId === sessionId
        );

        if (!attendance) {
          mappedStudents.push({
            id: student.studentId.toString(),
            name: student.fullName,
            gender: student.gender,
            schoolName: student.schoolName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=6366f1&color=fff`,
            status: "absent",
            note: null,
          });
          continue;
        }

        const invalidStatuses = [
          "not_enrolled",
          "removed",
          "not_enrolled_yet",
          "completed"
        ];

        if (invalidStatuses.includes(attendance.status)) {
          console.log(`Skipped student: ${student.fullName} - Status: ${attendance.status}`);
          continue;
        }

        let uiStatus: StatusType = "absent";
        switch (attendance.status) {
          case "present":
            uiStatus = "present";
            break;
          case "late":
            uiStatus = "late";
            break;
          case "absent":
          case "pending":
          default:
            uiStatus = "absent";
        }

        mappedStudents.push({
          id: student.studentId.toString(),
          name: student.fullName,
          gender: student.gender,       
          schoolName: student.schoolName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=6366f1&color=fff`,
          status: uiStatus,
          note: attendance.note || null,
        });
      }

      console.log(`Total valid students: ${mappedStudents.length}`);

      setStudentList(mappedStudents);
      setOriginalStudentList(JSON.parse(JSON.stringify(mappedStudents)));
      setHasChanges(false);

      if (mappedStudents.length === 0) {
        setAlert?.({
          type: "info",
          message: "Buổi học này không có học sinh nào hợp lệ để điểm danh.",
          duration: 3000,
        });
      }

    } catch (error) {
      console.error("Lỗi lấy dữ liệu điểm danh:", error);
      setAlert?.({
        type: "error",
        message: "Không thể tải dữ liệu điểm danh. Vui lòng thử lại!",
      });
      setStudentList([]);
      setOriginalStudentList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeacherAttendanceData = async () => {
    if (!subject?.id || !selectedSession?.id) return;

    try {
      const response = await teacherAttendanceApi.getBySubject(subject.id);
      const data: TeacherAttendanceResponse = response.data;
      const teacher = subject?.teacherSubjects?.[0]?.teacher;
      const teacherId = teacher?.id;
      const foundTeacher = data.teachers.find(t => t.teacherId === teacherId);

      if (foundTeacher) {
        const sessionIdNum = selectedSession.id;
        const currentAttendance = foundTeacher.attendances.find(
          (att: TeacherAttendanceItem) => att.sessionId === sessionIdNum
        );

        if (currentAttendance) {
          let status: StatusType = "absent";
          if (currentAttendance.status === "present") status = "present";
          else if (currentAttendance.status === "late") status = "late";
          else if (currentAttendance.status === "absent") status = "absent";

          setTeacherStatus(status);
          setOriginalTeacherStatus(status);
          setTeacherNote(currentAttendance.note || null);
          setOriginalTeacherNote(currentAttendance.note || null);
        } else {
          setTeacherStatus("present");
          setOriginalTeacherStatus("present");
          setTeacherNote(null);
          setOriginalTeacherNote(null);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu điểm danh giáo viên:", error);
      setAlert?.({
        type: "error",
        message: "Không thể tải dữ liệu điểm danh giáo viên!",
      });
    }
  };

  const refreshSessionStatus = async () => {
    if (!subject?.id) return;

    try {
      const res = await sessionApi.getScheduleBySubject(subject.id);

      const updatedSessions = res.sessions
        .filter((item: SessionOfSubject) => new Date(item.sessionDate).getMonth() + 1 === selectedMonth)
        .sort((a: SessionOfSubject, b: SessionOfSubject) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
        .map((item: SessionOfSubject, index: number) => {
          const today = new Date();
          const start = new Date(`${item.sessionDate}T${item.startTime}`);
          const end = new Date(`${item.sessionDate}T${item.endTime}`);

          const isCurrentSession = today >= start && today <= end;
          const isCompletedSession = today > end;
          const apiStatus = item.status || "scheduled";

          return {
            id: item.id,
            title: `Buổi ${index + 1}: ${item.Room?.name || "Phòng học"}`,
            date: today.toDateString() === start.toDateString() ? "Hôm nay" : start.toLocaleDateString("vi-VN"),
            time: `${item.startTime.slice(0, 5)} - ${item.endTime.slice(0, 5)}`,
            sessionDate: item.sessionDate,
            isCurrent: isCurrentSession,
            isCompleted: isCompletedSession,
            status: apiStatus
          };
        });

      setSessions(updatedSessions);

      if (selectedSession) {
        const updatedSelectedSession = updatedSessions.find(s => s.id === selectedSession.id);
        if (updatedSelectedSession) {
          setSelectedSession(updatedSelectedSession);
        }
      }
    } catch (error) {
      console.error("Lỗi refresh session status:", error);
    }
  };

  const handleSave = async () => {
    if (!subject?.id || !selectedSession) {
      setAlert?.({
        type: "error",
        message: "Thiếu thông tin buổi học hoặc môn học!",
      });
      return;
    }

    setIsSaving(true);
    setSaveProgress(0);

    try {
      const changesList: string[] = [];
      const errors: string[] = [];

      const studentStatusUpdates: { studentId: number; status: StatusType }[] = [];
      const studentNoteUpdates: { studentId: number; note: string | null }[] = [];

      studentList.forEach((student) => {
        const original = originalStudentList.find(s => s.id === student.id);
        if (original) {
          if (student.status !== original.status) {
            studentStatusUpdates.push({
              studentId: parseInt(student.id),
              status: student.status,
            });
          }
          if (student.note !== original.note) {
            studentNoteUpdates.push({
              studentId: parseInt(student.id),
              note: student.note || null,
            });
          }
        }
      });

      const totalUpdates = studentStatusUpdates.length + studentNoteUpdates.length;
      let completedUpdates = 0;

      const processBatchWithRetry = async <T,>(
        items: T[],
        processor: (item: T) => Promise<any>,
        batchSize: number = 5,
        itemName: string = "item"
      ) => {
        if (items.length === 0) return [];

        const results: T[] = [];

        for (let i = 0; i < items.length; i += batchSize) {
          const batch = items.slice(i, i + batchSize);

          for (let j = 0; j < batch.length; j++) {
            const item = batch[j];
            let retries = 3;
            let success = false;
            let lastError: any;

            while (retries > 0 && !success) {
              try {
                await retryRequest(() => processor(item), 1, 1000);
                success = true;
                completedUpdates++;
                const progress = totalUpdates > 0 ? Math.round((completedUpdates / totalUpdates) * 100) : 0;
                setSaveProgress(Math.min(progress, 100));
              } catch (error: any) {
                lastError = error;
                retries--;
                if (retries === 0) {
                  const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
                  errors.push(`Lỗi ${itemName} #${i + j + 1}: ${errorMsg}`);
                  console.error(`Failed to update ${itemName} ${i + j + 1}:`, error);
                } else {
                  const delay = (3 - retries) * 1000;
                  console.log(`Retry ${itemName} ${i + j + 1} in ${delay}ms...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
              }
            }

            if (success) {
              results.push(item);
            }
          }
        }

        return results;
      };

      if (studentStatusUpdates.length > 0) {
        const updated = await processBatchWithRetry(
          studentStatusUpdates,
          (update) => attendanceApi.updateStatus({
            sessionId: selectedSession.id,
            studentId: update.studentId,
            status: update.status,
          }),
          5,
          "cập nhật trạng thái học sinh"
        );

        if (updated.length > 0) {
          changesList.push(`${updated.length}/${studentStatusUpdates.length} học sinh cập nhật trạng thái`);
        }
      }

      if (studentNoteUpdates.length > 0) {
        const updated = await processBatchWithRetry(
          studentNoteUpdates,
          (update) => attendanceApi.updateNote({
            sessionId: selectedSession.id,
            studentId: update.studentId,
            note: update.note,
          }),
          5,
          "cập nhật ghi chú học sinh"
        );

        if (updated.length > 0) {
          changesList.push(`${updated.length}/${studentNoteUpdates.length} học sinh cập nhật ghi chú`);
        }
      }

      const teacher = subject?.teacherSubjects?.[0]?.teacher;
      if (teacher?.id) {
        if (teacherStatus !== originalTeacherStatus) {
          try {
            await retryRequest(() =>
              teacherAttendanceApi.updateStatus({
                sessionId: selectedSession.id,
                teacherId: teacher.id,
                status: teacherStatus,
              }),
              3,
              1000
            );
            changesList.push(`Cập nhật trạng thái giáo viên: ${teacherStatus === "present" ? "Có mặt" : teacherStatus === "late" ? "Muộn" : "Vắng mặt"}`);
          } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
            errors.push(`Không thể cập nhật trạng thái giáo viên: ${errorMsg}`);
          }
        }

        if (teacherNote !== originalTeacherNote) {
          try {
            await retryRequest(() =>
              teacherAttendanceApi.updateNote({
                sessionId: selectedSession.id,
                teacherId: teacher.id,
                note: teacherNote || null,
              }),
              3,
              1000
            );
            changesList.push(`Cập nhật ghi chú giáo viên`);
          } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
            errors.push(`Không thể cập nhật ghi chú giáo viên: ${errorMsg}`);
          }
        }
      }

      await refreshSessionStatus();

      setOriginalStudentList(JSON.parse(JSON.stringify(studentList)));
      setOriginalTeacherStatus(teacherStatus);
      setOriginalTeacherNote(teacherNote);
      setHasChanges(false);

      if (errors.length > 0 && changesList.length > 0) {
        setAlert?.({
          type: "warning",
          message: `Lưu điểm danh có một số vấn đề:\n\n Thành công: ${changesList.join(", ")}\n\n Lỗi: ${errors.join(", ")}`,
          duration: 8000,
        });
      } else if (errors.length > 0) {
        setAlert?.({
          type: "error",
          message: `Lưu điểm danh thất bại:\n\n${errors.join("\n")}`,
          duration: 8000,
        });
        setStudentList(JSON.parse(JSON.stringify(originalStudentList)));
        setTeacherStatus(originalTeacherStatus);
        setTeacherNote(originalTeacherNote);
      } else if (changesList.length > 0) {
        setAlert?.({
          type: "success",
          message: `Lưu điểm danh thành công!\n\n${changesList.join("\n")}`,
          duration: 5000,
        });
      } else {
        setAlert?.({
          type: "info",
          message: "Không có thay đổi nào để lưu.",
          duration: 3000,
        });
      }

    } catch (error: any) {
      console.error("Lỗi nghiêm trọng khi lưu điểm danh:", error);

      setStudentList(JSON.parse(JSON.stringify(originalStudentList)));
      setTeacherStatus(originalTeacherStatus);
      setTeacherNote(originalTeacherNote);

      setAlert?.({
        type: "error",
        message: error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi lưu điểm danh. Vui lòng thử lại!",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  const handleRevert = () => {
    setStudentList(JSON.parse(JSON.stringify(originalStudentList)));
    setTeacherStatus(originalTeacherStatus);
    setTeacherNote(originalTeacherNote);
    setHasChanges(false);
  };

  const handleBulkStatusChange = (status: StatusType) => {
    if (!status) return;

    setStudentList(prev => prev.map(s => ({ ...s, status })));
    setBulkStatus("");

  };

  const updateStatus = (id: string, status: StatusType) => {
    setStudentList(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const updateNote = (id: string, note: string) => {
    setStudentList(prev => prev.map(s => s.id === id ? { ...s, note: note || null } : s));
  };

  const handleTeacherStatusChange = (status: StatusType) => {
    setTeacherStatus(status);
  };

  const handleTeacherNoteChange = (note: string | null) => {
    setTeacherNote(note);
  };

  useEffect(() => {
    checkForChanges();
  }, [studentList, teacherStatus, teacherNote]);

  useEffect(() => {
    if (subject?.id) fetchSchedule(subject.id);
  }, [subject?.id, selectedMonth]);

  useEffect(() => {
    if (subject?.id && selectedSession) {
      const loadData = async () => {
        const hasContent = await checkSessionContentStatus(selectedSession.id);

        if (!hasContent && selectedSession.status !== 'canceled') {
          setShowContentModal(true);
          return;
        }

        fetchAttendanceData(subject.id, selectedSession.id);
        fetchTeacherAttendanceData();
      };

      loadData();
    }
  }, [subject?.id, selectedSession]);


  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  const filteredStudents = studentList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleContentSaved = () => {
    setHasUpdatedContent(true);
    setShowContentModal(false);

    if (subject?.id && selectedSession) {
      fetchAttendanceData(subject.id, selectedSession.id);
      fetchTeacherAttendanceData();
    }

    setAlert?.({
      type: "success",
      message: "Đã cập nhật nội dung buổi học. Bạn có thể bắt đầu điểm danh.",
    });
  };

  const handleOpenContentModal = () => {
    setShowContentModal(true);
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Loader2 size={32} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Đang lưu điểm danh...
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Vui lòng đợi trong giây lát
                </p>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${saveProgress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                  />
                </div>
                <p className="text-xs text-gray-400">{saveProgress}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Điểm danh
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">{selectedSession?.title || subject?.name}</p>
            </div>

            {!isCurrentSessionCanceled && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học sinh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 w-48 sm:w-64 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusType | "all")}
                    className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Tất cả</option>
                    <option value="present">Có mặt</option>
                    <option value="late">Muộn</option>
                    <option value="absent">Vắng</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={bulkStatus}
                    onChange={(e) => handleBulkStatusChange(e.target.value as StatusType)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-all"
                  >
                    <option value="">Điểm danh tất cả</option>
                    <option value="present">Có mặt</option>
                    <option value="late">Muộn</option>
                    <option value="absent">Vắng</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                </div>

                {hasChanges && (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={handleRevert}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-200"
                  >
                    <XCircle size={16} />
                    Hủy thay đổi
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200",
                    hasChanges
                      ? "btn-gradient shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
                      : "bg-gray-400 cursor-not-allowed shadow-none",
                    "disabled:opacity-70 disabled:cursor-not-allowed"
                  )}
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? "Đang lưu..." : hasChanges ? "Lưu điểm danh" : "Đã lưu"}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-5">
            <SessionCard
              sessions={sessions}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              loadingSchedule={loadingSchedule}
              selectedSessionId={selectedSession?.id}
              onSessionClick={setSelectedSession}
            />

            {selectedSession && (
              <SessionContentCard
                sessionId={selectedSession.id}
                onEdit={handleOpenContentModal}
                isCanceled={isCurrentSessionCanceled}
              />
            )}

            {!isCurrentSessionCanceled && <StatsCard students={studentList} />}
          </div>

          <div className="lg:col-span-8 space-y-5">
            <TeacherCard
              subject={subject}
              session={selectedSession}
              teacherStatus={teacherStatus}
              teacherNote={teacherNote}
              onStatusChange={handleTeacherStatusChange}
              onNoteChange={handleTeacherNoteChange}
              isReadOnly={false}
              isCanceled={isCurrentSessionCanceled}
            />

            {!isCurrentSessionCanceled ? (
              <>
                <div className="bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Danh sách học sinh
                      </span>
                      <span className="text-xs text-gray-400">({filteredStudents.length})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-emerald-500/20" />
                        <span>Có mặt</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-amber-500/20" />
                        <span>Muộn</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-1 ring-red-500/20" />
                        <span>Vắng</span>
                      </div>
                      {hasChanges && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-medium">
                          Có thay đổi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence >
                      {isLoading ? (
                        <LoadingSkeleton />
                      ) : filteredStudents.length === 0 ? (
                        <EmptyState
                          hasStudents={studentList.length === 0 && originalStudentList.length > 0}
                          isLoading={isLoading}
                        />
                      ) : (
                        filteredStudents.map((student, idx) => (
                          <StudentCard
                            key={student.id}
                            student={student}
                            onStatusChange={updateStatus}
                            onNoteChange={updateNote}
                            index={idx}
                            isUpdatingStatus={updatingStudentId === student.id && updatingType === 'status'}
                            isUpdatingNote={updatingStudentId === student.id && updatingType === 'note'}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {filteredStudents.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span>Hiển thị {filteredStudents.length} / {studentList.length} học sinh</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {Math.round((studentList.filter(s => s.status === "present" || s.status === "late").length / (studentList.length || 1)) * 100)}% có mặt
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <SessionContentModal
        isOpen={showContentModal}
        onClose={() => {
          setShowContentModal(false);

          setHasUpdatedContent(false);

          if (selectedSession && subject?.id) {
            fetchAttendanceData(subject.id, selectedSession.id);
            fetchTeacherAttendanceData();

            checkSessionContentStatus(selectedSession.id).then(hasContent => {
              if (!hasContent && selectedSession.status !== 'canceled') {
                setAlert?.({
                  type: "warning",
                  message: "Bạn chưa cập nhật nội dung buổi học. Vui lòng cập nhật trước khi điểm danh.",
                  duration: 3000,
                });
              }
            });
          }
        }}
        session={selectedSession}
        subject={subject}
        onSaveSuccess={handleContentSaved}
      />
    </div>
  );
};

export default AttendanceSection;