// src/app/pages/LeaveRequestDetail.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Mail, Quote, CheckCircle2, XCircle, CalendarDays,
  Clock3, BookOpen, Phone, School, Badge,
  Sparkles, UserPlus, History, Check, X, Calendar, AlertCircle,
  MapPin, Users, Award, MessageSquare, Clock, FileText, User, Loader2,
  RefreshCw, ChevronLeft
} from 'lucide-react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { teacherLeaveApi } from '../../../utils/api/teacherLeave.api';
import { teacherApi } from '../../../utils/api/teacher.api'; // ✅ Import teacherApi
import type { TeacherLeave, PreviewAffectedSessionResponse, AvailableReplacementTeacher, ReplacementWithSalary } from '../../../utils/types/teacherLeave';
import type { Teacher } from '../../../utils/types/teacher'; // ✅ Import Teacher type
import { LeaveApprovalModal } from '../../../components/adminComponents/leaves/LeaveApprovalModal';
import { SessionsSummary } from '../../../components/adminComponents/leaves/SessionsSummary';
import { SessionCard } from '../../../components/adminComponents/leaves/SessionCard';

// Helper function (GIỮ NGUYÊN)
const cleanDisplayName = (name: string): string => {
  if (!name) return 'Chưa cập nhật';
  let cleaned = name;
  const patternsToRemove = [
    /com\.management\.student_center\.entity\.\w+(\$HibernateProxy)?/gi,
    /com\.management\.student_center\.dto\.\w+/gi,
    /\.entity\.\w+(\$HibernateProxy)?/gi,
    /\$HibernateProxy/gi,
    /HibernateProxy/gi,
  ];
  for (const pattern of patternsToRemove) {
    cleaned = cleaned.replace(pattern, '');
  }
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    cleaned = parts[parts.length - 1];
  }
  cleaned = cleaned.trim();
  if (!cleaned || cleaned.length === 0 || cleaned === '-') {
    return 'Chưa cập nhật';
  }
  return cleaned;
};

const formatTime = (timeStr?: string) => {
  if (!timeStr) return 'N/A';
  return timeStr.substring(0, 5);
};

