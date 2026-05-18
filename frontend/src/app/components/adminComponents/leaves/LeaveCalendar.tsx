// src/app/components/leaves/LeaveCalendar.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, CheckCircle, Clock, XCircle, Eye, Mail, RefreshCw, FileText } from 'lucide-react';
import type { LeaveRequest } from '../../../utils/types/teacherLeave';

interface LeaveCalendarProps {
  leaves: LeaveRequest[];
  onDayClick: (date: Date) => void;
  onCreateRequest: () => void;
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({
  leaves,
  onDayClick,
  onCreateRequest
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getLeavesForDate = (date: Date) => {
    return leaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = leave.endDate ? new Date(leave.endDate) : leaveStart;
      const targetDate = new Date(date);
      return targetDate >= leaveStart && targetDate <= leaveEnd;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Đã duyệt':
        return 'bg-emerald-50 text-emerald-700';
      case 'Chờ duyệt':
        return 'bg-amber-50 text-amber-700';
      case 'Từ chối':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-gray-800 min-w-[160px] text-center">
            {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-gray-100 text-purple-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-all ml-2"
          >
            Hôm nay
          </button>
        </div>
        <button
          onClick={onCreateRequest}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          Tạo yêu cầu
        </button>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dayLeaves = getLeavesForDate(date);
          const isTodayDate = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const hasLeaves = dayLeaves.length > 0;
          const approvedCount = dayLeaves.filter(l => l.status === 'Đã duyệt').length;
          const pendingCount = dayLeaves.filter(l => l.status === 'Chờ duyệt').length;

          return (
            <div
              key={index}
              onClick={() => onDayClick(date)}
              className={`
                min-h-[100px] border-r border-b border-gray-100 p-2 transition-all cursor-pointer
                ${!isCurrentMonthDate ? 'bg-gray-50/30' : 'hover:bg-gray-50'}
                ${isTodayDate ? 'bg-purple-50 ring-2 ring-purple-500 ring-inset' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-bold ${isTodayDate ? 'text-purple-600' : isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'}`}>
                  {date.getDate()}
                </span>
                {hasLeaves && (
                  <div className="flex gap-0.5">
                    {approvedCount > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    )}
                    {pendingCount > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {dayLeaves.slice(0, 2).map((leave, idx) => (
                  <div
                    key={idx}
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${getStatusBgColor(leave.status)}`}
                  >
                    {leave.teacherName.split(' ').slice(-1)[0]}
                    {leave.status === 'Chờ duyệt' && ' (C)'}
                  </div>
                ))}
                {dayLeaves.length > 2 && (
                  <div className="text-[10px] text-gray-400 px-1.5">+{dayLeaves.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};