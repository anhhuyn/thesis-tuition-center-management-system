import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Search,
  Plus,
  ChevronDown,
  Clock,
  User,
  MoreHorizontal,
  Edit2,
  Save,
  Sun,
  Moon,
  UserCheck,
  UserX,
  Clock as ClockIcon,
  GraduationCap,
  Calendar,
  Award,
  Activity,
} from "lucide-react";
import clsx from "clsx";
import type { Subject } from "../../../../utils/types/subject";
import { sessionApi } from "../../../../utils/api";
import type { SessionOfSubject } from "../../../../utils/types/session";
import { attendanceApi } from "../../../../utils/api/attendance.api";
import type { AttendanceResponse, StudentAttendance, AttendanceItem } from "../../../../utils/types/attendance";
import type { TeacherAttendance, TeacherAttendanceItem, TeacherAttendanceResponse } from "../../../../utils/types/teacher-attendance";
import { teacherAttendanceApi } from "../../../../utils/api/teacherAttendance.api";
import { useOutletContext } from "react-router-dom";

// ============================================================================
// TYPES
// ============================================================================
type AttendanceStatus = "present" | "late" | "absent" | "pending" | "not_enrolled" | "removed" | "not_enrolled_yet" | "completed";

type StatusType = "present" | "late" | "absent";

interface Student {
  id: string;
  name: string;
  avatar: string;
  status: StatusType;
  note?: string | null;
}

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  sessionDate?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
  status?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

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
  selectedSessionId?: string;
  onSessionClick?: (session: Session) => void;
}> = ({ sessions, selectedMonth, onMonthChange, loadingSchedule, selectedSessionId, onSessionClick }) => {
  // Giữ nguyên cách đếm như cũ
  const completedCount = sessions.filter(s => s.isCurrent || s.isCompleted).length;
  const totalSessions = sessions.length;

  // Hàm lấy màu cho dot dựa trên isCurrent/isCompleted (giữ nguyên logic cũ)
  const getDotColor = (session: Session) => {
    if (session.isCurrent) {
      return "border-indigo-500 bg-white dark:bg-gray-900 shadow-lg shadow-indigo-500/40";
    }
    if (session.isCompleted) {
      return "border-emerald-500 bg-white dark:bg-gray-900";
    }
    return "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900";
  };

  // Hàm lấy icon cho dot (giữ nguyên logic cũ)
  const getDotIcon = (session: Session) => {
    if (session.isCurrent) {
      return <CheckCircle size={12} className="text-indigo-500" />;
    }
    if (session.isCompleted) {
      return <CheckCircle size={12} className="text-emerald-500" />;
    }
    return null;
  };

  // Hàm lấy style cho status badge dựa trên API status
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300";
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300";
      case "expired":
        return "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300";
      case "ongoing":
        return "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 animate-pulse";
      case "canceled":
        return "bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400";
    }
  };

  // Hàm lấy text cho status badge dựa trên API status
  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case "completed": return "Hoàn thành";
      case "scheduled": return "Sắp tới";
      case "expired": return "Chưa xử lý";
      case "ongoing": return "Đang diễn ra";
      case "canceled": return "Đã hủy";
      default: return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
    >
      {/* Header - Giữ nguyên */}
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

      {/* Sessions List */}
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
            {/* Vertical line */}
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
                  {/* Stepper dot - Giữ nguyên logic cũ */}
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

                      {/* BADGE TỪ API STATUS - Ưu tiên hiển thị theo status */}
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

      {/* Footer - Giữ nguyên legends cũ */}
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
          >
            <Plus size={12} />
            <span>Xem chi tiết</span>
          </motion.button>
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

        {/* Progress bar */}
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

        {/* Stats list */}
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
  isCanceled?: boolean; // Thêm prop này
}

