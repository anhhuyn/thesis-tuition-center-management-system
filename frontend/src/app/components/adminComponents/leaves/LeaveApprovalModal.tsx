import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  FileText,
  Sparkles,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { teacherLeaveApi } from '../../../utils/api/teacherLeave.api';
import type { PreviewAffectedSessionResponse } from '../../../utils/types/teacherLeave'; 

interface LeaveApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveId: number;
  teacherName: string;
  teacherAvatar?: string;
  leaveDate: string;
  reason: string;
  affectedSessions: PreviewAffectedSessionResponse[];
  onApprove: (options: {
    approvalType: 'full_leave' | 'replace';
    replacements: Record<string, string>;
    comment: string;
  }) => void;
  onReject?: () => void;
  isSubmitting?: boolean;
}

export const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({
  isOpen,
  onClose,
  leaveId,
  teacherName,
  teacherAvatar,
  leaveDate,
  reason,
  affectedSessions,
  onApprove,
  onReject,
  isSubmitting = false,
}) => {
  const [approvalType, setApprovalType] = useState<'full_leave' | 'replace'>('full_leave');
  const [replacements, setReplacements] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [availableTeachersMap, setAvailableTeachersMap] = useState<Record<string, any[]>>({});
  const [loadingTeachers, setLoadingTeachers] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const totalSessions = affectedSessions.length;
  const selectedCount = Object.keys(replacements).filter(
    (id) => replacements[id] && replacements[id] !== ''
  ).length;
  const isReplaceIncomplete = approvalType === 'replace' && totalSessions > 0 && selectedCount !== totalSessions;

  const handleReplaceChange = (sessionId: string, teacherId: string) => {
    setReplacements((prev) => ({ ...prev, [sessionId]: teacherId }));
  };

  // Trong component, thay `session.sessionId` bằng `session.id` (đã map ở trên)
  const loadAvailableTeachers = async (sessionId: string) => {
    // sessionId lúc này là id của session (đã map)
    if (availableTeachersMap[sessionId]?.length) return;
    setLoadingTeachers(prev => ({ ...prev, [sessionId]: true }));
    try {
      const numSessionId = Number(sessionId);
      const numLeaveId = Number(leaveId);
      if (isNaN(numSessionId) || isNaN(numLeaveId)) {
        console.error('Invalid sessionId or leaveId');
        setAvailableTeachersMap(prev => ({ ...prev, [sessionId]: [] }));
        return;
      }
      const teachers = await teacherLeaveApi.previewAvailableTeachers(numSessionId, numLeaveId);
      setAvailableTeachersMap(prev => ({ ...prev, [sessionId]: teachers }));
    } catch (error: any) {
      console.error('Lỗi tải danh sách giáo viên thay thế:', error);
      // Fallback: hiển thị input text thay vì dropdown
      setAvailableTeachersMap(prev => ({ ...prev, [sessionId]: [] }));
    } finally {
      setLoadingTeachers(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleSubmit = () => {
    if (approvalType === 'replace' && isReplaceIncomplete) return;
    onApprove({
      approvalType,
      replacements,
      comment,
    });
  };

  const handleReject = () => {
    if (onReject) onReject();
    onClose();
  };

  const formatDateTime = (date: string, startTime?: string, endTime?: string) => {
    if (startTime && endTime) {
      return `${date} (${startTime} - ${endTime})`;
    }
    return date;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Phê duyệt đơn xin nghỉ</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Đang chờ xử lý
          </div>
        </header>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
          {/* Teacher Info */}
          <section className="flex items-center gap-5 p-5 rounded-xl bg-gray-50 border border-gray-100">
            <img
              src={teacherAvatar || '/default-avatar.png'}
              alt={teacherName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{teacherName}</h2>
              <p className="text-gray-500 flex items-center gap-1 text-sm">
                <Calendar className="w-4 h-4" />
                Ngày xin nghỉ: {leaveDate}
              </p>
              <p className="text-gray-500 flex items-center gap-1 text-sm mt-1">
                <FileText className="w-4 h-4" />
                Lý do: {reason}
              </p>
            </div>
          </section>

          {/* Affected Sessions Table */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Buổi học bị ảnh hưởng</h3>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng cộng: {totalSessions} buổi
              </span>
            </div>
            {totalSessions === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
                Không có buổi học nào bị ảnh hưởng.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
                <table className="w-full text-left">
                  <thead className="bg-gray-100/50">
                    <tr>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-600">Ngày/Giờ</th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-600">Môn học</th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-600">Giáo viên thay thế</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {affectedSessions.map((session, idx) => (
                      <tr key={session.sessionId ?? idx}>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {formatDateTime(session.sessionDate, session.startTime, session.endTime)}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-800">
                          {session.subjectName}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={replacements[String(session.sessionId)] || ''}
                            onChange={(e) => handleReplaceChange(String(session.sessionId), e.target.value)}
                            onFocus={() => {
                              if (session.sessionId) {
                                loadAvailableTeachers(String(session.sessionId));
                              }
                            }} 
                            className="w-full bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            disabled={approvalType === 'full_leave' || isSubmitting}
                          >
                            <option value="">Chọn giáo viên...</option>
                            {loadingTeachers[String(session.sessionId)] ? (
                              <option disabled>Đang tải...</option>
                            ) : (
                              (availableTeachersMap[String(session.sessionId)] || []).map((teacher) => (
                                <option key={teacher.teacherId} value={String(teacher.teacherId)}>
                                  {teacher.teacherName} ({teacher.teacherEmail})
                                </option>
                              ))
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* AI Suggestion */}
            <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
              <div className="p-2 bg-purple-600 rounded-lg text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-purple-800 text-sm font-bold">Gợi ý từ AI</p>
                <p className="text-purple-700 text-sm leading-relaxed mt-0.5">
                  Dựa trên lịch giảng dạy và chuyên môn, hệ thống đã gợi ý danh sách giáo viên có thể thay thế ở trên.
                </p>
                <button className="mt-2 text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
                  Xem chi tiết lịch trống
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </section>

          {/* Approval Options */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Phương án xử lý</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${approvalType === 'full_leave'
                  ? 'border-purple-500 bg-purple-50/30'
                  : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
              >
                <input
                  type="radio"
                  name="approval_type"
                  value="full_leave"
                  checked={approvalType === 'full_leave'}
                  onChange={() => setApprovalType('full_leave')}
                  className="absolute top-4 right-4 text-purple-600 focus:ring-purple-500"
                  disabled={isSubmitting}
                />
                <span className="font-bold text-gray-900">Nghỉ toàn bộ</span>
                <span className="text-sm text-gray-500 mt-1">Hủy tất cả các tiết học trong thời gian xin nghỉ.</span>
              </label>
              <label
                className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${approvalType === 'replace'
                  ? 'border-purple-500 bg-purple-50/30'
                  : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
              >
                <input
                  type="radio"
                  name="approval_type"
                  value="replace"
                  checked={approvalType === 'replace'}
                  onChange={() => setApprovalType('replace')}
                  className="absolute top-4 right-4 text-purple-600 focus:ring-purple-500"
                  disabled={isSubmitting}
                />
                <span className="font-bold text-gray-900">Có giáo viên thay thế</span>
                <span className="text-sm text-gray-500 mt-1">Tiết học vẫn diễn ra với sự phụ trách của GV khác.</span>
              </label>
            </div>

            {approvalType === 'replace' && isReplaceIncomplete && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">
                  Lưu ý: Bạn chưa chọn đủ giáo viên thay thế cho tất cả các buổi học bị ảnh hưởng.
                </p>
              </div>
            )}

            {/* Comment */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Ghi chú phê duyệt</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-800 placeholder:text-gray-400"
                placeholder="Nhập ý kiến chỉ đạo hoặc lý do cụ thể..."
                disabled={isSubmitting}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="px-6 py-5 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Từ chối
          </button>
          <button
            onClick={handleSubmit}
            disabled={(approvalType === 'replace' && isReplaceIncomplete) || isSubmitting}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Lưu xử lý'}
          </button>
        </footer>
      </div>
    </div>
  );
};