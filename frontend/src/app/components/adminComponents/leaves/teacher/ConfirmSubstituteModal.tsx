// src/components/adminComponents/leaves/teacher/ConfirmSubstituteModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handshake, Ban, Calendar, Users, School, Clock } from 'lucide-react';
import type { ReplacementSession } from '../../../../utils/types/teacherLeave';

interface ConfirmSubstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  request: ReplacementSession | null;
  action: 'accept' | 'reject';
  loading?: boolean;
}

// Hàm xử lý className bị lỗi Hibernate proxy - CHỈ LẤY PHẦN SAU DẤU " - "
const cleanName = (name: string): string => {
  if (!name) return 'N/A';
  
  // Trường hợp: "com.management... - Anh Văn 6" -> lấy "Anh Văn 6"
  if (name.includes(' - ')) {
    const parts = name.split(' - ');
    // Lấy phần cuối cùng sau dấu " - "
    const lastPart = parts[parts.length - 1];
    return lastPart.trim();
  }
  
  // Trường hợp: "Anh Văn 6" -> giữ nguyên
  return name;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const ConfirmSubstituteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  request, 
  action,
  loading = false 
}: ConfirmSubstituteModalProps) => {
  if (!isOpen || !request) return null;

  const isAccept = action === 'accept';
  
  // Xử lý className và subjectName
  const displayClassName = cleanName(request.className);
  const displaySubjectName = cleanName(request.subjectName);
  const displayOriginalTeacherName = cleanName(request.originalTeacherName);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className={`p-5 ${isAccept ? 'btn-gradient from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    {isAccept ? <Handshake size={28} /> : <Ban size={28} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {isAccept ? 'Xác nhận nhận dạy thay' : 'Từ chối dạy thay'}
                    </h3>
                 
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <p className="text-gray-600 text-sm">
                {isAccept 
                  ? 'Bạn có chắc chắn muốn nhận dạy thay buổi học này? Sau khi xác nhận, lịch dạy sẽ được cập nhật vào thời khóa biểu của bạn.'
                  : 'Bạn có chắc chắn muốn từ chối yêu cầu dạy thay này? Hệ thống sẽ tìm giáo viên khác để thay thế.'
                }
              </p>

              {/* Thông tin buổi dạy */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <School size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lớp &amp; Môn</p>
                    <p className="font-semibold text-gray-800">
                      {displaySubjectName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Thời gian</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(request.sessionDate)} - {request.startTime} đến {request.endTime}
                    </p>
                    <p className="text-xs text-gray-500">Phòng: {request.roomName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Giáo viên xin nghỉ</p>
                    <p className="font-semibold text-gray-800">{displayOriginalTeacherName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-200 pt-3 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trạng thái hiện tại</p>
                    <p className="font-semibold text-amber-600">
                      {request.status === 'PENDING' ? 'Chờ phản hồi' : request.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  isAccept 
                    ? 'btn-gradient from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                    : 'btn-gradient from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isAccept ? 'Xác nhận nhận dạy' : 'Xác nhận từ chối'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};