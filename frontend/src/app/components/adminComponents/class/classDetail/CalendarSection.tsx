import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Edit3,
  Upload,
  Trash2,
  TrendingUp,
  CheckCircle,
  Clock,
  UserCheck,
  MapPin,
  MoreHorizontal,
  X,
  CalendarPlus,
  ClockPlus,
} from "lucide-react";
import { sessionApi } from "../../../../utils/api";
import type { SessionDetail, SessionOfSubject } from "../../../../utils/types/session";
import type { AttendanceToday } from "../../../../utils/types/attendance";
import { attendanceApi } from "../../../../utils/api/attendance.api";
import CreateScheduleModal from "./CreateScheduleModal";
import CreateSessionModal from "./CreateSessionModal";
import type { Subject } from "../../../../utils/types/subject";

// ============================================================================
// Constants & Utilities - Vietnamese
// ============================================================================
const WEEKDAYS_FULL = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
const WEEKDAYS_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const parseDate = (date: string) => new Date(date);
const formatTime = (time: string) => time.slice(0, 5);
const isSameDay = (date1: Date, date2: Date) =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() === date2.getFullYear();

const getStatusConfig = (status?: string) => {
  switch (status) {
    case "completed":
      return { color: "emerald", label: "Đã hoàn thành", dotClass: "bg-emerald-500", bgClass: "bg-emerald-50 dark:bg-emerald-500/10", textClass: "text-emerald-700 dark:text-emerald-400" };
    case "scheduled":
      return { color: "blue", label: "Sắp diễn ra", dotClass: "bg-blue-500", bgClass: "bg-blue-50 dark:bg-blue-500/10", textClass: "text-blue-700 dark:text-blue-400" };
    case "canceled":
      return { color: "rose", label: "Đã hủy", dotClass: "bg-rose-500", bgClass: "bg-rose-50 dark:bg-rose-500/10", textClass: "text-rose-700 dark:text-rose-400" };
    case "expired":
      return { color: "rose", label: "Chưa xử lý", dotClass: "bg-yellow-500", bgClass: "bg-yellow-50 dark:bg-yellow-500/10", textClass: "text-yellow-700 dark:text-yellow-400" };
    default:
      return { color: "gray", label: "Chưa có trạng thái", dotClass: "bg-gray-400", bgClass: "bg-gray-50 dark:bg-gray-500/10", textClass: "text-gray-600 dark:text-gray-400" };
  }
};

// ============================================================================
// Props Interface
// ============================================================================
interface CalendarSectionProps {
  subject: Subject | null;
  isLoading?: boolean;
  onEditClass?: () => void;
  onAddSession?: () => void;
  onEditAttendance?: () => void;
  onUploadMaterial?: () => void;
  onCancelSession?: () => void;
  isTeacher?: boolean;
}

// ============================================================================
// Floating Action Buttons Component
// ============================================================================
interface FloatingActionButtonsProps {
  onOpenSchedule: () => void;
  onOpenSession: () => void;
}

