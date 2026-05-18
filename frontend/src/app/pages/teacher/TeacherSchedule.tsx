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
import { teacherScheduleApi } from "../../utils/api/teacherSchedule.api";
import type { TeacherSchedule as TeacherScheduleType } from "../../utils/types/teacherSchedule";
import { ScheduleHeaderFiltersSection } from "../../components/adminComponents/schedule/ScheduleHeaderFiltersSection";
import { RescheduleModal } from "../../components/adminComponents/schedule/RescheduleModal";
import { TeacherWeeklyScheduleView } from "./TeacherWeeklyScheduleView";
import { useAuth } from "../../contexts/AuthContext";
import { teacherApi } from "../../utils/api";

interface ScheduleTimeGroup {
    time: string;
    type: 'single' | 'conflict';
    isOngoing: boolean;
    conflictLabel?: string;
    conflictIcon?: any;
    item?: any;
    items?: any[];
}

export const TeacherSchedule = () => {
    const { user, loading: authLoading } = useAuth();
    const [teacherId, setTeacherId] = useState<number | null>(null);
    const [loadingTeacherId, setLoadingTeacherId] = useState(true);
    const [teacherIdError, setTeacherIdError] = useState<string | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState<TeacherScheduleType[]>([]);
    const [sessionsByTime, setSessionsByTime] = useState<ScheduleTimeGroup[]>([]);
    const [statistics, setStatistics] = useState({
        totalSessions: 0,
        totalRooms: 0,
        availableRooms: 0,
        canceledSessions: 0
    });
    const [viewMode, setViewMode] = useState<"tuan" | "ngay">("ngay");
    const [todayRoomStatus, setTodayRoomStatus] = useState<any[]>([]);

    // State cho RescheduleModal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any>(null);

    // Lấy teacherId từ userId
    useEffect(() => {
        const fetchTeacherId = async () => {
            if (authLoading) return;

            if (!user) {
                setLoadingTeacherId(false);
                setTeacherIdError("Vui lòng đăng nhập để xem lịch");
                return;
            }

            setLoadingTeacherId(true);
            setTeacherIdError(null);

            try {
                const response = await teacherApi.getTeacherIdByUserId(user.id);
                if (response.teacherId) {
                    setTeacherId(response.teacherId);
                } else {
                    console.warn('Không tìm thấy teacherId cho userId:', user.id);
                    setTeacherId(null);
                    setTeacherIdError(response.message || "Không tìm thấy thông tin giáo viên");
                }
            } catch (error: any) {
                console.error('Lỗi khi lấy teacherId:', error);
                setTeacherId(null);
                setTeacherIdError(error.response?.data?.message || "Có lỗi xảy ra khi lấy thông tin giáo viên");
            } finally {
                setLoadingTeacherId(false);
            }
        };

        fetchTeacherId();
    }, [user, authLoading]);

    // Format date cho API
    const formatDateForApi = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format date hiển thị
    const formatDisplayDate = (date: Date): string => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Lấy title summary
    const getSummaryTitle = (date: Date): string => {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return "TÓM TẮT HÔM NAY";
        }
        return `TÓM TẮT ${formatDisplayDate(date).toUpperCase()}`;
    };

    // Tính toán thống kê
    const calculateStatistics = (schedules: TeacherScheduleType[]) => {
        const totalSessions = schedules.length;

        const usedRooms = new Set(
            schedules
                .filter(session => session.roomName && session.status !== 'canceled')
                .map(session => session.roomName)
        );
        const totalRoomsCount = 8;
        const availableRooms = totalRoomsCount - usedRooms.size;

        const canceledSessions = schedules.filter(session => session.status === 'canceled').length;

        const uniqueRooms = new Set(
            schedules
                .filter(session => session.roomName)
                .map(session => session.roomName)
        );

        return {
            totalSessions,
            totalRooms: uniqueRooms.size,
            availableRooms: Math.max(0, availableRooms),
            canceledSessions
        };
    };

    // Lấy trạng thái hiển thị
    const getStatusDisplay = (status: string) => {
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
                return { text: 'ĐÃ KẾT THÚC', bg: 'bg-gray-100', textColor: 'text-gray-600' };
            default:
                return { text: 'KHÔNG XÁC ĐỊNH', bg: 'bg-gray-100', textColor: 'text-gray-600' };
        }
    };

    const getVietnameseStatus = (status: string): string => {
        return getStatusDisplay(status).text;
    };

    const getStatusBgColor = (status: string): string => {
        return getStatusDisplay(status).bg;
    };

    const getStatusTextColor = (status: string): string => {
        return getStatusDisplay(status).textColor;
    };

    // Extract class code từ subject name
    const extractClassCode = (subjectName: string): string => {
        if (subjectName.includes('Toán')) return 'TOÁN';
        if (subjectName.includes('Lý')) return 'LÝ';
        if (subjectName.includes('Hóa')) return 'HÓA';
        if (subjectName.includes('Văn')) return 'VĂN';
        if (subjectName.includes('Anh')) return 'ENGLISH';
        if (subjectName.includes('KHOA HỌC TỰ NHIÊN') || subjectName.includes('KHTN')) return 'KHTN';
        return subjectName.substring(0, 4).toUpperCase();
    };

    // Xử lý schedules thành các nhóm theo thời gian
    const processSchedules = (schedules: TeacherScheduleType[]) => {
        const timeGroups = new Map<string, TeacherScheduleType[]>();

        schedules.forEach(session => {
            const timeKey = session.startTime.substring(0, 5);
            if (!timeGroups.has(timeKey)) {
                timeGroups.set(timeKey, []);
            }
            timeGroups.get(timeKey)!.push(session);
        });

        const result: ScheduleTimeGroup[] = [];
        const sortedTimes = Array.from(timeGroups.keys()).sort();

        for (const time of sortedTimes) {
            const sessionsAtTime = timeGroups.get(time)!;
            const hasOngoing = sessionsAtTime.some(s => s.status === 'ongoing');

            if (sessionsAtTime.length === 1) {
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
                        room: session.roomName || 'Chưa có phòng',
                        status: getVietnameseStatus(session.status),
                        statusBg: getStatusBgColor(session.status),
                        statusText: getStatusTextColor(session.status),
                        startTime: session.startTime,
                        endTime: session.endTime,
                        isOngoing,
                        isCanceled: session.status === 'canceled'
                    }
                });
            } else {
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
                            room: session.roomName || 'Chưa có phòng',
                            status: getVietnameseStatus(session.status),
                            statusBg: getStatusBgColor(session.status),
                            statusText: getStatusTextColor(session.status),
                            startTime: session.startTime,
                            endTime: session.endTime,
                            isOngoing,
                            isCanceled: session.status === 'canceled'
                        };
                    })
                });
            }
        }

        return result;
    };

    // Fetch schedules từ API
    const fetchSchedules = async (date: Date) => {
        if (!teacherId) {
            console.log('Chưa có teacherId, không thể fetch lịch');
            return;
        }

        setLoading(true);
        try {
            const dateStr = formatDateForApi(date);
            const data: TeacherScheduleType[] = await teacherScheduleApi.getSchedule(teacherId, {
                startDate: dateStr,
                endDate: dateStr
            });

            setSchedules(data);

            const stats = calculateStatistics(data);
            setStatistics(stats);

            const processedSchedules = processSchedules(data);
            setSessionsByTime(processedSchedules);

            if (data.length > 0) {
                const roomStatuses = calculateRoomStatuses(data);
                setTodayRoomStatus(roomStatuses);
            }
        } catch (error) {
            console.error('Failed to fetch teacher schedules:', error);
            setSessionsByTime([]);
            setStatistics({
                totalSessions: 0,
                totalRooms: 0,
                availableRooms: 0,
                canceledSessions: 0
            });
        } finally {
            setLoading(false);
        }
    };

    // Tính toán trạng thái phòng
    const calculateRoomStatuses = (schedules: TeacherScheduleType[]) => {
        const roomsMap = new Map();

        schedules.forEach(session => {
            if (session.roomName && session.status !== 'canceled') {
                if (!roomsMap.has(session.roomName)) {
                    const now = new Date();
                    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    const startTime = session.startTime.substring(0, 5);
                    const endTime = session.endTime.substring(0, 5);

                    let status = "Đang trống";
                    let isUsed = false;

                    if (currentTime >= startTime && currentTime <= endTime) {
                        status = `Đang sử dụng - ${session.subjectName}`;
                        isUsed = true;
                    } else if (startTime > currentTime) {
                        status = `Chuẩn bị (${startTime})`;
                        isUsed = false;
                    }

                    roomsMap.set(session.roomName, {
                        id: session.roomId || Math.random(),
                        name: session.roomName,
                        status,
                        isUsed
                    });
                }
            }
        });

        const sampleRooms = ['Phòng A101', 'Phòng A102', 'Phòng B201', 'Phòng B202', 'Lab 1', 'Lab 2'];
        sampleRooms.forEach(roomName => {
            if (!roomsMap.has(roomName)) {
                roomsMap.set(roomName, {
                    id: Math.random(),
                    name: roomName,
                    status: "Đang trống",
                    isUsed: false
                });
            }
        });

        return Array.from(roomsMap.values()).slice(0, 6);
    };

    // Xử lý click vào session để mở modal
    const handleSessionClick = (session: any) => {
        const sessionId = session.sessionId || session.id;
        if (sessionId) {
            setSelectedSession(sessionId);
            setIsModalOpen(true);
        }
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
        // Refresh schedules sau khi đóng modal để cập nhật trạng thái mới
        if (teacherId) {
            fetchSchedules(currentDate);
        }
    };

    // Xử lý thay đổi ngày
    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Fetch schedules khi teacherId hoặc currentDate thay đổi
    useEffect(() => {
        if (teacherId) {
            fetchSchedules(currentDate);
        }
    }, [teacherId, currentDate]);

    // Loading states
    if (authLoading || loadingTeacherId) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Đang tải thông tin giáo viên...</p>
                </div>
            </div>
        );
    }

    // Error states
    if (teacherIdError) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không thể tải lịch</h3>
                <p className="text-gray-600 max-w-md mb-6">{teacherIdError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    // No teacher found
    if (!teacherId) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-12 h-12 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy thông tin giáo viên</h3>
                <p className="text-gray-600 max-w-md">
                    Tài khoản {user?.email} chưa được liên kết với thông tin giáo viên.
                    Vui lòng liên hệ quản trị viên để được hỗ trợ.
                </p>
            </div>
        );
    }

    // Main render
    return (
        <div className="max-w-[1600px] p-8 w-full">
            <>
                <ScheduleHeaderFiltersSection
                    currentDate={currentDate}
                    activeView={viewMode}
                    onViewChange={setViewMode}
                />

                <div className="grid grid-cols-12 gap-8 mt-8 ">
                    {/* Left Column - Schedule */}
                    {viewMode === "ngay" ? (
                        <div className="col-span-9">
                            <div className="bg-white rounded-2xl border">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => changeDate(-1)}
                                            className="p-2 hover:bg-violet-50 rounded-full transition"
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
                                            className="p-2 hover:bg-violet-50 rounded-full transition"
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

                                {/* Schedule Items */}
                                <div className="p-6">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="text-gray-500">Đang tải lịch...</div>
                                        </div>
                                    ) : sessionsByTime.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                                <Calendar className="w-10 h-10 text-gray-400 stroke-[1.5]" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-1">
                                                Không có lịch dạy
                                            </h3>
                                            <p className="text-sm text-gray-500 max-w-md">
                                                Không tìm thấy ca dạy nào trong ngày{" "}
                                                <span className="font-medium text-gray-700">
                                                    {formatDisplayDate(currentDate)}
                                                </span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            {sessionsByTime.map((row, idx) => {
                                                if (row.type === "single") {
                                                    const item = row.item!;
                                                    const isOngoing = row.isOngoing || item.isOngoing;
                                                    const isCanceled = item.status === 'ĐÃ HỦY';

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
                                                                            : 'bg-white hover:bg-gray-50'
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
                                                                                    {item.room ? `• ${item.room}` : "• Chưa có phòng"}
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

                                                                    {isOngoing && !isCanceled && (
                                                                        <div className="mt-4 flex justify-end">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleSessionClick(item);
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

                                                                        return (
                                                                            <div
                                                                                key={i}
                                                                                onClick={() => handleSessionClick(item)}
                                                                                className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition ${isItemCanceled
                                                                                    ? 'bg-rose-50 border-rose-200'
                                                                                    : isItemOngoing
                                                                                        ? 'bg-violet-50 border-violet-200'
                                                                                        : 'bg-white hover:bg-gray-50'
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
                                                                                                {item.room}
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

                                                                                {isItemOngoing && !isItemCanceled && (
                                                                                    <div className="mt-3 flex justify-end">
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleSessionClick(item);
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
                        <div className="col-span-9">
                            <TeacherWeeklyScheduleView
                                currentDate={currentDate}
                                onDateChange={setCurrentDate}
                                onSessionClick={(sessionId) => {
                                    setSelectedSession(sessionId);
                                    setIsModalOpen(true);
                                }}
                                teacherId={teacherId}
                            />
                        </div>
                    )}

                    {/* Right Column - Stats & Info */}
                    <div className="col-span-3 space-y-6">
                        {/* Summary Card */}
                        <div className="p-6 bg-blue-900 rounded-2xl text-white">
                            <div className="text-sm font-bold opacity-80">
                                {getSummaryTitle(currentDate)}
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-semibold">{statistics.totalSessions}</div>
                                    <div className="text-xs opacity-80">Ca dạy</div>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="my-6 h-px bg-white/10" />
                        </div>

                        {/* Notice */}
                        <div className="p-6 bg-blue-50 rounded-2xl border border-violet-100">
                            <div className="font-extrabold text-blue-900 text-[11px] mb-4">
                                THÔNG TIN
                            </div>
                            <div className="text-blue-900 text-[10px] leading-relaxed">
                                • Lịch dạy được cập nhật theo thời gian thực
                                <br />
                                • Trạng thái "Đang diễn ra" sẽ tự động cập nhật
                                <br />
                                • Liên hệ quản lý nếu có thắc mắc về lịch
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reschedule Modal */}
                <RescheduleModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    sessionId={selectedSession}
                    isTeacher={true}
                />
            </>
        </div>
    );
};