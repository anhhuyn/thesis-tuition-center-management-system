import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Calendar,
  FileText,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  XCircle,
  CheckCircle,
  DollarSign,
  User,
  Mail,
  X,
  Check,
  AlertCircle,
  Users,
  BookOpen,
  ShieldCheck,
  CalendarDays,
  Clock as ClockIcon,
  UserCircle,
  Wallet,
  Trash2,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { teacherLeaveApi } from '../../../utils/api/teacherLeave.api';
import type { PreviewAffectedSessionResponse, ReplacementWithSalary } from '../../../utils/types/teacherLeave';

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
    approvalType: 'full_leave' | 'flexible';
    replacements: ReplacementWithSalary[];
    cancelledSessions: string[];
    comment: string;
  }) => void;
  onReject?: () => void;
  isSubmitting?: boolean;
}

interface ReplacementData {
  teacherId: string;
  salary: string;
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
  const [approvalType, setApprovalType] = useState<'full_leave' | 'flexible'>('full_leave');
  const [replacements, setReplacements] = useState<Record<string, ReplacementData>>({});
  const [cancelledSessions, setCancelledSessions] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [availableTeachersMap, setAvailableTeachersMap] = useState<Record<string, any[]>>({});
  const [loadingTeachers, setLoadingTeachers] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const totalSessions = affectedSessions.length;
  const processedSessions = Object.keys(replacements).filter(
    id => replacements[id]?.teacherId && replacements[id].teacherId !== ''
  ).length + cancelledSessions.length;
  const isFlexibleIncomplete = approvalType === 'flexible' && totalSessions > 0 && processedSessions !== totalSessions;

  const handleReplaceChange = (sessionId: string, teacherId: string, salary?: string) => {
    setReplacements((prev) => ({
      ...prev,
      [sessionId]: {
        teacherId,
        salary: salary || '',
      },
    }));
    if (teacherId && teacherId !== '') {
      setCancelledSessions(prev => prev.filter(id => id !== sessionId));
    }
  };

  const handleTeacherSelect = (sessionId: string, teacherId: string) => {
    const teachers = availableTeachersMap[sessionId] || [];
    const selectedTeacher = teachers.find(t => String(t.teacherId) === teacherId);
    const defaultSalary = selectedTeacher?.defaultSalary?.toString() || '';
    handleReplaceChange(sessionId, teacherId, defaultSalary);
  };

  const handleCancelSession = (sessionId: string) => {
    if (cancelledSessions.includes(sessionId)) {
      setCancelledSessions(prev => prev.filter(id => id !== sessionId));
    } else {
      setCancelledSessions(prev => [...prev, sessionId]);
      setReplacements(prev => {
        const newReplacements = { ...prev };
        delete newReplacements[sessionId];
        return newReplacements;
      });
    }
  };

