import { motion } from 'framer-motion';
import { School, Calendar, Users, CheckCircle, XCircle, Clock as ClockIcon, AlertCircle, User, BellOff } from 'lucide-react';
import type { ReplacementSession } from '../../../../utils/types/teacherLeave';

interface SubstituteRequestCardProps {
  request: ReplacementSession;
  onAccept: (affectedSessionId: number) => void;
  onReject: (affectedSessionId: number, reason?: string) => void;
  onViewDetail: (affectedSessionId: number) => void;
}

const cleanName = (name: string): string => {
  if (!name) return 'N/A';
  if (name.includes(' - ')) {
    const parts = name.split(' - ');
    return parts[parts.length - 1].trim();
  }
  return name;
};

// ✅ Cập nhật getStatusConfig với đầy đủ các status
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { 
        label: 'Chờ phản hồi', 
        bg: 'bg-amber-100', 
        text: 'text-amber-700',
        icon: ClockIcon,
        iconBg: 'bg-amber-50'
      };
    case 'ASSIGNED':  // ✅ THÊM
      return { 
        label: 'Yêu cầu dạy thay', 
        bg: 'bg-blue-100', 
        text: 'text-blue-700',
        icon: ClockIcon,
        iconBg: 'bg-blue-50'
      };
    case 'ACCEPTED':
      return { 
        label: 'Đã nhận dạy', 
        bg: 'bg-green-100', 
        text: 'text-green-700',
        icon: CheckCircle,
        iconBg: 'bg-green-50'
      };
    case 'REJECTED':
      return { 
        label: 'Đã từ chối', 
        bg: 'bg-red-100', 
        text: 'text-red-700',
        icon: XCircle,
        iconBg: 'bg-red-50'
      };
    case 'COMPLETED':
      return { 
        label: 'Hoàn thành', 
        bg: 'bg-blue-100', 
        text: 'text-blue-700',
        icon: CheckCircle,
        iconBg: 'bg-blue-50'
      };
    default:
      return { 
        label: status, 
        bg: 'bg-gray-100', 
        text: 'text-gray-700',
        icon: AlertCircle,
        iconBg: 'bg-gray-50'
      };
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
};

export const EmptySubstituteRequests = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-12 text-center border border-gray-100"
  >
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <BellOff size={28} className="text-gray-400" />
    </div>
    <p className="text-gray-500 font-medium">Không có yêu cầu dạy thay nào</p>
    <p className="text-xs text-gray-400 mt-2">
      Khi có giáo viên khác xin nghỉ và bạn được phân công dạy thay, yêu cầu sẽ hiển thị tại đây
    </p>
    <div className="mt-4 p-3 bg-amber-50 rounded-xl inline-block">
      <p className="text-xs text-amber-700">
        💡 Bạn sẽ nhận được thông báo khi có lịch dạy thay phù hợp với chuyên môn
      </p>
    </div>
  </motion.div>
);

export const SubstituteRequestCard = ({ request, onAccept, onReject, onViewDetail }: SubstituteRequestCardProps) => {
  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;
  
  // ✅ Sửa isPending để bao gồm cả ASSIGNED
  const isPending = request.status === 'PENDING' || request.status === 'ASSIGNED';
  const isAccepted = request.status === 'ACCEPTED';
  
  const sessionId = request.affectedSessionId ?? request.id;
  
  const displaySubjectName = cleanName(request.subjectName);
  const displayTeacherName = cleanName(request.originalTeacherName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${
        isPending ? 'border-amber-200 shadow-amber-100/50' : 'border-gray-100'
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5`}>
              <StatusIcon size={14} />
              {statusConfig.label}
            </span>
            <span className="text-gray-400 text-xs font-mono">Mã yêu cầu: #{request.sessionId}</span>
            {isPending && (
              <span className="ml-auto flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Cần phản hồi
              </span>
            )}
            {isAccepted && (
              <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                Đã chấp nhận
              </span>
            )}
          </div>

          {/* Main info grid - giữ nguyên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <School size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Lớp</p>
                <p className="font-bold text-gray-800 text-sm">{displaySubjectName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Thời gian</p>
                <p className="font-semibold text-gray-700 text-sm">
                  {formatDate(request.sessionDate)} - {request.startTime} đến {request.endTime}
                </p>
                <p className="text-xs text-gray-400">Phòng: {request.roomName || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">GV xin nghỉ</p>
                <p className="font-semibold text-gray-700 text-sm">{displayTeacherName || 'Đang cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Trạng thái</p>
                <p className={`font-semibold text-sm ${statusConfig.text}`}>{statusConfig.label}</p>
                {isAccepted && (
                  <p className="text-xs text-green-600 mt-0.5">Bạn là GV thay thế</p>
                )}
              </div>
            </div>
          </div>

          {/* Lý do (nếu có) */}
          {request.reason && (
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Lý do xin nghỉ</p>
              <p className="text-gray-700 text-sm italic">"{request.reason}"</p>
            </div>
          )}

          {/* Thông tin thêm nếu đã nhận */}
          {isAccepted && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-xl">
              <CheckCircle size={14} />
              <span>Bạn đã xác nhận dạy thay buổi này. Lịch đã được cập nhật.</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-row lg:flex-col justify-center gap-2 lg:border-l border-gray-100 lg:pl-4">
          {isPending ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAccept(sessionId)}
                className="flex-1 lg:flex-none px-5 py-2 btn-gradient from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Nhận dạy thay
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const reason = prompt('Nhập lý do từ chối (tùy chọn):');
                  onReject(sessionId, reason || undefined);
                }}
                className="flex-1 lg:flex-none px-5 py-2 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                Từ chối
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewDetail(sessionId)}
              className="flex-1 lg:flex-none px-5 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold text-sm hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
            >
              <ClockIcon size={16} />
              Xem chi tiết
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};