const TeacherCard: React.FC<TeacherCardProps> = ({
  subject,
  session,
  teacherStatus,
  teacherNote,
  onStatusChange,
  onNoteChange,
  isReadOnly = false,
  isCanceled = false // Mặc định là false
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(teacherNote || "");

  const teacher = subject?.teacherSubjects?.[0]?.teacher;
  const teacherName = teacher?.user?.fullName || "Chưa có giáo viên";
  const gender = teacher?.user?.gender;
  const teacherPrefix = gender === true ? "Thầy" : gender === false ? "Cô" : "GV";
  const startTime = session?.time?.split(" - ")[0] || "--:--";

  // Update note value when teacherNote changes from parent
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

  // Nếu buổi học bị hủy, hiển thị thông báo
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
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-100/40 to-violet-100/40 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-emerald-100/20 to-teal-100/20 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative p-5">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left - Teacher Info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center">
                  <GraduationCap size={30} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              {/* Status dot */}
              <div className={clsx(
                "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-900 transition-all duration-300",
                teacherStatus === "present" ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" :
                  teacherStatus === "late" ? "bg-amber-500 shadow-lg shadow-amber-500/30" :
                    "bg-red-500 shadow-lg shadow-red-500/30"
              )} />
            </div>

            {/* Teacher details */}
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

          {/* Right - Controls (only show when not read-only) */}
          {!isReadOnly && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Buttons Group */}
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

              {/* Note Input Section */}
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
// ----- Status Toggle Component -----
const StatusToggle: React.FC<{
  status: StatusType;
  onChange: (status: StatusType) => void;
}> = ({ status, onChange }) => {
  const buttons = [
    { key: "present" as const, icon: CheckCircle, label: "Có mặt" },
    { key: "late" as const, icon: Clock, label: "Muộn" },
    { key: "absent" as const, icon: XCircle, label: "Vắng" },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
      {buttons.map((btn) => {
        const Icon = btn.icon;
        const isActive = status === btn.key;
        const config = statusConfig[btn.key];

        return (
          <motion.button
            key={btn.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(btn.key)}
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
  );
};

// ----- Student Card -----
// Student Card - VERSION ĐƠN GIẢN (chỉ có 1 case)
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

  // CHỈ CÒN 1 CASE: Học sinh bình thường
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Student Info */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all duration-200"
            />
            <div className={clsx(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-900",
              student.status === "present" ? "bg-emerald-500" :
                student.status === "late" ? "bg-amber-500" :
                  "bg-red-500"
            )} />
            {(isUpdatingStatus || isUpdatingNote) && (
              <div className="absolute -top-1 -right-1 w-4 h-4">
                <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{student.name}</div>
            <div className="text-xs text-gray-400">#{student.id}</div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex-1 flex justify-center sm:justify-start">
          <div className={isUpdatingStatus ? "opacity-50 pointer-events-none" : ""}>
            <StatusToggle
              status={student.status}
              onChange={(newStatus) => onStatusChange(student.id, newStatus)}
            />
          </div>
        </div>

        {/* Note with inline edit */}
        <div className="flex-1 min-w-[140px]">
          {isEditingNote ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                onBlur={handleNoteSubmit}
                onKeyDown={handleKeyDown}
                placeholder="Thêm ghi chú..."
                disabled={isUpdatingNote}
                className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
              />
              {isUpdatingNote && (
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => !isUpdatingNote && setIsEditingNote(true)}
              className={clsx(
                "w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 group/note",
                student.note
                  ? "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50"
                  : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
                isUpdatingNote && "opacity-50 cursor-not-allowed"
              )}
              disabled={isUpdatingNote}
            >
              <Edit2 size={10} className="opacity-0 group-hover/note:opacity-100 transition-opacity" />
              <span className="truncate">{student.note || "Thêm ghi chú..."}</span>
            </motion.button>
          )}
        </div>

        {/* More actions */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MoreHorizontal size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
};
// ----- Loading Skeleton -----
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((j) => (
              <div key={j} className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
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
      className="text-center py-12"
    >
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
        <User size={32} className="text-gray-400" />
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 font-medium mb-1">
        {message || (hasStudents ? "Không có học sinh hợp lệ" : "Không có học sinh")}
      </h3>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        {message || (hasStudents
          ? "Tất cả học sinh trong buổi học này đều chưa được đăng ký, đã bị xóa hoặc đã hoàn thành khóa học trước đó."
          : "Chưa có dữ liệu điểm danh cho buổi học này. Vui lòng kiểm tra lại.")}
      </p>
    </motion.div>
  );
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================

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

  // Get setAlert from context
  const { setAlert } = useOutletContext<any>();

  // Check if there are any changes
  const checkForChanges = () => {
    const studentChanges = JSON.stringify(studentList) !== JSON.stringify(originalStudentList);
    const teacherChanges = teacherStatus !== originalTeacherStatus || teacherNote !== originalTeacherNote;
    setHasChanges(studentChanges || teacherChanges);
  };

  // Fetch schedule
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

          // Giữ nguyên logic cũ để xác định isCurrent, isCompleted
          const isCurrentSession = today >= start && today <= end;
          const isCompletedSession = today > end;

          // Lấy status từ API
          const apiStatus = item.status || "scheduled";

          return {
            id: item.id.toString(),
            title: `Buổi ${index + 1}: ${item.Room?.name || "Phòng học"}`,
            date: today.toDateString() === start.toDateString() ? "Hôm nay" : start.toLocaleDateString("vi-VN"),
            time: `${item.startTime.slice(0, 5)} - ${item.endTime.slice(0, 5)}`,
            sessionDate: item.sessionDate,
            isCurrent: isCurrentSession,
            isCompleted: isCompletedSession,
            status: apiStatus // Status từ API
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

  // Fetch attendance data - CHỈ LẤY HỌC SINH THỰC SỰ THAM GIA
  const fetchAttendanceData = async (subjectId: number, sessionId: string) => {
    try {
      setIsLoading(true);

      // Gọi API lấy dữ liệu điểm danh
      const response = await attendanceApi.getBySubject(subjectId);
      const data: AttendanceResponse = response.data;
      const sessionIdNum = parseInt(sessionId);

      // Xử lý từng học sinh - CHỈ LẤY HỌC SINH CÓ THỂ ĐIỂM DANH
      const mappedStudents: Student[] = [];

      for (const student of data.students) {
        // Tìm attendance record cho session hiện tại
        const attendance = student.attendances.find(
          (att: AttendanceItem) => att.sessionId === sessionIdNum
        );

        // ============================================================
        // QUAN TRỌNG: Bỏ qua các học sinh KHÔNG thể điểm danh
        // ============================================================

        // Không có attendance record -> vẫn có thể điểm danh (chưa điểm danh lần nào)
        if (!attendance) {
          mappedStudents.push({
            id: student.studentId.toString(),
            name: student.fullName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=6366f1&color=fff`,
            status: "absent", // Mặc định chưa điểm danh
            note: null,
          });
          continue;
        }

        // Bỏ qua các status KHÔNG thể điểm danh
        const invalidStatuses = [
          "not_enrolled",      // Chưa đăng ký trong toàn bộ khóa học
          "removed",           // Đã bị xóa khỏi lớp
          "not_enrolled_yet",  // Chưa đăng ký tại thời điểm session này
          "completed"          // Đã hoàn thành khóa học trước session này
        ];

        if (invalidStatuses.includes(attendance.status)) {
          console.log(`⏭️ Skipped student: ${student.fullName} - Status: ${attendance.status}`);
          continue; // Không thêm vào danh sách
        }

        // Các status hợp lệ: present, late, absent, pending
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

  // Fetch teacher attendance data
  const fetchTeacherAttendanceData = async () => {
    if (!subject?.id || !selectedSession?.id) return;

    try {
      const response = await teacherAttendanceApi.getBySubject(subject.id);
      const data: TeacherAttendanceResponse = response.data;
      const teacher = subject?.teacherSubjects?.[0]?.teacher;
      const teacherId = teacher?.id;
      const foundTeacher = data.teachers.find(t => t.teacherId === teacherId);

      if (foundTeacher) {
        const sessionIdNum = parseInt(selectedSession.id);
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
    // Gọi lại API để lấy dữ liệu mới
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
          id: item.id.toString(),
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
    
    // Cập nhật lại selected session nếu cần
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

  // Save all changes when clicking save button
  // Save all changes when clicking save button
const handleSave = async () => {
  if (!subject?.id || !selectedSession) return;
  setIsSaving(true);

  try {
    const promises = [];
    const changesList: string[] = [];

    // Save student changes
    const studentChanges = studentList.filter((student, index) => {
      const original = originalStudentList[index];
      return original && (student.status !== original.status || student.note !== original.note);
    });

    let studentStatusChanges = 0;
    let studentNoteChanges = 0;

    for (const student of studentChanges) {
      const original = originalStudentList.find(s => s.id === student.id);
      if (original && (student.status !== original.status)) {
        promises.push(
          attendanceApi.updateStatus({
            sessionId: parseInt(selectedSession.id),
            studentId: parseInt(student.id),
            status: student.status,
          })
        );
        studentStatusChanges++;
      }
      if (original && (student.note !== original.note)) {
        promises.push(
          attendanceApi.updateNote({
            sessionId: parseInt(selectedSession.id),
            studentId: parseInt(student.id),
            note: student.note || null,
          })
        );
        studentNoteChanges++;
      }
    }

    if (studentStatusChanges > 0) {
      changesList.push(`${studentStatusChanges} học sinh cập nhật trạng thái`);
    }
    if (studentNoteChanges > 0) {
      changesList.push(`${studentNoteChanges} học sinh cập nhật ghi chú`);
    }

    // Save teacher changes
    if (teacherStatus !== originalTeacherStatus) {
      const teacher = subject?.teacherSubjects?.[0]?.teacher;
      if (teacher?.id) {
        promises.push(
          teacherAttendanceApi.updateStatus({
            sessionId: parseInt(selectedSession.id),
            teacherId: teacher.id,
            status: teacherStatus,
          })
        );
        changesList.push(`Cập nhật trạng thái giáo viên: ${teacherStatus === "present" ? "Có mặt" : teacherStatus === "late" ? "Muộn" : "Vắng mặt"}`);
      }
    }

    if (teacherNote !== originalTeacherNote) {
      const teacher = subject?.teacherSubjects?.[0]?.teacher;
      if (teacher?.id) {
        promises.push(
          teacherAttendanceApi.updateNote({
            sessionId: parseInt(selectedSession.id),
            teacherId: teacher.id,
            note: teacherNote || null,
          })
        );
        changesList.push(`Cập nhật ghi chú giáo viên`);
      }
    }

    // Execute all API calls
    await Promise.all(promises);

    // ✅ QUAN TRỌNG: Refresh session status sau khi lưu thành công
    await refreshSessionStatus();

    // Update original data after successful save
    setOriginalStudentList(JSON.parse(JSON.stringify(studentList)));
    setOriginalTeacherStatus(teacherStatus);
    setOriginalTeacherNote(teacherNote);
    setHasChanges(false);

    // Show success alert
    if (changesList.length > 0) {
      setAlert?.({
        type: "success",
        message: `Lưu điểm danh thành công!\n${changesList.join(", ")}`,
      });
    } else {
      setAlert?.({
        type: "info",
        message: "Không có thay đổi nào để lưu.",
      });
    }
  } catch (error: any) {
    console.error("Lỗi lưu điểm danh:", error);

    setAlert?.({
      type: "error",
      message: error?.response?.data?.message || "Có lỗi xảy ra khi lưu điểm danh. Vui lòng thử lại!",
    });

    setStudentList(JSON.parse(JSON.stringify(originalStudentList)));
    setTeacherStatus(originalTeacherStatus);
    setTeacherNote(originalTeacherNote);
  } finally {
    setIsSaving(false);
  }
};

  // Handle revert changes
  const handleRevert = () => {
    setAlert?.({
      type: "warning",
      message: "Bạn có chắc chắn muốn hủy bỏ các thay đổi?",
      action: {
        label: "Xác nhận",
        onClick: () => {
          setStudentList(JSON.parse(JSON.stringify(originalStudentList)));
          setTeacherStatus(originalTeacherStatus);
          setTeacherNote(originalTeacherNote);
          setHasChanges(false);
          setAlert?.({
            type: "success",
            message: "Đã hủy bỏ các thay đổi.",
          });
        },
      },
      secondaryAction: {
        label: "Hủy",
        onClick: () => { },
      },
    });
  };

  // Local update functions
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

  // Check for changes whenever data updates
  useEffect(() => {
    checkForChanges();
  }, [studentList, teacherStatus, teacherNote]);

  // Effects
  useEffect(() => {
    if (subject?.id) fetchSchedule(subject.id);
  }, [subject?.id, selectedMonth]);

  useEffect(() => {
    if (subject?.id && selectedSession) {
      fetchAttendanceData(subject.id, selectedSession.id);
      fetchTeacherAttendanceData();
    }
  }, [subject?.id, selectedSession]);

  // Dark mode
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Điểm danh
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">{selectedSession?.title || subject?.name}</p>
            </div>

            {/* Chỉ hiển thị các nút điều khiển khi buổi học không bị hủy */}
            {!isCurrentSessionCanceled && (
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học sinh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 w-56 sm:w-64 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>

                {/* Filter Dropdown */}
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

                {/* Revert Button - Hiển thị khi có thay đổi */}
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

                {/* Save Button */}
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {hasChanges ? "Lưu điểm danh" : "Đã lưu"}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL - Sessions + Stats */}
          <div className="lg:col-span-4 space-y-5">
            <SessionCard
              sessions={sessions}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              loadingSchedule={loadingSchedule}
              selectedSessionId={selectedSession?.id}
              onSessionClick={setSelectedSession}
            />
            {/* Chỉ hiển thị StatsCard khi buổi học không bị hủy */}
            {!isCurrentSessionCanceled && <StatsCard students={studentList} />}
          </div>

          {/* RIGHT PANEL - Teacher + Student List */}
          {/* RIGHT PANEL - Teacher + Student List */}
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

            {/* Chỉ hiển thị danh sách học sinh khi buổi học không bị hủy */}
            {!isCurrentSessionCanceled ? (
              <>
                {/* Student List Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Danh sách học sinh
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                      {filteredStudents.length} / {studentList.length}
                    </span>
                    {hasChanges && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        Có thay đổi chưa lưu
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Có mặt</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Muộn</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Vắng</span>
                    </div>
                  </div>
                </div>

                {/* Student List */}
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : filteredStudents.length === 0 ? (
                    <EmptyState
                      hasStudents={studentList.length === 0 && originalStudentList.length > 0}
                      isLoading={isLoading}
                    />
                  ) : (
                    <div className="space-y-2 max-h-[1000px] custom-scrollbar pr-2">
                      {filteredStudents.map((student, idx) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          onStatusChange={updateStatus}
                          onNoteChange={updateNote}
                          index={idx}
                          isUpdatingStatus={updatingStudentId === student.id && updatingType === 'status'}
                          isUpdatingNote={updatingStudentId === student.id && updatingType === 'note'}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AttendanceSection;