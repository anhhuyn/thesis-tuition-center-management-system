import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Calendar,
  School,
  Beaker,
  Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { RescheduleModal } from "./RescheduleModal";
import { sessionApi } from "../../../utils/api";
import type { DailySession, SessionStatus, TeacherLeaveInfo } from "../../../utils/types/session";
import type { Room } from "../../../utils/types/room";
import { roomApi } from "../../../utils/api/room.api";
import type { TeacherAbsentResponse, WeeklyAbsentTeacherResponse } from "../../../utils/types/teacherLeave";
import { teacherLeaveApi } from "../../../utils/api/teacherLeave.api";
import { getImageSrc, getInitials } from "../../../utils/helpers";
import { ScheduleHeaderFiltersSection } from "./ScheduleHeaderFiltersSection";
import { WeeklyScheduleView } from "./WeeklyScheduleView";
interface UrgentAlertItem {
  sessionId: number;
  subjectName: string;
  startTime: string;
  endTime: string;
  teacher?: {
    id: number;
    fullName: string;
  } | null;
  teacherLeaveInfo?: TeacherLeaveInfo;
  displayDate: Date;
  formattedDate: string;
  status: SessionStatus;
  roomName?: string | null;
}


export const ScheduleMainSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionsByTime, setSessionsByTime] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomStatus, setRoomStatus] = useState<any[]>([]);
  const [rawSessions, setRawSessions] = useState<DailySession[]>([]);
  const [todayRoomStatus, setTodayRoomStatus] = useState<any[]>([]);
  const [todaySessions, setTodaySessions] = useState<DailySession[]>([]);
  const [urgentAlerts, setUrgentAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [weeklyAbsentTeachers, setWeeklyAbsentTeachers] = useState<TeacherAbsentResponse[]>([]);
  const [loadingWeeklyAbsent, setLoadingWeeklyAbsent] = useState(false);
  const [viewMode, setViewMode] = useState<"tuan" | "ngay">("ngay");

  // Hàm fetch sessions cho 10 ngày tới
  const fetchUrgentAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const alerts: UrgentAlertItem[] = []; // Khai báo kiểu tường minh
      const today = new Date();

      // Lấy dữ liệu cho 10 ngày tới
      for (let i = 0; i <= 10; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        const dateStr = formatDateForApi(targetDate);

        const data: DailySession[] = await sessionApi.getSessionsByDate(dateStr);

        const unresolvedSessions = data.filter(session =>
          session.teacherLeaveInfo &&
          (session.teacherLeaveInfo.type === 'PENDING' ||
            session.teacherLeaveInfo.type === 'APPROVED' ||
            session.teacherLeaveInfo.type === 'AWAITING_REPLACEMENT')
        );

        unresolvedSessions.forEach(session => {
          alerts.push({
            sessionId: session.sessionId,
            subjectName: session.subjectName,
            startTime: session.startTime,
            endTime: session.endTime,
            teacher: session.teacher,
            teacherLeaveInfo: session.teacherLeaveInfo,
            displayDate: targetDate,
            formattedDate: formatDisplayDate(targetDate),
            status: session.status,
            roomName: session.roomName
          });
        });
      }

      setUrgentAlerts(alerts);
    } catch (error) {
      console.error('Failed to fetch urgent alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const [statistics, setStatistics] = useState({
    totalSessions: 0,
    totalRooms: 0,
    totalTeachersAbsent: 0,
    availableRooms: 0,
    canceledSessions: 0
  });
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSummaryTitle = (date: Date): string => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return "TÓM TẮT HÔM NAY";
    }
    return `TÓM TẮT ${formatDisplayDate(date).toUpperCase()}`;
  };

  const calculateStatistics = (sessions: DailySession[]) => {
    const totalSessions = sessions.length;

    // Tính số phòng trống dựa trên danh sách phòng thực tế
    const usedRooms = new Set(
      sessions
        .filter(session => session.roomName && session.status !== 'canceled')
        .map(session => session.roomName)
    );
    const availableRooms = rooms.length - usedRooms.size;

    const teachersAbsent = sessions.filter(session =>
      session.teacherLeaveInfo &&
      session.teacherLeaveInfo.type !== 'NONE'
    ).length;

    const canceledSessions = sessions.filter(session => session.status === 'canceled').length;

    const uniqueRooms = new Set(
      sessions
        .filter(session => session.roomName)
        .map(session => session.roomName)
    );
    const totalRooms = uniqueRooms.size;

    return {
      totalSessions,
      totalRooms,
      totalTeachersAbsent: teachersAbsent,
      availableRooms: Math.max(0, availableRooms),
      canceledSessions
    };
  };
  const fetchSessions = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = formatDateForApi(date);
      const data: DailySession[] = await sessionApi.getSessionsByDate(dateStr);

      // Lưu raw sessions
      setRawSessions(data);

      const stats = calculateStatistics(data);
      setStatistics(stats);

      // Tính toán trạng thái phòng
      if (rooms.length > 0) {
        const statuses = calculateRoomStatuses(rooms, data);
        setRoomStatus(statuses);
      }

      const processedSessions = processSessions(data);
      setSessionsByTime(processedSessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessionsByTime([]);
      setStatistics({
        totalSessions: 0,
        totalRooms: 0,
        totalTeachersAbsent: 0,
        availableRooms: 0,
        canceledSessions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch sessions cho ngày hôm nay (để tính tình trạng phòng)
  const fetchTodaySessions = async () => {
    try {
      const today = new Date();
      const dateStr = formatDateForApi(today);
      const data: DailySession[] = await sessionApi.getSessionsByDate(dateStr);
      setTodaySessions(data);

      // Tính trạng thái phòng cho hôm nay
      if (rooms.length > 0 && data.length > 0) {
        const statuses = calculateRoomStatuses(rooms, data);
        setTodayRoomStatus(statuses);
      }
    } catch (error) {
      console.error('Failed to fetch today sessions:', error);
    }
  };

  // Hàm fetch danh sách phòng
  const fetchRooms = async () => {
    try {
      const response = await roomApi.getAll();
      if (response && response.data) {
        setRooms(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  // Fetch giáo viên vắng trong tuần
  const fetchWeeklyAbsentTeachers = async () => {
    setLoadingWeeklyAbsent(true);
    try {
      const response: WeeklyAbsentTeacherResponse = await teacherLeaveApi.getAbsentTeachersThisWeek();
      setWeeklyAbsentTeachers(response.teachers);
    } catch (error) {
      console.error('Failed to fetch weekly absent teachers:', error);
      setWeeklyAbsentTeachers([]);
    } finally {
      setLoadingWeeklyAbsent(false);
    }
  };

  // Hàm xác định trạng thái của từng phòng dựa trên sessions
  const getRoomStatus = (roomName: string, sessions: DailySession[]) => {
    // Tìm session đang sử dụng phòng này tại thời điểm hiện tại
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const currentSession = sessions.find(session => {
      if (session.roomName !== roomName) return false;
      if (session.status === 'canceled') return false;

      const startTime = session.startTime.substring(0, 5);
      const endTime = session.endTime.substring(0, 5);

      return currentTime >= startTime && currentTime <= endTime;
    });

    if (currentSession) {
      return {
        status: `Đang sử dụng - ${currentSession.subjectName}`,
        isUsed: true,
        session: currentSession
      };
    }

    // Tìm session sắp tới trong ngày
    const upcomingSession = sessions.find(session => {
      if (session.roomName !== roomName) return false;
      if (session.status === 'canceled') return false;

      const startTime = session.startTime.substring(0, 5);
      return startTime > currentTime;
    });

    if (upcomingSession) {
      return {
        status: `Chuẩn bị (${upcomingSession.startTime.substring(0, 5)})`,
        isUsed: false,
        session: upcomingSession
      };
    }

    return {
      status: "Đang trống",
      isUsed: false,
      session: null
    };
  };


  // Hàm tính toán trạng thái phòng cho tất cả phòng
  const calculateRoomStatuses = (rooms: Room[], sessions: DailySession[]) => {
    return rooms.map(room => {
      const roomStatus = getRoomStatus(room.name, sessions);
      return {
        id: room.id,
        name: room.name,
        seatCapacity: room.seatCapacity,
        status: roomStatus.status,
        isUsed: roomStatus.isUsed,
        currentSession: roomStatus.session
      };
    });
  };

  const processSessions = (sessions: DailySession[]) => {
    // Group sessions by start time
    const timeGroups = new Map<string, DailySession[]>();

    sessions.forEach(session => {
      const timeKey = session.startTime.substring(0, 5); // "HH:MM"
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, []);
      }
      timeGroups.get(timeKey)!.push(session);
    });

    // Convert to array format for rendering
    const result = [];
    const sortedTimes = Array.from(timeGroups.keys()).sort();

    for (const time of sortedTimes) {
      const sessionsAtTime = timeGroups.get(time)!;
      const hasOngoing = sessionsAtTime.some(s => s.status === 'ongoing');

      if (sessionsAtTime.length === 1) {
        // Single session
        const session = sessionsAtTime[0];
        const isOngoing = session.status === 'ongoing';

        result.push({
          time,
          type: 'single',
          isOngoing,
          item: {
            sessionId: session.sessionId,
            classCode: extractClassCode(session.subjectName),
            subject: session.subjectName,
            teacher: session.teacher?.fullName || 'Chưa có giáo viên',
            room: session.roomName || 'Chưa có phòng',
            status: getVietnameseStatus(session.status),
            statusBg: getStatusBgColor(session.status),
            statusText: getStatusTextColor(session.status),
            startTime: session.startTime,
            endTime: session.endTime,
            teacherName: session.teacher?.fullName || null,
            teacherId: session.teacher?.id || null,
            teacherLeaveInfo: session.teacherLeaveInfo, // Thêm field này
            isOngoing
          }
        });
      } else {
        // Multiple sessions at same time - conflict
        result.push({
          time,
          type: 'conflict',
          conflictLabel: `TRÙNG LỊCH (${sessionsAtTime.length} CA HỌC)`,
          conflictIcon: AlertTriangle,
          hasOngoing,
          items: sessionsAtTime.map(session => {
            const isOngoing = session.status === 'ongoing';
            return {
              sessionId: session.sessionId,
              classCode: extractClassCode(session.subjectName),
              subject: session.subjectName,
              teacher: session.teacher?.fullName || 'Chưa có giáo viên',
              room: session.roomName || 'Chưa có phòng',
              status: getVietnameseStatus(session.status),
              statusBg: getStatusBgColor(session.status),
              statusText: getStatusTextColor(session.status),
              startTime: session.startTime,
              endTime: session.endTime,
              teacherName: session.teacher?.fullName || null,
              teacherId: session.teacher?.id || null,
              teacherLeaveInfo: session.teacherLeaveInfo, // Thêm field này
              isOngoing
            };
          })
        });
      }
    }

    return result;
  };

  // Component hiển thị từng alert
  const UrgentAlertItem = ({ session, onDispatch }: any) => {
    const getAlertMessage = (type: string) => {
      switch (type) {
        case 'PENDING':
          return 'Giáo viên xin nghỉ - Cần xử lý';
        case 'APPROVED':
          return 'Đã duyệt nghỉ - Chưa xử lý thay thế';
        case 'AWAITING_REPLACEMENT':
          return 'Đang chờ giáo viên thay thế xác nhận';
        default:
          return 'Cần xử lý ngay';
      }
    };

    const getButtonText = (type: string) => {
      return type === 'AWAITING_REPLACEMENT' ? 'Xem thay đổi' : 'Điều phối ngay';
    };

    const message = getAlertMessage(session.teacherLeaveInfo?.type);
    const buttonText = getButtonText(session.teacherLeaveInfo?.type);

    return (
      <div className="mb-4 pb-4 border-b border-rose-100 last:border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-rose-700 text-xs">
                {session.formattedDate}
              </span>
              <span className="text-[10px] text-gray-400">|</span>
              <span className="font-semibold text-indigo-950 text-xs">
                {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
              </span>
            </div>
            <div className="font-semibold text-indigo-950 text-sm">
              {session.subjectName}
            </div>
            <div className="text-gray-600 text-xs">
              GV: {session.teacher?.fullName || 'Chưa có giáo viên'}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 text-rose-700" />
              <span className="text-xs font-semibold text-rose-700">
                {message}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to get teacher leave display info
  const getTeacherLeaveDisplay = (leaveInfo?: TeacherLeaveInfo) => {
    if (!leaveInfo || leaveInfo.type === 'NONE') {
      return null;
    }

    switch (leaveInfo.type) {
      case 'PENDING':
        return {
          message: 'Giáo viên xin nghỉ - Cần xử lý',
          buttonText: 'Điều phối ngay',
          buttonAction: 'dispatch',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          iconColor: 'text-rose-700'
        };
      case 'APPROVED':
        return {
          message: 'Đã duyệt nghỉ - Chưa xử lý thay thế',
          buttonText: 'Điều phối ngay',
          buttonAction: 'dispatch',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-700'
        };
      case 'AWAITING_REPLACEMENT':
        return {
          message: 'Giáo viên xin nghỉ - Đang chờ giáo viên thay thế xác nhận',
          buttonText: 'Xem thay đổi',
          buttonAction: 'view',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-700'
        };
      case 'RESOLVED':
        return {
          message: leaveInfo.replacementTeacherName
            ? `Giáo viên chính xin nghỉ - Đã thay thế bởi ${leaveInfo.replacementTeacherName}`
            : 'Giáo viên chính xin nghỉ - Đã thay thế giáo viên',
          buttonText: 'Xem thay đổi',
          buttonAction: 'view',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-700'
        };
      default:
        return null;
    }
  };

  const extractClassCode = (subjectName: string): string => {
    // Extract class code from subject name or generate one
    if (subjectName.includes('Toán')) return 'TOÁN';
    if (subjectName.includes('Lý')) return 'LÝ';
    if (subjectName.includes('Hóa')) return 'HÓA';
    if (subjectName.includes('Văn')) return 'VĂN';
    if (subjectName.includes('Anh')) return 'ENGLISH';
    if (subjectName.includes('KHOA HỌC TỰ NHIÊN') || ('KHTN')) return 'KHTN';
    return 'SJ';
  };

  // Helper functions for status from backend
  const getStatusDisplay = (status: SessionStatus) => {
    switch (status) {
      case 'ongoing':
        return { text: 'ĐANG DIỄN RA', bg: 'bg-violet-100', textColor: 'text-violet-700' };
      case 'scheduled':
        return { text: 'SẮP TỚI', bg: 'bg-slate-100', textColor: 'text-slate-400' };
      case 'completed':
        return { text: 'HOÀN THÀNH', bg: 'bg-green-100', textColor: 'text-green-700' };
      case 'canceled':
        return { text: 'ĐÃ HỦY', bg: 'bg-red-100', textColor: 'text-red-700' };
      case 'expired':
        return { text: 'CHƯA XỬ LÝ', bg: 'bg-gray-100', textColor: 'text-gray-600' };
      default:
        return { text: 'KHÔNG XÁC ĐỊNH', bg: 'bg-gray-100', textColor: 'text-gray-600' };
    }
  };

  const getVietnameseStatus = (status: SessionStatus): string => {
    return getStatusDisplay(status).text;
  };

  const getStatusBgColor = (status: SessionStatus): string => {
    return getStatusDisplay(status).bg;
  };

  const getStatusTextColor = (status: SessionStatus): string => {
    return getStatusDisplay(status).textColor;
  };

  const isSessionOngoing = (status: SessionStatus): boolean => {
    return status === 'ongoing';
  };

  // Fetch rooms khi component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch sessions cho ngày được chọn (cho lịch học)
  useEffect(() => {
    fetchSessions(currentDate);
  }, [currentDate]);

  // Fetch sessions cho hôm nay (cho tình trạng phòng)
  useEffect(() => {
    fetchTodaySessions();
  }, [rooms]); // Chạy lại khi rooms đã có

  // Cập nhật tình trạng phòng hôm nay khi rooms hoặc todaySessions thay đổi
  useEffect(() => {
    if (rooms.length > 0 && todaySessions.length > 0) {
      const statuses = calculateRoomStatuses(rooms, todaySessions);
      setTodayRoomStatus(statuses);
    }
  }, [rooms, todaySessions]);

  // Fetch urgent alerts khi component mount
  useEffect(() => {
    fetchUrgentAlerts();
  }, []);

  useEffect(() => {
    fetchWeeklyAbsentTeachers();
  }, []);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleSessionClick = (session: any) => {
    const sessionId = session.sessionId || session.id;
    if (sessionId) {
      setSelectedSession(sessionId);
      setIsModalOpen(true);
    }
  };

  const allScheduleItems = () => sessionsByTime;

  const TeacherAvatarWithTooltip = ({ teacher, index, isDemo = false }: { teacher: any; index: number; isDemo?: boolean }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const teacherName = isDemo ? `Giáo viên ${index + 1}` : teacher.teacherName;

    // Lấy ảnh đúng cách
    const avatarSrc = !isDemo && teacher.teacherImage ? getImageSrc(teacher.teacherImage) : null;
    const initials = !isDemo ? getInitials(teacher.teacherName) : teacherName.charAt(0);

    return (
      <div
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className={`w-10 h-10 rounded-full bg-gray-300 ring-4 ring-white overflow-hidden ${index > 0 ? '-ml-3' : ''
            }`}
          style={{ zIndex: 10 - index }}
        >
          {!isDemo && avatarSrc ? (
            <img
              src={avatarSrc}
              alt={teacherName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Nếu ảnh lỗi, hiển thị fallback
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.style.backgroundColor = '#93c5fd';
                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-xs font-semibold">${initials}</div>`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
          )}
        </div>

        {/* Tooltip hiển thị tên khi hover */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
            {teacherName}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ScheduleHeaderFiltersSection
        currentDate={currentDate}
        activeView={viewMode}
        onViewChange={setViewMode}
      />
       <div className="grid grid-cols-12 gap-8 mt-8">
        {/* Left Column - Schedule */}
        {viewMode === "ngay" ? (
          <div className="col-span-9">
            <div className="bg-white rounded-2xl border">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => changeDate(-1)}
                    className="p-2 hover:bg-violet-50 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 text-violet-700" />
                  </button>
                  <div>
                    <p className="font-extrabold text-indigo-950 text-lg">
                      {formatDisplayDate(currentDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => changeDate(1)}
                    className="p-2 hover:bg-violet-50 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5 text-violet-700" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-1.5 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all duration-200 active:scale-95"
                >
                  <span className="font-semibold text-violet-700 text-sm">
                    Hôm nay
                  </span>
                </button>
              </div>

              {/* Schedule Items - CÓ XỬ LÝ KHI KHÔNG CÓ LỊCH */}
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Đang tải lịch...</div>
                  </div>
                ) : allScheduleItems().length === 0 ? (
                  /* EMPTY STATE - Không có lịch học */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <Calendar className="w-10 h-10 text-gray-400 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      Không có lịch học
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Không tìm thấy ca học nào trong ngày{" "}
                      <span className="font-medium text-gray-700">
                        {formatDisplayDate(currentDate)}
                      </span>
                    </p>
                   
                  </div>
                ) : (
                  <div className="relative">
                    {allScheduleItems().map((row, idx) => {
                      if (row.type === "single") {
                        const item = row.item!;
                        const isOngoing = row.isOngoing || item.isOngoing;
                        const isCanceled = item.status === 'ĐÃ HỦY';
                        const leaveDisplay = getTeacherLeaveDisplay(item.teacherLeaveInfo);

                        // Case: có teacher leave info (PENDING, APPROVED, AWAITING_REPLACEMENT, RESOLVED)
                        if (leaveDisplay) {
                          return (
                            <div key={idx} className="flex gap-10 mb-4">
                              <div className="w-12 pt-1 text-right">
                                <span className="font-semibold text-xs text-slate-400">
                                  {row.time}
                                </span>
                              </div>

                              <div className="flex-1 relative">
                                <div className={`flex items-center justify-between p-4 ${leaveDisplay.bgColor} border ${leaveDisplay.borderColor} rounded-xl`}>
                                  {/* LEFT */}
                                  <div className="flex items-center gap-4">
                                    <div className={`px-3 py-2 ${leaveDisplay.bgColor.replace('50', '100')} rounded-lg`}>
                                      <span className={`font-bold ${leaveDisplay.iconColor} text-sm`}>
                                        {item.classCode}
                                      </span>
                                    </div>

                                    <div>
                                      <div className="font-semibold text-indigo-950">
                                        {item.subject}
                                      </div>
                                      <div className="text-gray-600 text-xs">
                                        {item.teacher}
                                        {item.room ? ` • ${item.room}` : ""}
                                      </div>
                                      <div className="flex items-center gap-1 mt-1">
                                        <AlertCircle className={`w-3 h-3 ${leaveDisplay.iconColor}`} />
                                        <span className={`text-xs font-semibold ${leaveDisplay.iconColor}`}>
                                          {leaveDisplay.message}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* RIGHT BUTTON */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (leaveDisplay.buttonAction === 'dispatch') {
                                        // Mở modal điều phối
                                        handleSessionClick(item);
                                      } else {
                                        // Mở modal xem thay đổi
                                        handleSessionClick(item);
                                      }
                                    }}
                                    className={`px-4 py-2 ${leaveDisplay.buttonAction === 'dispatch' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gray-600 hover:bg-gray-700'} text-white text-xs font-semibold rounded-lg transition`}
                                  >
                                    {leaveDisplay.buttonText}
                                  </button>
                                </div>

                                {/* timeline dot */}
                                <div className="absolute top-5 -left-[29px] w-2 h-2 bg-rose-400 rounded-full" />
                              </div>
                            </div>
                          );
                        }

                        // Normal session (không có leave info hoặc type NONE)
                        return (
                          <div key={idx} className="flex gap-10 mb-4">
                            <div className="w-12 pt-1 text-right">
                              <span className="font-semibold text-xs text-slate-400">
                                {row.time}
                              </span>
                            </div>
                            <div className="flex-1 relative">
                              <div
                                onClick={() => handleSessionClick(item)}
                                className={`p-5 rounded-xl border cursor-pointer hover:shadow-md transition ${isCanceled
                                  ? 'bg-rose-50 border-rose-200'
                                  : isOngoing
                                    ? 'bg-violet-50 border-violet-200'
                                    : 'bg-white'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isCanceled
                                      ? 'bg-rose-100'
                                      : isOngoing
                                        ? 'bg-violet-200'
                                        : 'bg-violet-50'
                                      }`}>
                                      <span className={`font-semibold ${isCanceled
                                        ? 'text-rose-700'
                                        : isOngoing
                                          ? 'text-violet-900'
                                          : 'text-violet-700'
                                        }`}>
                                        {item.classCode}
                                      </span>
                                    </div>
                                    <div>
                                      <div className={`font-semibold ${isCanceled ? 'text-rose-800 line-through' : 'text-indigo-950'
                                        }`}>
                                        {item.subject}
                                      </div>
                                      <div className={`text-xs ${isCanceled
                                        ? 'text-rose-600'
                                        : isOngoing
                                          ? 'text-violet-800'
                                          : 'text-violet-900'
                                        }`}>
                                        {item.teacher}
                                        {item.room ? ` • ${item.room}` : ""}
                                      </div>

                                      {isCanceled && (
                                        <div className="flex items-center gap-1 mt-2">
                                          <AlertCircle className="w-3 h-3 text-rose-700" />
                                          <span className="text-xs font-semibold text-rose-700">
                                            Buổi học đã bị hủy
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {item.status && !isCanceled && (
                                    <div className={`px-3 py-1 ${item.statusBg} rounded-full`}>
                                      <span className={`font-semibold text-[10px] ${item.statusText}`}>
                                        {item.status}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Show attendance button for ongoing sessions (not canceled) */}
                                {isOngoing && !isCanceled && (
                                  <div className="mt-4 flex justify-end">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle attendance
                                      }}
                                      className="px-4 py-2 bg-violet-700 text-white text-xs font-semibold rounded-lg hover:bg-violet-800 transition"
                                    >
                                      Điểm danh
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className={`absolute top-5 -left-[29px] w-2 h-2 rounded-full ${isCanceled
                                ? 'bg-rose-400'
                                : isOngoing
                                  ? 'bg-violet-700 ring-2 ring-violet-200'
                                  : 'bg-violet-200'
                                }`} />
                            </div>
                          </div>
                        );
                      }

                      if (row.type === "conflict") {
                        const hasOngoing = row.hasOngoing;
                        return (
                          <div key={idx} className="flex gap-10 mb-4">
                            <div className="w-12 pt-1 text-right">
                              <span className="font-semibold text-xs text-slate-400">
                                {row.time}
                              </span>
                            </div>
                            <div className="flex-1 relative">
                              <div className="flex items-center gap-2 mb-3">
                                <Layers className="w-3 h-3 text-violet-700" />
                                <span className="font-semibold text-[10px] text-violet-700">
                                  {row.conflictLabel}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                {row.items!.map((item: any, i: number) => {
                                  const isItemOngoing = item.isOngoing;
                                  const isItemCanceled = item.status === 'ĐÃ HỦY';
                                  const leaveDisplay = getTeacherLeaveDisplay(item.teacherLeaveInfo);

                                  // Nếu có leave info, hiển thị dạng alert
                                  if (leaveDisplay) {
                                    return (
                                      <div
                                        key={i}
                                        className={`p-4 rounded-xl border ${leaveDisplay.bgColor} ${leaveDisplay.borderColor}`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${leaveDisplay.bgColor.replace('50', '100')}`}>
                                              <span className={`font-semibold text-xs ${leaveDisplay.iconColor}`}>
                                                {item.classCode}
                                              </span>
                                            </div>
                                            <div>
                                              <div className="font-semibold text-indigo-950 text-sm">
                                                {item.subject}
                                              </div>
                                              <div className="text-gray-600 text-[10px]">
                                                {item.teacher} • {item.room}
                                              </div>
                                              <div className="flex items-center gap-1 mt-1">
                                                <AlertCircle className={`w-2 h-2 ${leaveDisplay.iconColor}`} />
                                                <span className={`text-[8px] font-semibold ${leaveDisplay.iconColor}`}>
                                                  {leaveDisplay.message}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSessionClick(item);
                                            }}
                                            className={`px-3 py-1.5 ${leaveDisplay.buttonAction === 'dispatch' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gray-600 hover:bg-gray-700'} text-white text-[10px] font-semibold rounded-lg transition`}
                                          >
                                            {leaveDisplay.buttonText}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Normal conflict item
                                  return (
                                    <div
                                      key={i}
                                      onClick={() => handleSessionClick(item)}
                                      className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition ${isItemCanceled
                                        ? 'bg-rose-50 border-rose-200'
                                        : isItemOngoing
                                          ? 'bg-violet-50 border-violet-200'
                                          : 'bg-white'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isItemCanceled
                                            ? 'bg-rose-100'
                                            : isItemOngoing
                                              ? 'bg-violet-200'
                                              : 'bg-violet-50'
                                            }`}>
                                            <span className={`font-semibold text-xs ${isItemCanceled
                                              ? 'text-rose-700'
                                              : isItemOngoing
                                                ? 'text-violet-900'
                                                : 'text-violet-700'
                                              }`}>
                                              {item.classCode}
                                            </span>
                                          </div>
                                          <div>
                                            <div className={`font-semibold text-indigo-950 text-sm ${isItemCanceled ? 'line-through text-rose-600' : ''
                                              }`}>
                                              {item.subject}
                                            </div>
                                            <div className={`text-[10px] ${isItemCanceled
                                              ? 'text-rose-600'
                                              : isItemOngoing
                                                ? 'text-violet-800'
                                                : 'text-violet-900'
                                              }`}>
                                              {item.teacher} • {item.room}
                                            </div>
                                            {isItemCanceled && (
                                              <div className="flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-2 h-2 text-rose-700" />
                                                <span className="text-[8px] font-semibold text-rose-700">
                                                  Đã hủy
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {item.status && !isItemCanceled && (
                                          <div className={`px-2 py-0.5 ${item.statusBg} rounded-full`}>
                                            <span className={`font-semibold text-[8px] ${item.statusText}`}>
                                              {item.status}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Show attendance button for ongoing conflict sessions (not canceled) */}
                                      {isItemOngoing && !isItemCanceled && (
                                        <div className="mt-3 flex justify-end">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Handle attendance
                                            }}
                                            className="px-3 py-1.5 bg-violet-700 text-white text-[10px] font-semibold rounded-lg hover:bg-violet-800 transition"
                                          >
                                            Điểm danh
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className={`absolute top-5 -left-[30px] w-3 h-3 rounded-full ring-4 ring-white ${hasOngoing ? 'bg-violet-700' : 'bg-violet-400'
                                }`} />
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Weekly schedule view
          <div className="col-span-9">
            <WeeklyScheduleView
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onSessionClick={(sessionId) => {
                setSelectedSession(sessionId);
                setIsModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Right Column - Stats & Info (Hardcoded) */}
        <div className="col-span-3 space-y-6">
          {/* Summary Card */}
          <div className="p-6 bg-blue-900 rounded-2xl text-white">
            <div className="text-sm font-bold opacity-80">
              {getSummaryTitle(currentDate)}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="text-3xl font-semibold">{statistics.totalSessions}</div>
                <div className="text-xs opacity-80">Ca học</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="my-6 h-px bg-white/10" />

            {/* 3 cột */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xl font-semibold">{statistics.availableRooms}</div>
                <div className="text-[10px] font-semibold opacity-70">PHÒNG TRỐNG</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{statistics.totalTeachersAbsent}</div>
                <div className="text-[10px] font-semibold opacity-70">GV VẮNG</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{statistics.canceledSessions}</div>
                <div className="text-[10px] font-semibold opacity-70">LỚP HỦY</div>
              </div>
            </div>
          </div>

          {/* Room Status  */}
          <div className="p-6 bg-white rounded-2xl border">
            <div className="flex items-center justify-between mb-6">
              <div className="font-extrabold text-indigo-950 leading-tight">
                <div className="text-sm">Tình trạng phòng</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  Hôm nay
                </div>
              </div>
              <div className="font-semibold text-blue-900 text-xs">Xem tất cả</div>
            </div>
            <div className="space-y-4">
              {todayRoomStatus.slice(0, 4).map((room) => {
                // Chọn icon dựa trên tên phòng
                let RoomIcon = School;
                if (room.name.toLowerCase().includes('thí nghiệm') || room.name.toLowerCase().includes('lab')) {
                  RoomIcon = Beaker;
                }

                // Format status text
                let displayStatus = room.status;
                if (room.status.includes('Đang sử dụng')) {
                  displayStatus = room.status;
                } else if (room.status.includes('Chuẩn bị')) {
                  displayStatus = room.status;
                } else {
                  displayStatus = "Đang trống";
                }

                return (
                  <div key={room.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <RoomIcon className="w-4 h-4 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-indigo-950 text-xs">
                        {room.name}
                      </div>
                      <div className="text-violet-900 text-[10px]">
                        {displayStatus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Urgent Alert - Dynamic */}
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
            {/* Header với số lượng và nút điều phối */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                <div className="font-extrabold text-rose-700 text-[12px]">CẦN XỬ LÝ NGAY</div>
                {urgentAlerts.length > 0 && (
                  <div className="bg-rose-200 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    {urgentAlerts.length}
                  </div>
                )}
              </div>

              {/* Nút Điều phối ngay chung - chỉ hiện khi có alert */}
              {urgentAlerts.length > 0 && (
                <button
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold rounded transition shadow-sm whitespace-nowrap"
                >
                  Điều phối ngay
                </button>
              )}
            </div>

            {/* Nội dung alerts */}
            {loadingAlerts ? (
              <div className="text-center text-gray-500 text-[9px] py-3">
                Đang tải...
              </div>
            ) : urgentAlerts.length > 0 ? (
              <div
                className="max-h-[280px] overflow-y-auto space-y-0"

              >
                {urgentAlerts.slice(0, 5).map((alert, idx) => (
                  <UrgentAlertItem
                    key={`${alert.sessionId}-${idx}`}
                    session={alert}
                  />
                ))}
                {urgentAlerts.length > 5 && (
                  <div className="text-center mt-2 pt-1.5 border-t border-rose-200">
                    <div className="text-rose-700 text-[8px] font-semibold">
                      +{urgentAlerts.length - 5} cảnh báo khác
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-green-600 text-[9px] font-semibold mb-0.5">
                  ✓ Không có cảnh báo
                </div>
                <div className="text-gray-500 text-[8px]">
                  Tất cả GV đã được điều phối
                </div>
              </div>
            )}
          </div>

          {/* Teachers Absent - Dynamic from API */}
          <div className="p-6 bg-blue-50 rounded-2xl border border-violet-100">
            <div className="font-extrabold text-blue-900 text-[11px] mb-4">
              GIÁO VIÊN VẮNG (TUẦN NÀY)
            </div>

            {loadingWeeklyAbsent ? (
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 ring-4 ring-white" />
                <div className="w-10 h-10 -ml-3 rounded-full bg-gray-400 ring-4 ring-white" />
                <div className="w-10 h-10 -ml-3 bg-blue-200 rounded-full flex items-center justify-center ring-4 ring-white">
                  <span className="font-semibold text-blue-900 text-[10px]">...</span>
                </div>
              </div>
            ) : weeklyAbsentTeachers.length > 0 ? (
              <>
                <div className="flex items-center mb-3">
                  {weeklyAbsentTeachers.slice(0, 3).map((teacher, idx) => (
                    <TeacherAvatarWithTooltip key={teacher.leaveId} teacher={teacher} index={idx} />
                  ))}

                  {weeklyAbsentTeachers.length > 3 && (
                    <div className="w-10 h-10 -ml-3 bg-blue-200 rounded-full flex items-center justify-center ring-4 ring-white">
                      <span className="font-semibold text-blue-900 text-[10px]">+{weeklyAbsentTeachers.length - 3}</span>
                    </div>
                  )}
                </div>
                <div className="text-blue-900 text-[10px]">
                  Tổng cộng {weeklyAbsentTeachers.length} giáo viên nghỉ trong tuần này
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 ring-4 ring-white" />
                  <div className="w-10 h-10 -ml-3 rounded-full bg-gray-400 ring-4 ring-white" />
                  <div className="w-10 h-10 -ml-3 bg-blue-200 rounded-full flex items-center justify-center ring-4 ring-white">
                    <span className="font-semibold text-blue-900 text-[10px]">+3</span>
                  </div>
                </div>
                <div className="text-blue-900 text-[10px]">
                  Tổng cộng 5 giáo viên nghỉ trong tuần này
                </div>
              </>
            )}
          </div>
        </div>

        <RescheduleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSession(null);
          }}
          sessionId={selectedSession}
        />
      </div>
    </>
  );
};