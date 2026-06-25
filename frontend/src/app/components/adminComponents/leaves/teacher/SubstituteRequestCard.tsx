import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  School, Calendar, Users, CheckCircle, XCircle, Clock as ClockIcon, 
  AlertCircle, User, BellOff, X, FileText, AlertTriangle 
} from 'lucide-react';
import type { ReplacementSession } from '../../../../utils/types/teacherLeave';

interface SubstituteRequestCardProps {
  request: ReplacementSession;
  onAccept: (affectedSessionId: number) => void;
  onReject: (affectedSessionId: number, reason?: string) => void;
  onViewDetail: (affectedSessionId: number) => void;
}

// Reject Reason Modal Component
interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  sessionId: number;
  teacherName: string;
  subjectName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sessionId,
  teacherName,
  subjectName,
  sessionDate,
  startTime,
  endTime,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(reason);
    setIsSubmitting(false);
    setReason('');
    onClose();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50"
        >
          {/* Decorative gradient header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-purple-50/80 via-white to-transparent dark:from-purple-950/30 dark:via-slate-900/50">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl btn-gradient text-white shadow-lg shadow-purple-500/25">
                  <XCircle size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Từ chối dạy thay
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Vui lòng cung cấp lý do từ chối
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-5">
              {/* Session Info Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Giáo viên</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{teacherName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Môn học</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{subjectName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Ngày</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatDate(sessionDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Thời gian</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{startTime} - {endTime}</span>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Việc từ chối sẽ được ghi nhận và có thể ảnh hưởng đến đánh giá của bạn.
                </p>
              </div>

              {/* Reason Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 ml-1">
                  <FileText size={14} className="text-purple-500" />
                  Lý do từ chối <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className={`
                    w-full px-4 py-3 rounded-xl border-2
                    bg-white dark:bg-slate-800/50
                    text-slate-900 dark:text-white text-sm
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                    border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600
                    resize-none
                  `}
                  placeholder="Nhập lý do từ chối cụ thể (ví dụ: đã có lịch dạy trùng, không phù hợp chuyên môn, ...)"
                  autoFocus
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                  {reason.length}/500 ký tự
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 flex items-center justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              disabled={isSubmitting || !reason.trim()}
              className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  Xác nhận từ chối
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const cleanName = (name: string): string => {
  if (!name) return 'N/A';
  if (name.includes(' - ')) {
    const parts = name.split(' - ');
    return parts[parts.length - 1].trim();
  }
  return name;
};

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
    case 'ASSIGNED':
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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;
  
  const isPending = request.status === 'PENDING' || request.status === 'ASSIGNED';
  const isAccepted = request.status === 'ACCEPTED';
  
  const sessionId = request.affectedSessionId ?? request.id;
  
  const displaySubjectName = cleanName(request.subjectName);
  const displayTeacherName = cleanName(request.originalTeacherName);

  const handleRejectClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedSessionId !== null) {
      onReject(selectedSessionId, reason);
      setSelectedSessionId(null);
    }
  };

  const handleRejectModalClose = () => {
    setShowRejectModal(false);
    setSelectedSessionId(null);
  };

  return (
    <>
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

            {/* Main info grid */}
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
                  className="flex-1 lg:flex-none px-5 py-2 btn-gradient text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Nhận dạy thay
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRejectClick(sessionId)}
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

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={showRejectModal}
        onClose={handleRejectModalClose}
        onConfirm={handleRejectConfirm}
        sessionId={selectedSessionId || 0}
        teacherName={displayTeacherName}
        subjectName={displaySubjectName}
        sessionDate={request.sessionDate}
        startTime={request.startTime}
        endTime={request.endTime}
      />
    </>
  );
};