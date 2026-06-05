import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    Clock3,
    MapPin,
    UserPlus,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    History,
    RefreshCw,
    Trash2,
    UserCheck,
    UserX,
    Loader2,
    Send,
    X
} from 'lucide-react';
import type { AffectedSession, AvailableReplacementTeacher } from '../../../utils/types/teacherLeave';
import {
    getSessionStatusConfig,
    formatDisplayTime,
    formatDateTime,
    cleanDisplayName
} from '../../../utils/helpers/sessionStatus';

interface SessionCardProps {
    session: AffectedSession;
    index: number;
    availableTeachers?: AvailableReplacementTeacher[];
    isLoadingTeachers?: boolean;
    isAssigning?: boolean;
    onAssignTeacher: (sessionId: number, teacherId: number) => Promise<void>;
    onCancelSession: (affectedSessionId: number) => Promise<void>;
    onResendRequest?: (affectedSessionId: number) => Promise<void>;
    onCancelAssignment?: (affectedSessionId: number) => Promise<void>;
    onGetAvailableTeachers: (sessionId: number) => Promise<void>;
    onRefresh?: () => void;
}

export const SessionCard = ({
    session,
    index,
    availableTeachers = [],
    isLoadingTeachers = false,
    isAssigning = false,
    onAssignTeacher,
    onCancelSession,
    onResendRequest,
    onCancelAssignment,
    onGetAvailableTeachers,
    onRefresh,
}: SessionCardProps) => {
    const [showHistory, setShowHistory] = useState(false);
    const [showTeacherSelect, setShowTeacherSelect] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

    const statusConfig = getSessionStatusConfig(session.status);
    const StatusIcon = statusConfig.icon;

    const cleanReplacementTeacher = cleanDisplayName(session.replacementTeacherName || '');
    const cleanSubjectName = cleanDisplayName(session.subjectName || '');
    const cleanRoomName = cleanDisplayName(session.roomName || '');
    const cleanClassName = cleanDisplayName(session.className || '');

    const sessionDate = new Date(session.sessionDate);
    const dayOfWeek = sessionDate.toLocaleDateString('vi-VN', { weekday: 'short' });
    const dayNumber = sessionDate.getDate();

    useEffect(() => {
        if (session.status === 'ASSIGNED' || session.status === 'RESOLVED' || session.status === 'DECLINED') {
            setShowTeacherSelect(false);
            setSelectedTeacherId(null);
        }
    }, [session.status]);

    const handleAssign = async () => {
        if (!selectedTeacherId) return;
        await onAssignTeacher(session.affectedSessionId || session.id, selectedTeacherId);
        setShowTeacherSelect(false);
        setSelectedTeacherId(null);
    };

    const handleGetTeachers = async () => {
        const sessionId = session.affectedSessionId || session.id;
        if (!sessionId) {
            console.error('❌ Cannot fetch teachers: session ID is missing');
            return;
        }
        await onGetAvailableTeachers(sessionId);
        setShowTeacherSelect(true);
    };

    const handleResendRequest = async () => {
        if (!onResendRequest) return;
        const sessionId = session.affectedSessionId || session.id;
        await onResendRequest(sessionId);
    };

    const handleCancelAssignment = async () => {
        if (!onCancelAssignment) return;
        const sessionId = session.affectedSessionId || session.id;
        if (confirm('Bạn có chắc chắn muốn hủy phân công này?')) {
            await onCancelAssignment(sessionId);
        }
    };


    const renderTeacherSelection = () => (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <UserPlus size={12} />
                Chọn giáo viên dạy thay
            </p>
            {isLoadingTeachers ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-indigo-500" />
                </div>
            ) : availableTeachers.length > 0 ? (
                <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availableTeachers.map((teacher) => (
                            <motion.label
                                key={teacher.teacherId}
                                whileHover={{ scale: 1.01 }}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedTeacherId === teacher.teacherId
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-200'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`teacher-${session.sessionId}`}
                                    value={teacher.teacherId}
                                    checked={selectedTeacherId === teacher.teacherId}
                                    onChange={() => setSelectedTeacherId(teacher.teacherId)}
                                    className="w-4 h-4 text-indigo-600"
                                />
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{teacher.teacherName}</p>
                                    <p className="text-xs text-gray-400">{teacher.teacherEmail}</p>
                                </div>
                            </motion.label>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => setShowTeacherSelect(false)}
                            className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                        >
                            Hủy
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAssign}
                            disabled={!selectedTeacherId || isAssigning}
                            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAssigning ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Xác nhận
                        </motion.button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                    Không có giáo viên khả dụng
                </div>
            )}
        </div>
    );

    const renderActionArea = () => {
        switch (session.status) {
            case 'PENDING':
                if (showTeacherSelect) {
                    return renderTeacherSelection();
                }
                return (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGetTeachers}
                        disabled={isAssigning}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isAssigning ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        Chọn giáo viên
                    </motion.button>
                );

            case 'ASSIGNED':
                return (
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 animate-pulse">
                            <Loader2 size={12} className="animate-spin text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">Đã gửi yêu cầu dạy thay</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Đang chờ <span className="font-medium text-gray-700">{cleanReplacementTeacher}</span> phản hồi
                        </p>
                        <div className="flex gap-2 mt-1">
                            {/* ✅ Thêm nút refresh cho session này */}
                            <button
                                onClick={onRefresh}
                                className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                            >
                                <RefreshCw size={10} />
                                Kiểm tra
                            </button>
                            <button
                                onClick={handleResendRequest}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                            >
                                <RefreshCw size={10} />
                                Gửi lại
                            </button>
                            <button
                                onClick={handleCancelAssignment}
                                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                            >
                                <X size={10} />
                                Hủy
                            </button>
                        </div>
                    </div>
                );

            case 'DECLINED':
                if (showTeacherSelect) {
                    return renderTeacherSelection();
                }
                return (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 self-end">
                            <XCircle size={12} className="text-red-600" />
                            <span className="text-xs font-medium text-red-700">
                                {cleanReplacementTeacher} đã từ chối
                            </span>
                        </div>
                        {session.declineReason && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 p-2 rounded-lg border border-red-200 max-w-[250px]"
                            >
                                <p className="text-[11px] text-red-600 italic">"{session.declineReason}"</p>
                            </motion.div>
                        )}
                        <div className="flex gap-2 justify-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGetTeachers}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium flex items-center gap-1 hover:bg-indigo-700 transition-all"
                            >
                                <RefreshCw size={12} />
                                Chọn GV khác
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onCancelSession(session.affectedSessionId || session.id)}
                                className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1 hover:bg-gray-300 transition-all"
                            >
                                <Trash2 size={12} />
                                Hủy buổi
                            </motion.button>
                        </div>
                    </div>
                );

            case 'RESOLVED':
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100">
                        <CheckCircle size={14} className="text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">
                            {cleanReplacementTeacher} đã nhận dạy
                        </span>
                    </div>
                );

            case 'SKIPPED':
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
                        <XCircle size={14} className="text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Buổi học đã hủy</span>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            className={`bg-white rounded-2xl overflow-hidden border-l-4 transition-all shadow-sm ${statusConfig.border}`}
            style={{ borderLeftColor: `var(--${statusConfig.iconColor.replace('text-', '')})` }}
        >
            <div className="p-5">
                {/* Main content row */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Date & Subject Info */}
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shadow-sm ${statusConfig.bg}`}>
                            <span className={`text-xs font-bold ${statusConfig.iconColor}`}>{dayOfWeek}</span>
                            <span className={`text-xl font-black ${statusConfig.iconColor}`}>{dayNumber}</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-gray-900 text-lg">{cleanSubjectName}</p>
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.badgeColor}`}>
                                    <StatusIcon size={10} />
                                    {statusConfig.label}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                    <Clock3 size={12} className="text-indigo-400" />
                                    {formatDisplayTime(session.startTime)} - {formatDisplayTime(session.endTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} className="text-indigo-400" />
                                    {cleanRoomName}
                                </span>
                                {cleanClassName && cleanClassName !== 'Chưa cập nhật' && (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        Lớp: {cleanClassName}
                                    </span>
                                )}
                            </div>

                            {/* Assigned teacher info */}
                            {(session.status === 'ASSIGNED' || session.status === 'DECLINED' || session.status === 'RESOLVED') && (
                                <div className="flex items-center gap-2 mt-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <UserCheck size={12} className="text-indigo-600" />
                                    </div>
                                    <span className="text-gray-600">
                                        GV: <span className="font-medium text-gray-800">{cleanReplacementTeacher}</span>
                                    </span>
                                    {session.assignedAt && (
                                        <span className="text-[10px] text-gray-400">
                                            {formatDateTime(session.assignedAt)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Action Area - CHỈ CÓ 1 NƠI DUY NHẤT */}
                    <div className="flex-shrink-0">
                        {renderActionArea()}
                    </div>
                </div>

                {/* ❌ ĐÃ XÓA: Teacher Selection Dropdown cũ ở đây */}

                {/* Timeline / History Section */}
                {session.sessionHistory && session.sessionHistory.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <History size={12} />
                            Lịch sử xử lý
                            {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        <AnimatePresence>
                            {showHistory && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 space-y-2"
                                >
                                    {session.sessionHistory.map((history, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-xs">
                                            <div className="w-16 text-gray-400 flex-shrink-0">
                                                {formatDateTime(history.createdAt).split(' ')[1]}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-700">{history.actorName}</span>
                                                <span className="text-gray-500"> {history.action === 'ASSIGNED' ? 'đã phân công' :
                                                    history.action === 'ACCEPTED' ? 'đã nhận dạy' :
                                                        history.action === 'DECLINED' ? 'đã từ chối' :
                                                            history.action === 'REASSIGNED' ? 'đã phân công lại' :
                                                                'đã hủy'}</span>
                                                {history.action === 'ASSIGNED' && history.newTeacherName && (
                                                    <span className="text-gray-600"> cho {history.newTeacherName}</span>
                                                )}
                                                {history.note && (
                                                    <p className="text-gray-400 italic mt-0.5">"{history.note}"</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
};