const FloatingActionButtons = memo(({ onOpenSchedule, onOpenSession }: FloatingActionButtonsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Keyboard shortcut: 'C' for create schedule, 'S' for add session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onOpenSchedule();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onOpenSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSchedule, onOpenSession]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main FAB */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-full right-0 mb-4 space-y-3"
          >
            {/* Schedule FAB - Tạo lịch học */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ delay: 0.05 }}
              className="relative flex items-center justify-end gap-3"
              onMouseEnter={() => setShowTooltip("schedule")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {showTooltip === "schedule" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 z-50"
                  >
                    <div className="relative px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg border border-slate-700/50 whitespace-nowrap">

                      <div className="flex items-center gap-2">
                        <span>📅 Tạo lịch học</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 dark:bg-slate-700 rounded-md border border-slate-600">
                          C
                        </kbd>
                      </div>

                      {/* Arrow giống tooltip upload */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-t border-slate-700/50" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  setIsOpen(false);
                  onOpenSchedule();
                }}
                className="w-12 h-12 rounded-full btn-gradient text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              >
                <CalendarPlus size={20} />
              </motion.button>
            </motion.div>
            {/* Session FAB - Thêm buổi học */}
            <motion.div
              className="relative flex items-center justify-end gap-3"
              onMouseEnter={() => setShowTooltip("session")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  setIsOpen(false);
                  onOpenSession();
                }}
                className="w-12 h-12 rounded-full btn-gradient text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center"
              >
                <ClockPlus size={20} />
              </motion.button>

              {/* Tooltip FIXED POSITION */}
              <AnimatePresence>
                {showTooltip === "session" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 z-50"
                  >
                    <div className="relative px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg border border-slate-700/50 whitespace-nowrap">

                      <div className="flex items-center gap-2">
                        <span>➕ Thêm buổi học</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 dark:bg-slate-700 rounded-md border border-slate-600">
                          S
                        </kbd>
                      </div>

                      {/* ARROW */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-t border-slate-700/50" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/40 dark:shadow-indigo-600/50 backdrop-blur-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-300"
        animate={{
          y: [0, -3, 0, -2, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ filter: "blur(8px)" }}
        />

        {/* Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 flex items-center justify-center w-full h-full"
        >
          <Plus size={24} strokeWidth={1.8} />
        </motion.div>

        {/* Pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-indigo-400/60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.button>
    </div>
  );
});

// ============================================================================
// Sub-components
// ============================================================================

// Modern Stat Card with animation and mini progress
const StatCard = memo(({ label, value, icon: Icon, trend, color }: any) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 800;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const getColorClasses = (colorName: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400" },
      emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
      amber: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
      violet: { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
    };
    return colorMap[colorName] || colorMap.indigo;
  };

  const colorClasses = getColorClasses(color);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{count}{label === "Tỷ lệ chuyên cần" ? "%" : ""}</p>
        </div>
        <div className={`p-2 rounded-xl ${colorClasses.bg} ${colorClasses.text}`}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          <TrendingUp size={12} className="text-emerald-500" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400">{trend}</span>
          <span className="text-xs text-slate-400 ml-auto">so với tháng trước</span>
        </div>
      )}
      {label === "Tỷ lệ chuyên cần" && (
        <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
});

// Modern Calendar Cell
const CalendarCell = memo(({
  day,
  sessions,
  isToday,
  isPast,
  isCurrentMonth,
  selectedSessionId,
  onSelectSession,
  onSelectDate
}: any) => {
  const hasSessions = sessions.length > 0;

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      onClick={() => onSelectDate(day.date)}
      className={`
        relative border-b border-r border-slate-100 dark:border-slate-800/50 p-2 md:p-3
        transition-all duration-150 cursor-pointer
        ${!isCurrentMonth ? "bg-slate-50/30 dark:bg-slate-900/30" : "bg-white dark:bg-slate-900"}
        ${isPast && isCurrentMonth ? "opacity-60" : "opacity-100"}
        hover:z-10 hover:shadow-sm
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start">
          <span className={`
            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
            ${isToday ? "btn-gradient text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30" : ""}
            ${!isToday && isCurrentMonth ? "text-slate-700 dark:text-slate-300" : ""}
            ${!isCurrentMonth ? "text-slate-400 dark:text-slate-600" : ""}
          `}>
            {day.date.getDate()}
          </span>
          {hasSessions && !isToday && (
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-1"></div>
          )}
        </div>

        <div className="mt-1 space-y-1">
          {sessions.slice(0, 2).map((session: SessionOfSubject) => {
            const isSelected = selectedSessionId === session.id;
            const { dotClass } = getStatusConfig(session.status);
            return (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02, x: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSession(session);
                }}
                className={`
                  text-[10px] md:text-xs p-1 md:p-1.5 rounded-lg cursor-pointer
                  transition-all duration-150 flex items-center gap-1.5
                  ${isSelected ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                  bg-white dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50
                `}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </span>
              </motion.div>
            );
          })}
          {sessions.length > 2 && (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 pl-1 font-medium">
              +{sessions.length - 2} buổi nữa
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// Session Pill for List View (Mobile)
const SessionPill = memo(({ session, onClick }: any) => {
  const { dotClass, label, bgClass, textClass } = getStatusConfig(session.status);
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => onClick(session)}
      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(session.sessionDate).toLocaleDateString("vi-VN", { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
      <div className={`text-xs px-2 py-1 rounded-full ${bgClass} ${textClass}`}>
        {label}
      </div>
    </motion.div>
  );
});

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
    <div className="grid grid-cols-7 gap-2">
      {[...Array(7)].map((_, i) => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>)}
    </div>
  </div>
);

// Empty State
const EmptyState = ({ message, action }: any) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
      <Calendar size={28} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chưa có buổi học nào</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{message}</p>
    {action && (
      <button onClick={action.onClick} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700 transition-all">
        {action.label}
      </button>
    )}
  </div>
);

// ============================================================================
// Main Component
// ============================================================================
export const CalendarSection: React.FC<CalendarSectionProps> = memo(({
  subject,
  isLoading = false,
  onEditClass,
  onAddSession,
  onEditAttendance,
  onUploadMaterial,
  onCancelSession,
  isTeacher = false,
}) => {
  const [sessions, setSessions] = useState<SessionOfSubject[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionOfSubject | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [loading, setLoading] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionOfSubject | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // State for session detail from API
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  if (!subject) return null;
  const SUBJECT_ID = subject.id;

  // Fetch sessions
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await sessionApi.getScheduleBySubject(SUBJECT_ID);
        setSessions(res.sessions);
      } catch (err) {
        console.error("Không thể tải danh sách buổi học:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [SUBJECT_ID]);

  // Fetch session detail when selected session changes
  useEffect(() => {
    if (!selectedSession?.id) {
      setSessionDetail(null);
      return;
    }

    const fetchSessionDetail = async () => {
      try {
        setLoadingDetail(true);
        const detail = await sessionApi.getSessionDetail(selectedSession.id);
        setSessionDetail(detail);
      } catch (err) {
        console.error("Không thể tải chi tiết buổi học:", err);
        setSessionDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchSessionDetail();
  }, [selectedSession?.id]);

  // Auto-select today's session
  useEffect(() => {
    if (!sessions.length) return;
    const today = new Date();
    const todaySession = sessions.find((s) => isSameDay(parseDate(s.sessionDate), today));
    if (todaySession) {
      setSelectedDate(parseDate(todaySession.sessionDate));
      setSelectedSession(todaySession);
    } else {
      setSelectedDate(sessions[0] ? parseDate(sessions[0].sessionDate) : null);
      setSelectedSession(sessions[0] || null);
    }
  }, [sessions]);

  // Calendar navigation
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);
  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);
  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    let startingDayOfWeek = firstDayOfMonth.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];
    for (let i = startingDayOfWeek; i > 0; i--) {
      days.push({ date: new Date(year, month, -i + 1), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = 1; i <= totalCells - days.length; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [currentMonth]);

  const getSessionsForDate = useCallback((date: Date) => {
    return sessions.filter((s) => isSameDay(parseDate(s.sessionDate), date));
  }, [sessions]);

  const stats = useMemo(() => {
    const completed = sessions.filter(s => s.status === "completed").length;
    const upcoming = sessions.filter(s => s.status === "scheduled").length;
    return { total: sessions.length, completed, upcoming };
  }, [sessions]);

  // Calculate attendance stats from session detail
  const attendanceStats = useMemo(() => {
    if (!sessionDetail) {
      return { present: 0, late: 0, absent: 0, total: 0, attendanceRate: 0 };
    }
    
    const present = sessionDetail.studentAttendances.filter(s => s.attendanceStatus === 'present').length;
    const late = sessionDetail.studentAttendances.filter(s => s.attendanceStatus === 'late').length;
    const absent = sessionDetail.studentAttendances.filter(s => s.attendanceStatus === 'absent').length;
    const total = present + late + absent;
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    
    return { present, late, absent, total, attendanceRate };
  }, [sessionDetail]);

  const handleSelectSession = useCallback((session: SessionOfSubject) => {
    setSelectedDate(parseDate(session.sessionDate));
    setSelectedSession(session);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    const sessionsOfDay = getSessionsForDate(date);
    setSelectedDate(date);
    setSelectedSession(sessionsOfDay[0] || null);
  }, [getSessionsForDate]);

  const handleOpenScheduleModal = () => setShowScheduleModal(true);
  const handleCloseScheduleModal = () => setShowScheduleModal(false);
  const handleScheduleSuccess = useCallback(async () => {
    try {
      setLoading(true);
      const res = await sessionApi.getScheduleBySubject(SUBJECT_ID);
      setSessions(res.sessions);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [SUBJECT_ID]);

  const handleOpenSessionModal = () => { setEditingSession(null); setShowSessionModal(true); };
  const handleCloseSessionModal = () => { setShowSessionModal(false); setEditingSession(null); };
  const handleSessionSuccess = useCallback(async () => {
    try {
      setLoading(true);
      const res = await sessionApi.getScheduleBySubject(SUBJECT_ID);
      setSessions(res.sessions);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [SUBJECT_ID]);

  const handleEditSession = () => { if (selectedSession) { setEditingSession(selectedSession); setShowSessionModal(true); } };

  if (isLoading || loading) return <SkeletonLoader />;

  return (
    <div className="min-h-screen dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1600px] mx-auto px-10">
        {/* Header with Stats */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard label="Tổng buổi học" value={stats.total} icon={Calendar} color="indigo" />
            <StatCard label="Đã hoàn thành" value={stats.completed} icon={CheckCircle} color="emerald" />
            <StatCard label="Sắp tới" value={stats.upcoming} icon={Clock} color="amber" />
            <StatCard 
              label="Tỷ lệ chuyên cần" 
              value={attendanceStats.attendanceRate} 
              icon={UserCheck} 
              color="violet" 
            />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/30 overflow-hidden">
              {/* Calendar Toolbar */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={goToPreviousMonth}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={goToCurrentMonth}
                      className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Tháng này
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={goToNextMonth}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {currentMonth.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                  </h2>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${viewMode === "grid"
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                  >
                    Lưới
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${viewMode === "list"
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                  >
                    Danh sách
                  </motion.button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Đã hoàn thành</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Sắp diễn ra</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Đã hủy</span>
                </div>
              </div>

              {/* Calendar Grid or List View */}
              <AnimatePresence mode="wait">
                {viewMode === "grid" ? (
                  <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      {WEEKDAYS_SHORT.map((day, idx) => (
                        <div key={day} className="p-3 text-center">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{day}</span>
                          <span className="hidden md:inline text-xs text-slate-400 ml-1">({WEEKDAYS_FULL[idx]})</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 auto-rows-[110px] md:auto-rows-[130px]">
                      {calendarDays.map((day, index) => {
                        const daySessions = getSessionsForDate(day.date);
                        const today = new Date();
                        const isToday = isSameDay(day.date, today);
                        const isPast = day.date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        return (
                          <CalendarCell
                            key={index}
                            day={day}
                            sessions={daySessions}
                            isToday={isToday}
                            isPast={isPast}
                            isCurrentMonth={day.isCurrentMonth}
                            selectedSessionId={selectedSession?.id}
                            onSelectSession={handleSelectSession}
                            onSelectDate={handleSelectDate}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                    {sessions.length === 0 ? (
                      <EmptyState
                        message="Chưa có buổi học nào được lên lịch cho lớp học này"
                        action={{ label: "Thêm buổi học", onClick: handleOpenSessionModal }}
                      />
                    ) : (
                      sessions.map(session => <SessionPill key={session.id} session={session} onClick={handleSelectSession} />)
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Panel - Session Detail */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-8 space-y-6">
              {selectedSession && sessionDetail ? (
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
                  <div className="relative p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chi tiết buổi học</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(sessionDetail.sessionDate).toLocaleDateString("vi-VN", { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatTime(sessionDetail.startTime)} - {formatTime(sessionDetail.endTime)}
                        </p>
                        {sessionDetail.room && (
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {sessionDetail.room.name}
                          </p>
                        )}
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusConfig(sessionDetail.status).bgClass} ${getStatusConfig(sessionDetail.status).textClass}`}>
                        {getStatusConfig(sessionDetail.status).label}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-6">

                    {/* Attendance Section with Progress */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Users size={16} /> Tổng quan điểm danh
                      </h4>
                      {loadingDetail ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                        </div>
                      ) : sessionDetail ? (
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Có mặt</span>
                            <span className="font-semibold text-emerald-600">{attendanceStats.present}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Đi trễ</span>
                            <span className="font-semibold text-amber-600">{attendanceStats.late}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Vắng mặt</span>
                            <span className="font-semibold text-rose-600">{attendanceStats.absent}</span>
                          </div>
                          <div className="pt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Tỷ lệ chuyên cần</span>
                              <span>{attendanceStats.attendanceRate}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                key={attendanceStats.attendanceRate}
                                initial={{ width: 0 }}
                                animate={{ width: `${attendanceStats.attendanceRate}%` }}
                                transition={{ duration: 0.6 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-6">Chưa có dữ liệu điểm danh cho ngày này</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onEditAttendance}
                        className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <Edit3 size={16} /> Chỉnh sửa điểm danh
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onUploadMaterial}
                        className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <Upload size={16} /> Tải lên tài liệu
                      </motion.button>

                      {/* Chỉ hiển thị nút chỉnh sửa buổi học và hủy buổi học khi không phải teacher */}
                      {!isTeacher && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleEditSession}
                            className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                          >
                            <Edit size={16} /> Chỉnh sửa buổi học
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onCancelSession}
                            className="w-full py-2 text-rose-500 text-sm font-medium hover:text-rose-600 transition-all flex items-center justify-center gap-2"
                          >
                            <Trash2 size={16} /> Hủy buổi học
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : loadingDetail ? (
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-sm text-slate-500">Đang tải chi tiết buổi học...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chưa chọn buổi học</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Nhấp vào một buổi học để xem chi tiết</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      {!isTeacher && (
        <FloatingActionButtons
          onOpenSchedule={handleOpenScheduleModal}
          onOpenSession={handleOpenSessionModal}
        />
      )}

      {/* Modals */}
      <AnimatePresence>
        {showScheduleModal && (
          <CreateScheduleModal
            subjectId={SUBJECT_ID}
            onClose={handleCloseScheduleModal}
            onSuccess={handleScheduleSuccess}
          />
        )}
        {showSessionModal && (
          <CreateSessionModal
            subjectId={SUBJECT_ID}
            onClose={handleCloseSessionModal}
            onSuccess={handleSessionSuccess}
            initialData={editingSession ? {
              sessionDate: editingSession.sessionDate,
              startTime: editingSession.startTime,
              endTime: editingSession.endTime,
              roomId: editingSession.roomId ?? null,
              status: editingSession.status,
            } : null}
            isEdit={!!editingSession}
            sessionId={editingSession?.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
});