  const loadAvailableTeachers = async (sessionId: string) => {
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
      setAvailableTeachersMap(prev => ({ ...prev, [sessionId]: [] }));
    } finally {
      setLoadingTeachers(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleSubmit = () => {
    if (approvalType === 'flexible' && isFlexibleIncomplete) return;

    console.log('🔍 [LeaveApprovalModal] replacements state:', replacements);
    console.log('🔍 [LeaveApprovalModal] approvalType:', approvalType);

    const replacementsArray: ReplacementWithSalary[] = Object.entries(replacements)
      .filter(([, data]) => data.teacherId && data.teacherId !== '')
      .map(([sessionId, data]) => ({
        sessionId: Number(sessionId),
        replacementTeacherId: Number(data.teacherId),
        salary: data.salary ? Number(data.salary) : undefined,
      }));

    console.log('🔍 [LeaveApprovalModal] Final replacementsArray:', replacementsArray);
    console.log('🔍 [LeaveApprovalModal] cancelledSessions:', cancelledSessions);
    console.log('🔍 [LeaveApprovalModal] comment:', comment);

    onApprove({
      approvalType,
      replacements: replacementsArray,
      cancelledSessions,
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

  const remainingSessions = totalSessions - processedSessions;

  const formatCurrency = (amount: string) => {
    const num = Number(amount);
    if (isNaN(num) || num === 0) return '';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50"
          >
            {/* Decorative gradient header */}
            <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-indigo-50/80 via-white to-transparent dark:from-indigo-950/30 dark:via-slate-900/50 flex-shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl btn-gradient text-white shadow-lg shadow-indigo-500/25">
                    <ShieldCheck size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Phê duyệt đơn xin nghỉ
                    </h2>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Xử lý đơn nghỉ phép của giáo viên
                      </p>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <Clock size={12} />
                        Đang chờ xử lý
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <div className="space-y-6">
                {/* Teacher Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{teacherName}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar size={14} className="text-indigo-500" />
                          <span>Ngày nghỉ: <span className="font-medium text-slate-700 dark:text-slate-300">{leaveDate}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                          <FileText size={14} className="text-indigo-500" />
                          <span>Lý do: <span className="font-medium text-slate-700 dark:text-slate-300">{reason}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                      <Clock size={14} />
                      {totalSessions} buổi ảnh hưởng
                    </div>
                  </div>
                </motion.div>

                {/* Affected Sessions */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-500" />
                      Buổi học bị ảnh hưởng
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      Tổng: {totalSessions} buổi
                    </span>
                  </div>

                  {totalSessions === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Không có buổi học nào bị ảnh hưởng.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                            <tr>
                              <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ngày/Giờ</th>
                              <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Môn học</th>
                              <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giáo viên thay thế</th>
                              <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Lương (VNĐ)</th>
                              {approvalType === 'flexible' && (
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Hành động</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {affectedSessions.map((session, idx) => {
                              const sessionId = String(session.sessionId);
                              const isCancelled = cancelledSessions.includes(sessionId);
                              const replacementData = replacements[sessionId];
                              const isReplaced = replacementData?.teacherId && replacementData.teacherId !== '';
                              const isProcessed = isCancelled || isReplaced;

                              return (
                                <motion.tr
                                  key={session.sessionId ?? idx}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                                    isCancelled && approvalType === 'flexible' ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                                  }`}
                                >
                                  <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-2">
                                      <CalendarDays size={14} className="text-indigo-400 flex-shrink-0" />
                                      <span>{formatDateTime(session.sessionDate, session.startTime, session.endTime)}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {session.subjectName}
                                  </td>
                                  <td className="px-4 py-3.5">
                                    {approvalType === 'full_leave' ? (
                                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
                                        <XCircle size={14} />
                                        <span>Sẽ bị hủy</span>
                                      </div>
                                    ) : isCancelled ? (
                                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm">
                                        <XCircle size={14} />
                                        <span className="font-medium">Đã hủy</span>
                                      </div>
                                    ) : (
                                      <div className="relative">
                                        <select
                                          value={replacementData?.teacherId || ''}
                                          onChange={(e) => handleTeacherSelect(sessionId, e.target.value)}
                                          onFocus={() => loadAvailableTeachers(sessionId)}
                                          className={`
                                            w-full min-w-[180px] px-3 py-2 rounded-xl border-2
                                            bg-white dark:bg-slate-800/50
                                            text-slate-900 dark:text-white text-sm
                                            transition-all duration-200
                                            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                            hover:border-slate-300 dark:hover:border-slate-600
                                            cursor-pointer appearance-none pr-8
                                            ${isSubmitting || isCancelled
                                              ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500'
                                              : 'border-slate-200 dark:border-slate-700'
                                            }
                                          `}
                                          disabled={isSubmitting || isCancelled}
                                        >
                                          <option value="">-- Chọn giáo viên --</option>
                                          {loadingTeachers[sessionId] ? (
                                            <option disabled>Đang tải...</option>
                                          ) : (
                                            (availableTeachersMap[sessionId] || []).map((teacher) => (
                                              <option key={teacher.teacherId} value={String(teacher.teacherId)}>
                                                {teacher.teacherName} ({teacher.teacherEmail})
                                                {teacher.defaultSalary && ` - ${formatCurrency(String(teacher.defaultSalary))}đ`}
                                              </option>
                                            ))
                                          )}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3.5 text-right">
                                    {approvalType === 'full_leave' ? (
                                      <div className="text-slate-400 dark:text-slate-500 text-sm">-</div>
                                    ) : isCancelled ? (
                                      <div className="text-slate-400 dark:text-slate-500 text-sm">-</div>
                                    ) : (
                                      <div className="flex items-center justify-end gap-2">
                                        <Wallet size={14} className="text-slate-400 dark:text-slate-500" />
                                        <input
                                          type="number"
                                          value={replacementData?.salary || ''}
                                          onChange={(e) => {
                                            const currentTeacherId = replacementData?.teacherId || '';
                                            handleReplaceChange(sessionId, currentTeacherId, e.target.value);
                                          }}
                                          placeholder="Nhập lương..."
                                          className={`
                                            w-28 px-3 py-2 rounded-xl border-2 text-right
                                            bg-white dark:bg-slate-800/50
                                            text-slate-900 dark:text-white text-sm
                                            transition-all duration-200
                                            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                            ${isSubmitting || isCancelled || !replacementData?.teacherId
                                              ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500'
                                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }
                                          `}
                                          disabled={isSubmitting || isCancelled || !replacementData?.teacherId}
                                        />
                                      </div>
                                    )}
                                  </td>
                                  {approvalType === 'flexible' && (
                                    <td className="px-4 py-3.5 text-center">
                                      {!isSubmitting && (
                                        <button
                                          onClick={() => handleCancelSession(sessionId)}
                                          className={`
                                            p-2 rounded-xl transition-all duration-200
                                            ${isCancelled
                                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                              : 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                                            }
                                          `}
                                          title={isCancelled ? 'Hủy bỏ việc hủy buổi học' : 'Hủy buổi học này'}
                                        >
                                          {isCancelled ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                        </button>
                                      )}
                                      {isProcessed && !isSubmitting && (
                                        <span className={`text-xs font-medium ml-1 ${
                                          isCancelled ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'
                                        }`}>
                                          {isCancelled ? 'Đã hủy' : 'Đã chọn'}
                                        </span>
                                      )}
                                    </td>
                                  )}
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  
                </motion.section>

                {/* Approval Options */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-indigo-500" />
                    Phương án xử lý
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.label
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        approvalType === 'full_leave'
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="approval_type"
                        value="full_leave"
                        checked={approvalType === 'full_leave'}
                        onChange={() => setApprovalType('full_leave')}
                        className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-500"
                        disabled={isSubmitting}
                      />
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${
                          approvalType === 'full_leave'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                        }`}>
                          <XCircle size={18} />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">Hủy toàn bộ</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 pl-12">Hủy tất cả các buổi học trong thời gian xin nghỉ.</span>
                    </motion.label>

                    <motion.label
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        approvalType === 'flexible'
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="approval_type"
                        value="flexible"
                        checked={approvalType === 'flexible'}
                        onChange={() => setApprovalType('flexible')}
                        className="absolute top-4 right-4 text-indigo-600 focus:ring-indigo-500"
                        disabled={isSubmitting}
                      />
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${
                          approvalType === 'flexible'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                        }`}>
                          <Users size={18} />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">Xử lý linh hoạt</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 pl-12">Mỗi buổi học có thể chọn giáo viên thay thế hoặc hủy.</span>
                    </motion.label>
                  </div>

                  {/* Status Messages */}
                  <AnimatePresence>
                    {approvalType === 'flexible' && isFlexibleIncomplete && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5"
                      >
                        <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Còn <span className="font-bold">{remainingSessions}</span> buổi học chưa được xử lý. Vui lòng chọn thay thế hoặc hủy cho tất cả các buổi học.
                        </p>
                      </motion.div>
                    )}

                    {approvalType === 'flexible' && processedSessions === totalSessions && totalSessions > 0 && !isFlexibleIncomplete && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5"
                      >
                        <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                          Đã xử lý xong <span className="font-bold">{processedSessions}/{totalSessions}</span> buổi học. Bạn có thể tiến hành duyệt.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Comment */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 ml-1">
                      <FileText size={14} className="text-indigo-500" />
                      Ghi chú phê duyệt
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className={`
                        w-full px-4 py-3 rounded-xl border-2
                        bg-white dark:bg-slate-800/50
                        text-slate-900 dark:text-white text-sm
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                        border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600
                        resize-none
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      placeholder="Nhập ý kiến chỉ đạo hoặc lý do cụ thể..."
                      disabled={isSubmitting}
                    />
                  </div>
                </motion.section>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 flex items-center justify-end gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Từ chối
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (approvalType === 'flexible' && isFlexibleIncomplete)
                }
                className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Lưu xử lý
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};