// ✅ Helper lấy full image URL (copy từ TeacherDetailPage)
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE || import.meta.env.VITE_BACKEND_URL || '';
  const cleanBaseUrl = baseUrl.replace(/\/v1\/api$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${path}`;
};

export const LeaveRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leave, setLeave] = useState<TeacherLeave | null>(null);
  const [mergedSessions, setMergedSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState<Record<number, any[]>>({});
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [availableTeachersMap, setAvailableTeachersMap] = useState<Record<number, AvailableReplacementTeacher[]>>({});
  const [loadingTeachersMap, setLoadingTeachersMap] = useState<Record<number, boolean>>({});
  const [assigningMap, setAssigningMap] = useState<Record<number, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { setAlert } = useOutletContext<any>();
  
  // ✅ State cho avatar
  const [teacherAvatar, setTeacherAvatar] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleBack = () => {
    navigate('/admin/teacher/leave');
  };

  const parseReason = (reason: string) => {
    if (!reason) return { teacherReason: 'Không có lý do cụ thể', adminNote: null };
    const adminPattern = /\[(ADMIN|Admin|admin)\]\s*:\s*(.*)$/i;
    const match = reason.match(adminPattern);
    if (match) {
      const adminNote = match[2].trim();
      const teacherReason = reason.replace(adminPattern, '').trim();
      return { teacherReason: teacherReason || 'Không có lý do cụ thể', adminNote };
    }
    return { teacherReason: reason, adminNote: null };
  };

  // ✅ Hàm lấy ảnh giáo viên
  const fetchTeacherAvatar = useCallback(async (userId: number) => {
    try {
      const response = await teacherApi.getAll(1, 1000);
      if (response.success && response.data) {
        const teacher = response.data.find((t: Teacher) => t.id === userId);
        if (teacher && teacher.image) {
          setTeacherAvatar(teacher.image);
        } else {
          setTeacherAvatar(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch teacher avatar:', error);
      setTeacherAvatar(null);
    }
  }, []);

  const fetchAndMergeSessions = useCallback(async (leaveData: TeacherLeave) => {
    if (!leaveData?.id) return [];
    setLoadingSessions(true);
    try {
      const statusSessions = await teacherLeaveApi.getAffectedSessions(leaveData.id);
      const detailSessions = leaveData.affectedSessions || [];
      const statusMap = new Map();
      statusSessions.forEach((session: any) => {
        statusMap.set(session.sessionId, session);
      });
      const merged = detailSessions.map((detail: any, index: number) => {
        const statusData = statusMap.get(detail.sessionId);
        const affectedSessionId = statusData?.id || detail.affectedSessionId || detail.id;
        return {
          ...detail,
          id: affectedSessionId,
          affectedSessionId: affectedSessionId,
          status: statusData?.status || detail.status || 'PENDING',
          replacementTeacherName: statusData?.replacementTeacherName || detail.replacementTeacherName || null,
          replacementTeacherId: statusData?.replacementTeacherId || detail.replacementTeacherId || null,
          replacementSalary: statusData?.replacementSalary || detail.replacementSalary || null,
          assignedAt: statusData?.assignedAt || detail.assignedAt,
          respondedAt: statusData?.respondedAt || detail.respondedAt,
          declineReason: statusData?.declineReason || detail.declineReason,
          sessionHistory: statusData?.sessionHistory || detail.sessionHistory || [],
          sessionId: detail.sessionId,
          sessionDate: detail.sessionDate,
          startTime: detail.startTime,
          endTime: detail.endTime,
          subjectName: cleanDisplayName(detail.subjectName),
          className: cleanDisplayName(detail.className || ''),
          roomName: cleanDisplayName(detail.roomName || ''),
        };
      });
      setMergedSessions(merged);
      return merged;
    } catch (error) {
      console.error('❌ Failed to fetch sessions:', error);
      const fallbackSessions = (leaveData.affectedSessions || []).map((session: any, index: number) => ({
        ...session,
        id: session.id || index,
        affectedSessionId: session.id || index,
        subjectName: cleanDisplayName(session.subjectName),
        className: cleanDisplayName(session.className || ''),
        roomName: cleanDisplayName(session.roomName || ''),
        status: session.status || 'PENDING',
        replacementSalary: session.replacementSalary || null,
      }));
      setMergedSessions(fallbackSessions);
      return fallbackSessions;
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const isFetchingRef = useRef<boolean>(false);
  const fetchLeaveDetail = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (!id) return;
    isFetchingRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const data = await teacherLeaveApi.getById(Number(id));
      setLeave(data);
      
      // ✅ Lấy ảnh giáo viên
      if (data?.teacherId) {
        await fetchTeacherAvatar(data.teacherId);
      }
      
      await fetchAndMergeSessions(data);
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err.response?.data?.message || 'Không thể tải chi tiết đơn nghỉ');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [id, fetchAndMergeSessions, fetchTeacherAvatar]);

  useEffect(() => {
    fetchLeaveDetail();
  }, []);

  const fetchAvailableTeachers = async (affectedSessionId: number) => {
    if (!leave || leave.status !== 'PENDING') return;
    try {
      setSuggestionsLoading(true);
      const teachers = await teacherLeaveApi.previewAvailableTeachers(affectedSessionId, leave.id);
      setAvailableTeachers(prev => ({ ...prev, [affectedSessionId]: teachers }));
    } catch (err) {
      console.error('Failed to fetch available teachers:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const calculateTotalDays = () => {
    if (!leave) return 0;
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getLeaveTypeLabel = () => {
    if (!leave) return '';
    switch (leave.leaveType) {
      case 'SICK': return 'Nghỉ ốm';
      case 'ANNUAL': return 'Nghỉ phép năm';
      case 'UNPAID': return 'Nghỉ không lương';
      case 'PERSONAL': return 'Việc riêng';
      default: return 'Khác';
    }
  };

  const getLeaveTypeColor = () => {
    if (!leave) return 'bg-purple-50 text-purple-600';
    switch (leave.leaveType) {
      case 'SICK': return 'bg-blue-50 text-blue-600';
      case 'ANNUAL': return 'bg-emerald-50 text-emerald-600';
      case 'UNPAID': return 'bg-amber-50 text-amber-600';
      case 'PERSONAL': return 'bg-purple-50 text-purple-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchLeaveDetail();
      setAlert?.({ type: 'success', message: 'Đã cập nhật trạng thái mới nhất' });
    } catch (error) {
      console.error('❌ [Manual Refresh] Lỗi:', error);
      setAlert?.({ type: 'error', message: 'Không thể cập nhật dữ liệu' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = () => {
    if (!leave) return null;
    switch (leave.status) {
      case 'APPROVED':
        return (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-emerald-200 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3 h-3" />
            Đã duyệt
          </motion.span>
        );
      case 'REJECTED':
        return (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-red-200 flex items-center gap-1.5"
          >
            <XCircle className="w-3 h-3" />
            Từ chối
          </motion.span>
        );
      default:
        return (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-amber-200 flex items-center gap-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ duyệt
          </motion.span>
        );
    }
  };

  const handleAssignTeacher = async (affectedSessionId: number, teacherId: number, salary?: number) => {
    setAssigningMap(prev => ({ ...prev, [affectedSessionId]: true }));
    try {
      await teacherLeaveApi.assignTeacherToSession(affectedSessionId, teacherId, salary);
      setAlert?.({ type: 'success', message: 'Đã phân công giáo viên dạy thay' });
      await fetchLeaveDetail();
    } catch (error: any) {
      console.error('❌ [AssignTeacher] Lỗi:', error);
      setAlert?.({ type: 'error', message: error.response?.data?.message || 'Phân công thất bại' });
    } finally {
      setAssigningMap(prev => ({ ...prev, [affectedSessionId]: false }));
    }
  };

  const handleCancelSession = async (affectedSessionId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy buổi học này?')) return;
    try {
      await teacherLeaveApi.cancelAffectedSession(affectedSessionId);
      await fetchLeaveDetail();
      setAlert?.({ type: 'success', message: 'Đã hủy buổi học' });
    } catch (error: any) {
      setAlert?.({ type: 'error', message: error.message || 'Hủy thất bại' });
    }
  };

  const prevStatusRef = useRef<Record<number, string>>({});
  useEffect(() => {
    mergedSessions.forEach(session => {
      const sessionId = session.affectedSessionId || session.id;
      const oldStatus = prevStatusRef.current[sessionId];
      const newStatus = session.status;
      if (oldStatus && oldStatus !== newStatus) {
        if (newStatus === 'ASSIGNED') {
          setAlert?.({
            type: 'info',
            message: `Đã gửi yêu cầu dạy thay cho buổi ${session.subjectName}. Đang chờ phản hồi.`
          });
        } else if (newStatus === 'DECLINED') {
          setAlert?.({
            type: 'warning',
            message: `Giáo viên ${session.replacementTeacherName} đã từ chối dạy thay buổi ${session.subjectName}.`
          });
        } else if (newStatus === 'RESOLVED') {
          setAlert?.({
            type: 'success',
            message: `${session.replacementTeacherName} đã nhận dạy thay buổi ${session.subjectName}.`
          });
        }
      }
      prevStatusRef.current[sessionId] = newStatus;
    });
  }, [mergedSessions, setAlert]);

  const handleGetAvailableTeachers = async (affectedSessionId: number) => {
    if (!affectedSessionId || isNaN(affectedSessionId) || affectedSessionId <= 0) {
      setAlert?.({ type: 'error', message: 'ID session không hợp lệ' });
      return;
    }
    setLoadingTeachersMap(prev => ({ ...prev, [affectedSessionId]: true }));
    try {
      const teachers = await teacherLeaveApi.getAvailableReplacementTeachers(affectedSessionId);
      setAvailableTeachersMap(prev => ({ ...prev, [affectedSessionId]: teachers }));
    } catch (error: any) {
      if (error.response?.status === 403) {
        setAlert?.({ type: 'error', message: 'Bạn không có quyền thực hiện thao tác này.' });
      } else {
        setAlert?.({ type: 'error', message: error.response?.data?.message || 'Không thể tải danh sách giáo viên' });
      }
    } finally {
      setLoadingTeachersMap(prev => ({ ...prev, [affectedSessionId]: false }));
    }
  };

  const handleCancelAssignment = async (affectedSessionId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy phân công này?')) return;
    try {
      const api: any = teacherLeaveApi;
      if (typeof api.cancelAssignment === 'function') {
        await api.cancelAssignment(affectedSessionId);
      } else {
        await teacherLeaveApi.cancelAffectedSession(affectedSessionId);
      }
      await fetchLeaveDetail();
      setAlert?.({ type: 'success', message: 'Đã hủy phân công' });
    } catch (error: any) {
      setAlert?.({ type: 'error', message: error.message || 'Hủy phân công thất bại' });
    }
  };

  const { teacherReason, adminNote } = parseReason(leave?.reason || '');

  // ✅ Lấy URL ảnh
  const avatarUrl = teacherAvatar ? getFullImageUrl(teacherAvatar) : null;
  const hasAvatar = teacherAvatar && !imageError && avatarUrl;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-200 border-t-purple-600 mx-auto" />
          <p className="mt-3 text-xs text-slate-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!leave) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb & Header */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 hover:text-purple-600 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Quản lý lịch nghỉ
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-purple-600 font-medium">Chi tiết đơn</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-800">Chi tiết đơn xin nghỉ</h1>
                {getStatusBadge()}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                {isRefreshing ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                {isRefreshing ? 'Đang cập nhật...' : 'Làm mới'}
              </button>
              
              {leave.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (window.confirm('Bạn có chắc chắn muốn từ chối đơn này?')) {
                        try {
                          await teacherLeaveApi.approve(leave.id, { action: 'REJECTED' });
                          fetchLeaveDetail();
                        } catch (err: any) {
                          setError(err.message || 'Từ chối thất bại');
                        }
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-red-200 bg-white text-red-500 text-xs font-medium hover:bg-red-50 transition-all"
                  >
                    <X className="w-3.5 h-3.5 inline mr-1" />
                    Từ chối
                  </button>
                  <button
                    onClick={() => setApprovalModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg btn-gradient from-purple-500 to-purple-600 text-white text-xs font-medium shadow-sm shadow-purple-200 hover:shadow-md transition-all"
                  >
                    <Check className="w-3.5 h-3.5 inline mr-1" />
                    Phê duyệt
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-5">
            {/* Teacher Profile Card - ✅ Có ảnh */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-5 flex items-start gap-5 shadow-sm border border-slate-200"
            >
              <div className="relative group">
                
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-base font-semibold text-slate-800">{leave.teacherName}</h2>
                  <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    Giáo viên
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500">
                 
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-purple-400" />
                    <span className="truncate max-w-[180px]">{leave.teacherEmail}</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Leave Details Card - Giữ nguyên */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-purple-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-slate-700">Thông tin nghỉ phép</h3>
                </div>
                <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${getLeaveTypeColor()}`}>
                  {getLeaveTypeLabel()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    <Calendar className="w-3 h-3" />
                    Bắt đầu
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{leave.startDate}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    <Calendar className="w-3 h-3" />
                    Kết thúc
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{leave.endDate}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-purple-500 uppercase tracking-wide">
                    <Clock className="w-3 h-3" />
                    Tổng ngày
                  </div>
                  <p className="text-xl font-bold text-purple-600">{calculateTotalDays()} <span className="text-xs font-medium">ngày</span></p>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-slate-50 rounded-lg p-4">
                <Quote className="w-4 h-4 text-purple-300 mb-1" />
                <p className="text-sm text-slate-600 italic leading-relaxed">"{teacherReason}"</p>
                {adminNote && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <div className="flex items-start gap-1.5">
                      <MessageSquare className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wide">Ghi chú Admin</p>
                        <p className="text-xs text-slate-500 mt-0.5">{adminNote}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Affected Sessions - Giữ nguyên */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-amber-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-slate-700">Buổi học bị ảnh hưởng</h3>
                  <span className="text-[10px] text-slate-400">({mergedSessions.length})</span>
                </div>
              </div>

              <SessionsSummary sessions={mergedSessions} />

              {loadingSessions && (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-purple-500" />
                </div>
              )}

              <div className="space-y-2.5">
                <AnimatePresence>
                  {mergedSessions.length > 0 ? (
                    mergedSessions.map((session, idx) => (
                      <SessionCard
                        key={session.affectedSessionId || session.id || idx}
                        session={session}
                        index={idx}
                        availableTeachers={availableTeachersMap[session.affectedSessionId || session.id] || []}
                        isLoadingTeachers={loadingTeachersMap[session.affectedSessionId || session.id] || false}
                        isAssigning={assigningMap[session.affectedSessionId || session.id] || false}
                        onAssignTeacher={handleAssignTeacher}
                        onCancelSession={handleCancelSession}
                        onResendRequest={undefined}
                        onCancelAssignment={handleCancelAssignment}
                        onGetAvailableTeachers={handleGetAvailableTeachers}
                        onRefresh={handleManualRefresh}
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
                      <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Không có buổi học nào bị ảnh hưởng</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Giữ nguyên */}
          <div className="space-y-5">
            {/* AI Suggestions */}
            {leave.status === 'PENDING' && mergedSessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-purple-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-400 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">AI Gợi ý dạy thay</h3>
                </div>
                <p className="text-[10px] text-slate-400 mb-3 bg-slate-50 p-2 rounded-lg">
                  Phân tích dựa trên chuyên môn và lịch trống
                </p>
                <div className="space-y-2">
                  {mergedSessions.slice(0, 2).map((session, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-purple-50 transition-all border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs">
                          {session.subjectName?.charAt(0) || 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{session.subjectName}</p>
                          <p className="text-[10px] text-purple-500">Tiết {formatTime(session.startTime)}</p>
                        </div>
                        <button
                          onClick={() => fetchAvailableTeachers(session.affectedSessionId || session.id)}
                          className="h-7 w-7 rounded-lg bg-slate-200 text-slate-500 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center"
                          disabled={suggestionsLoading}
                        >
                          {suggestionsLoading ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timeline - Giữ nguyên */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-slate-200 flex items-center justify-center">
                  <History className="h-3.5 w-3.5 text-slate-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Lịch sử</h3>
              </div>
              <div className="space-y-4 relative">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />

                <div className="relative pl-7">
                  <div className="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-purple-500 border-2 border-white shadow-sm flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">Đã gửi đơn</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Giáo viên tạo đơn</p>
                    <time className="text-[9px] text-slate-400 mt-1 block">
                      {new Date(leave.createdAt).toLocaleString('vi-VN')}
                    </time>
                  </div>
                </div>

                {leave.status !== 'PENDING' && (
                  <div className="relative pl-7">
                    <div className={`absolute left-0 top-0.5 h-5 w-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${leave.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {leave.status === 'APPROVED' ? (
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      ) : (
                        <X className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{leave.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {leave.status === 'APPROVED' ? 'Đã phê duyệt' : 'Không được chấp thuận'}
                      </p>
                      {leave.approvedAt && (
                        <time className="text-[9px] text-slate-400 mt-1 block">
                          {new Date(leave.approvedAt).toLocaleString('vi-VN')}
                        </time>
                      )}
                    </div>
                  </div>
                )}

                {leave.status === 'PENDING' && (
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-amber-400 border-2 border-white shadow-sm flex items-center justify-center animate-pulse">
                      <Clock className="h-2.5 w-2.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">Đang xem xét</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Chờ phê duyệt từ Admin</p>
                      <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-[10px] text-amber-600 italic">"Đang chờ phê duyệt"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats - Giữ nguyên */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-purple-50 rounded-xl p-4 border border-purple-100"
            >
              <h4 className="text-[10px] font-medium text-purple-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Award className="w-3 h-3" />
                Thông tin thêm
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày tạo</span>
                  <span className="font-medium text-slate-700">
                    {new Date(leave.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-purple-100">
                  <span className="text-slate-500">Cập nhật</span>
                  <span className="font-medium text-slate-700">
                    {new Date(leave.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Approval Modal - GIỮ NGUYÊN */}
      <LeaveApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        leaveId={leave?.id ?? 0}
        teacherName={leave?.teacherName || ''}
        leaveDate={leave ? `${leave.startDate} - ${leave.endDate}` : ''}
        reason={leave?.reason || ''}
        affectedSessions={mergedSessions}
        onApprove={async (options: {
          approvalType: 'full_leave' | 'flexible';
          replacements: ReplacementWithSalary[];
          cancelledSessions: string[];
          comment: string;
        }) => {
          setIsSubmitting(true);
          try {
            let replacementsArray: ReplacementWithSalary[] | undefined = undefined;
            if (options.approvalType === 'flexible' && options.replacements.length > 0) {
              replacementsArray = options.replacements
                .filter(r => r.replacementTeacherId && r.replacementTeacherId > 0)
                .map(r => ({
                  sessionId: r.sessionId,
                  replacementTeacherId: r.replacementTeacherId,
                  salary: r.salary || undefined,
                }));
            }
            let affectType: 'CANCEL' | 'REPLACE' = 'CANCEL';
            if (options.approvalType === 'flexible' && replacementsArray && replacementsArray.length > 0) {
              affectType = 'REPLACE';
            }
            await teacherLeaveApi.approve(leave.id, {
              action: 'APPROVED',
              affectType: affectType,
              comment: options.comment,
              replacements: replacementsArray,
            });
            setApprovalModalOpen(false);
            fetchLeaveDetail();
            setAlert?.({ type: 'success', message: 'Đã phê duyệt đơn nghỉ' });
          } catch (err: any) {
            setAlert?.({ type: 'error', message: err.message || 'Phê duyệt thất bại' });
          } finally {
            setIsSubmitting(false);
          }
        }}
        onReject={async () => {
          setApprovalModalOpen(false);
          if (window.confirm('Bạn có chắc chắn muốn từ chối đơn này?')) {
            try {
              await teacherLeaveApi.approve(leave.id, { action: 'REJECTED' });
              fetchLeaveDetail();
            } catch (err: any) {
              setError(err.message || 'Từ chối thất bại');
            }
          }
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};