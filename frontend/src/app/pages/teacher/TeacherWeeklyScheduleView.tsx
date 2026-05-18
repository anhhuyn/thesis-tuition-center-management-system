// TeacherWeeklyScheduleView.tsx
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  School,
  Clock,
  Calendar as CalendarIcon,
  RefreshCw
} from "lucide-react";
import { teacherScheduleApi } from "../../utils/api/teacherSchedule.api";
import type { TeacherSchedule } from "../../utils/types/teacherSchedule";

interface TeacherWeeklyScheduleViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSessionClick: (sessionId: number) => void;
  teacherId?: number; // Optional, có thể truyền từ props hoặc dùng giá trị mặc định
}

interface WeekDay {
  date: Date;
  dateStr: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  sessions: TeacherSchedule[];
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

export const TeacherWeeklyScheduleView: React.FC<TeacherWeeklyScheduleViewProps> = ({
  currentDate,
  onDateChange,
  onSessionClick,
  teacherId = 16 // Giá trị mặc định
}) => {
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Format date for API
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get week days based on current date (Monday to Sunday)
  const getWeekDays = (centerDate: Date): Date[] => {
    const week: Date[] = [];
    const dayOfWeek = centerDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(centerDate);
    monday.setDate(centerDate.getDate() + mondayOffset);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  // Generate time slots (from earliest to latest session time)
  const generateTimeSlots = (sessions: TeacherSchedule[]): TimeSlot[] => {
    const allTimes = new Set<string>();
    
    sessions.forEach(session => {
      const startTime = session.startTime.substring(0, 5);
      allTimes.add(startTime);
    });
    
    const sortedTimes = Array.from(allTimes).sort();
    
    return sortedTimes.map(time => {
      const [hour, minute] = time.split(':').map(Number);
      return { time, hour, minute };
    });
  };

  // Fetch sessions for all days in the week
  const fetchWeekSessions = async (weekDates: Date[]) => {
    setLoading(true);
    try {
      const weekData: WeekDay[] = await Promise.all(
        weekDates.map(async (date) => {
          const dateStr = formatDateForApi(date);
          const sessions = await teacherScheduleApi.getSchedule(teacherId, {
            startDate: dateStr,
            endDate: dateStr
          });
          
          return {
            date,
            dateStr: dateStr,
            dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
            dayNumber: date.getDate(),
            isToday: new Date().toDateString() === date.toDateString(),
            sessions: sessions
          };
        })
      );
      
      setWeekDays(weekData);
      
      const allSessions = weekData.flatMap(day => day.sessions);
      const slots = generateTimeSlots(allSessions);
      setTimeSlots(slots);
      
    } catch (error) {
      console.error('Failed to fetch teacher week sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionsAtTime = (sessions: TeacherSchedule[], time: string): TeacherSchedule[] => {
    return sessions.filter(session => {
      const startTime = session.startTime.substring(0, 5);
      return startTime === time;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(newDate);
  };

  const goToCurrentWeek = () => {
    onDateChange(new Date());
  };

  // Get session background color based on status
  const getSessionBgColor = (session: TeacherSchedule): string => {
    if (session.status === 'ongoing') return 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100/60';
    if (session.status === 'completed') return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/60';
    if (session.status === 'canceled') return 'bg-gray-50 border-gray-200 hover:bg-gray-100/60';
    if (session.status === 'expired') return 'bg-gray-50 border-gray-200 hover:bg-gray-100/60';
    return 'bg-blue-50 border-blue-200 hover:bg-blue-100/60';
  };

  // Get status text color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ongoing': return 'text-indigo-600';
      case 'completed': return 'text-emerald-600';
      case 'canceled': return 'text-gray-400 line-through';
      case 'expired': return 'text-gray-400';
      default: return 'text-blue-600';
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Hoàn thành';
      case 'canceled': return 'Đã hủy';
      case 'expired': return 'Đã kết thúc';
      case 'scheduled': return 'Sắp tới';
      default: return '';
    }
  };

  // Render session card (without teacher name)
  const renderSessionCard = (session: TeacherSchedule) => {
    const isCanceled = session.status === 'canceled';
    const bgColor = getSessionBgColor(session);
    const statusColor = getStatusColor(session.status);
    const statusLabel = getStatusLabel(session.status);
    
    return (
      <div
        key={session.sessionId}
        onClick={() => onSessionClick(session.sessionId)}
        className={`relative p-2 rounded-lg cursor-pointer transition-all duration-200 border ${bgColor} hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] group`}
      >
        <div className="space-y-1.5">
          <div className={`font-semibold text-xs ${isCanceled ? 'text-gray-400 line-through' : 'text-gray-800'} leading-tight pr-3`}>
            {session.subjectName}
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <Clock className="w-2.5 h-2.5 stroke-[1.5]" />
            <span className="font-medium">
              {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <School className="w-2.5 h-2.5 stroke-[1.5]" />
            <span className="truncate">{session.roomName || 'Chưa có phòng'}</span>
          </div>
          
          {/* Status badge */}
          {statusLabel && !isCanceled && (
            <div className="mt-1.5">
              <span className={`text-[8px] font-semibold ${statusColor} bg-white/50 px-1.5 py-0.5 rounded-full`}>
                {statusLabel}
              </span>
            </div>
          )}
          
          {/* Canceled badge */}
          {isCanceled && (
            <div className="flex items-center gap-1 mt-1.5">
              <AlertCircle className="w-2.5 h-2.5 text-gray-400" />
              <span className="text-[8px] font-semibold text-gray-400">
                Đã hủy
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render schedule view
  const renderScheduleView = () => {
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-8 bg-white sticky top-0 z-10 border-b border-gray-200">
            <div className="p-3 border-r border-gray-200 bg-gray-50/50 sticky left-0 z-20">
              <div className="font-semibold text-[10px] text-gray-500 tracking-wider uppercase">Giờ</div>
            </div>
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className={`relative p-3 text-center border-r border-gray-200 last:border-r-0 transition-all ${
                  day.isToday ? 'bg-indigo-50/30' : 'bg-white'
                }`}
              >
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  {day.dayName}
                </div>
                <div
                  className={`text-xl font-semibold tracking-tight mt-0.5 ${
                    day.isToday ? 'text-indigo-600' : 'text-gray-700'
                  }`}
                >
                  {day.dayNumber}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div>
            {timeSlots.map((slot, slotIdx) => (
              <div key={slotIdx} className="grid grid-cols-8 border-b border-gray-100 transition-colors hover:bg-gray-50/40">
                <div className="p-3 border-r border-gray-200 bg-gray-50/30 sticky left-0 z-10">
                  <div className="text-xs font-medium text-gray-600 tabular-nums">
                    {slot.time}
                  </div>
                </div>
                
                {weekDays.map((day, dayIdx) => {
                  const sessions = getSessionsAtTime(day.sessions, slot.time);
                  
                  return (
                    <div
                      key={dayIdx}
                      className={`p-1.5 border-r border-gray-100 last:border-r-0 min-h-[100px] transition-all ${
                        day.isToday ? 'bg-indigo-50/5' : ''
                      }`}
                    >
                      {sessions.length > 0 ? (
                        <div className="space-y-1.5">
                          {sessions.map(session => renderSessionCard(session))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[88px]">
                          <span className="text-gray-300 text-xs select-none">—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const weekDates = getWeekDays(currentDate);
    fetchWeekSessions(weekDates);
  }, [currentDate, teacherId]);

  if (loading && weekDays.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-center">
          <div className="relative inline-block">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin stroke-[1.5]" />
          </div>
          <div className="text-gray-500 mt-3 font-medium">Đang tải lịch tuần...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 group"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 transition-colors stroke-[1.5]" />
            </button>
            
            <div className="px-2">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                Tuần {getWeekDays(currentDate)[0].toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })} —{' '}
                {getWeekDays(currentDate)[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                {getWeekDays(currentDate)[0].toLocaleDateString('vi-VN', { weekday: 'long' })} —{' '}
                {getWeekDays(currentDate)[6].toLocaleDateString('vi-VN', { weekday: 'long' })}
              </p>
            </div>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 group"
            >
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 transition-colors stroke-[1.5]" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToCurrentWeek}
              className="px-4 py-1.5 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all duration-200 active:scale-95"
            >
              <span className="font-semibold text-violet-700 text-sm">
                Tuần này
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 bg-white">
        {renderScheduleView()}
        
        {weekDays.length > 0 && timeSlots.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-3">
              <CalendarIcon className="w-6 h-6 text-gray-400 stroke-[1.5]" />
            </div>
            <div className="text-gray-500 font-medium">Không có lịch dạy trong tuần này</div>
            <div className="text-xs text-gray-400 mt-1">Hãy thử chọn tuần khác</div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/30 rounded-b-2xl">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-100 border border-indigo-300 rounded-full"></div>
            <span className="text-gray-600 font-medium">Đang diễn ra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-100 border border-emerald-300 rounded-full"></div>
            <span className="text-gray-600 font-medium">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-100 border border-gray-300 rounded-full"></div>
            <span className="text-gray-600 font-medium">Đã hủy / Hết hạn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-100 border border-blue-300 rounded-full"></div>
            <span className="text-gray-600 font-medium">Sắp tới</span>
          </div>
          <div className="flex items-center gap-2">
            <School className="w-3 h-3 text-gray-500 stroke-[1.5]" />
            <span className="text-gray-600 font-medium">Phòng học</span>
          </div>
        </div>
      </div>
    </div>
  );
};