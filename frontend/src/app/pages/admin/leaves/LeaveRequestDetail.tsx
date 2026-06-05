// src/app/pages/LeaveRequestDetail.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Mail, Quote, CheckCircle2, XCircle, CalendarDays,
  Clock3, BookOpen, Phone, School, Badge,
  Sparkles, UserPlus, History, Check, X, Calendar, AlertCircle,
  MapPin, Users, Award, MessageSquare, Clock, FileText, User, Loader2,
  RefreshCw
} from 'lucide-react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { teacherLeaveApi } from '../../../utils/api/teacherLeave.api';
import type { TeacherLeave, PreviewAffectedSessionResponse, AvailableReplacementTeacher } from '../../../utils/types/teacherLeave';
import { LeaveApprovalModal } from '../../../components/adminComponents/leaves/LeaveApprovalModal';
import { SessionsSummary } from '../../../components/adminComponents/leaves/SessionsSummary';
import { SessionCard } from '../../../components/adminComponents/leaves/SessionCard';

// Helper function để clean display name (copy từ LeaveDetailModal)
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

// Helper để format time
const formatTime = (timeStr?: string) => {
  if (!timeStr) return 'N/A';
  return timeStr.substring(0, 5);
};

export const LeaveRequestDetail = () => {
  console.log('🎨 [Render] LeaveRequestDetail re-render at:', new Date().toLocaleTimeString());
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


  const { setAlert } = useOutletContext<any>()

  const handleBack = () => {
    navigate('/admin/teacher/leave');
  };

  // Parse reason to separate teacher reason and admin note
  const parseReason = (reason: string) => {
    if (!reason) return { teacherReason: 'Không có lý do cụ thể', adminNote: null };

    const adminPattern = /\[(ADMIN|Admin|admin)\]\s*:\s*(.*)$/i;
    const match = reason.match(adminPattern);

    if (match) {
      const adminNote = match[2].trim();
      const teacherReason = reason.replace(adminPattern, '').trim();
      return {
        teacherReason: teacherReason || 'Không có lý do cụ thể',
        adminNote
      };
    }

    return { teacherReason: reason, adminNote: null };
  };

  // ✅ FIX: Merge sessions giống như LeaveDetailModal
  const fetchAndMergeSessions = useCallback(async (leaveData: TeacherLeave) => {
    if (!leaveData?.id) return [];

    setLoadingSessions(true);
    try {
      // Lấy dữ liệu trạng thái từ API
      const statusSessions = await teacherLeaveApi.getAffectedSessions(leaveData.id);
      console.log('Status sessions from API:', statusSessions);

      // Lấy dữ liệu chi tiết từ leave.affectedSessions
      const detailSessions = leaveData.affectedSessions || [];
      console.log('Detail sessions from leave:', detailSessions);

      // Tạo map để tra cứu nhanh trạng thái theo sessionId
      const statusMap = new Map();
      statusSessions.forEach((session: any) => {
        statusMap.set(session.sessionId, session);
      });

      // Merge dữ liệu: lấy chi tiết từ detailSessions, trạng thái từ statusMap
      const merged = detailSessions.map((detail: any, index: number) => {
        const statusData = statusMap.get(detail.sessionId);

        // ✅ Lấy affectedSessionId từ statusData (API trả về) hoặc từ detail
        const affectedSessionId = statusData?.id || detail.affectedSessionId || detail.id;

        console.log(`🟢 Session ${detail.sessionId}: affectedSessionId = ${affectedSessionId}`);

        return {
          ...detail,
          id: affectedSessionId,  // Đảm bảo có id
          affectedSessionId: affectedSessionId,  // ✅ Thêm field này
          status: statusData?.status || detail.status || 'PENDING',
          replacementTeacherName: statusData?.replacementTeacherName || detail.replacementTeacherName || null,
          replacementTeacherId: statusData?.replacementTeacherId || detail.replacementTeacherId || null,
          assignedAt: statusData?.assignedAt || detail.assignedAt,
          respondedAt: statusData?.respondedAt || detail.respondedAt,
          declineReason: statusData?.declineReason || detail.declineReason,
          sessionHistory: statusData?.sessionHistory || detail.sessionHistory || [],
          // Thêm các field cần thiết cho UI
          sessionId: detail.sessionId,
          sessionDate: detail.sessionDate,
          startTime: detail.startTime,
          endTime: detail.endTime,
          subjectName: cleanDisplayName(detail.subjectName),
          className: cleanDisplayName(detail.className || ''),
          roomName: cleanDisplayName(detail.roomName || ''),
        };
      });

      console.log('Merged sessions:', merged);
      setMergedSessions(merged);
      return merged;

    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      // Fallback: chỉ dùng dữ liệu từ leave.affectedSessions
      const fallbackSessions = (leaveData.affectedSessions || []).map((session: any, index: number) => ({
        ...session,
        id: session.id || index,
        affectedSessionId: session.id || index,  // ✅ Thêm fallback
        subjectName: cleanDisplayName(session.subjectName),
        className: cleanDisplayName(session.className || ''),
        roomName: cleanDisplayName(session.roomName || ''),
        status: session.status || 'PENDING',
      }));
      setMergedSessions(fallbackSessions);
      return fallbackSessions;
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const fetchLeaveDetail = useCallback(async () => {
    // ✅ Nếu đang fetch thì bỏ qua
    if (isFetchingRef.current) {
      console.log('⏭️ [fetchLeaveDetail] Bỏ qua - đang fetch dữ liệu');
      return;
    }
    if (!id) return;
    isFetchingRef.current = true;  // ✅ Đánh dấu đang fetch
    console.log('📞 [fetchLeaveDetail] Bắt đầu fetch...');
    try {
      setLoading(true);
      setError(null);

      const data = await teacherLeaveApi.getById(Number(id));
      console.log('📞 [fetchLeaveDetail] Nhận dữ liệu:', data?.id);
      setLeave(data);

      await fetchAndMergeSessions(data);
      console.log('📞 [fetchLeaveDetail] Hoàn tất');

    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err.response?.data?.message || 'Không thể tải chi tiết đơn nghỉ');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;  // ✅ Đánh dấu đã fetch xong
      console.log('📞 [fetchLeaveDetail] Kết thúc fetch');
    }
  }, [id, fetchAndMergeSessions]);

  useEffect(() => {
    console.log('🎬 [Mount] Component mounted, fetching initial data...');
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
    if (!leave) return 'bg-primary/5 text-primary';
    switch (leave.leaveType) {
      case 'SICK': return 'bg-blue-100 text-blue-700';
      case 'ANNUAL': return 'bg-emerald-100 text-emerald-700';
      case 'UNPAID': return 'bg-amber-100 text-amber-700';
      case 'PERSONAL': return 'bg-purple-100 text-purple-700';
      default: return 'bg-primary/5 text-primary';
    }
  };

  const isFetchingRef = useRef<boolean>(false);
  const handleManualRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    console.log('🔄 [Manual Refresh] Người dùng yêu cầu refresh...');

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
            className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
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
            className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
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
            className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            Chờ duyệt
          </motion.span>
        );
    }
  };
  const handleAssignTeacher = async (affectedSessionId: number, teacherId: number) => {
    console.log('🎯 [AssignTeacher] Bắt đầu:', { affectedSessionId, teacherId });
    setAssigningMap(prev => ({ ...prev, [affectedSessionId]: true }));

    try {
      await teacherLeaveApi.assignTeacherToSession(affectedSessionId, teacherId);
      console.log('✅ [AssignTeacher] Thành công');
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

  // Trong LeaveRequestDetail.tsx, thêm useEffect để theo dõi thay đổi status
  const prevStatusRef = useRef<Record<number, string>>({});

  useEffect(() => {
    // So sánh status cũ và mới của từng session
    mergedSessions.forEach(session => {
      const sessionId = session.affectedSessionId || session.id;
      const oldStatus = prevStatusRef.current[sessionId];
      const newStatus = session.status;

      if (oldStatus && oldStatus !== newStatus) {
        // Status thay đổi, hiển thị notification
        if (newStatus === 'ASSIGNED') {
          setAlert?.({
            type: 'info',
            message: `Đã gửi yêu cầu dạy thay cho buổi ${session.subjectName}. Đang chờ phản hồi.`
          });
        } else if (newStatus === 'DECLINED') {
          setAlert?.({
            type: 'warning',
            message: `Giáo viên ${session.replacementTeacherName} đã từ chối dạy thay buổi ${session.subjectName}. Vui lòng chọn giáo viên khác!`
          });
        } else if (newStatus === 'RESOLVED') {
          setAlert?.({
            type: 'success',
            message: `${session.replacementTeacherName} đã nhận dạy thay buổi ${session.subjectName}.`
          });
        }
      }

      // Cập nhật ref
      prevStatusRef.current[sessionId] = newStatus;
    });
  }, [mergedSessions, setAlert]);


  const handleGetAvailableTeachers = async (affectedSessionId: number) => {
    console.log('🔵 handleGetAvailableTeachers called with affectedSessionId:', affectedSessionId);
    console.log('🔵 Type of affectedSessionId:', typeof affectedSessionId);

    // ✅ Validation
    if (!affectedSessionId || isNaN(affectedSessionId) || affectedSessionId <= 0) {
      console.error('❌ Invalid affectedSessionId:', affectedSessionId);
      setAlert?.({ type: 'error', message: 'ID session không hợp lệ' });
      return;
    }

    setLoadingTeachersMap(prev => ({ ...prev, [affectedSessionId]: true }));
    try {
      const teachers = await teacherLeaveApi.getAvailableReplacementTeachers(affectedSessionId);
      console.log(`✅ Got ${teachers.length} teachers for session ${affectedSessionId}`);
      setAvailableTeachersMap(prev => ({ ...prev, [affectedSessionId]: teachers }));
    } catch (error: any) {
      console.error('Failed to fetch teachers:', error);

      // Xử lý lỗi 403 cụ thể
      if (error.response?.status === 403) {
        setAlert?.({ type: 'error', message: 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập với tài khoản Admin.' });
      } else {
        setAlert?.({ type: 'error', message: error.response?.data?.message || 'Không thể tải danh sách giáo viên' });
      }
    } finally {
      setLoadingTeachersMap(prev => ({ ...prev, [affectedSessionId]: false }));
    }
  };
  const handleCancelAssignment = async (affectedSessionId: number) => {
    console.log('🎯 [CancelAssignment] Bắt đầu:', affectedSessionId);
    if (!confirm('Bạn có chắc chắn muốn hủy phân công này? Giáo viên sẽ không nhận được yêu cầu dạy thay.')) {
      console.log('❌ [CancelAssignment] Người dùng hủy');
      return;
    }

    try {
      // TODO: Gọi API hủy phân công khi BE có
      // await teacherLeaveApi.cancelAssignment(affectedSessionId);
      console.log('✅ [CancelAssignment] Thành công (mock)');
      await fetchLeaveDetail();
      setAlert?.({ type: 'success', message: 'Đã hủy phân công' });
    } catch (error: any) {
      console.error('❌ [CancelAssignment] Lỗi:', error);
      setAlert?.({ type: 'error', message: error.message || 'Hủy phân công thất bại' });
    }
  };
  const { teacherReason, adminNote } = parseReason(leave?.reason || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-gray-500">Đang tải thông tin...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg font-semibold">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
          >
            Quay lại
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!leave) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <main className="max-w-[1440px] mx-auto px-12 py-8">
        {/* Header Section - Giữ nguyên */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
            <motion.span
              whileHover={{ x: -5 }}
              className="hover:text-indigo-600 cursor-pointer transition-colors"
              onClick={handleBack}
            >
              Quản lý lịch nghỉ
            </motion.span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-indigo-600 font-semibold">Chi tiết đơn</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Chi tiết đơn xin nghỉ
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                <span className="text-gray-400 text-sm">Mã đơn: #{leave.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* ✅ THÊM NÚT REFRESH */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isRefreshing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
                {isRefreshing ? 'Đang cập nhật...' : 'Làm mới'}
              </motion.button>
              {leave.status === 'PENDING' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                    className="px-6 py-3 rounded-xl border-2 border-red-200 bg-white text-red-600 font-semibold hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <X className="w-5 h-5" />
                    Từ chối
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setApprovalModalOpen(true)}
                    className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Phê duyệt
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Teacher Profile Card - Giữ nguyên */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-8 flex items-start gap-6 shadow-sm relative overflow-hidden group transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="w-24 h-24 rounded-2xl bg-indigo-100 overflow-hidden ring-4 ring-white shadow-md flex-shrink-0 flex items-center justify-center">
                {leave.teacherName ? (
                  <div className="w-full h-full bg-indigo-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-indigo-500" />
                  </div>
                ) : (
                  <User className="w-12 h-12 text-indigo-500" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{leave.teacherName}</h2>
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border border-indigo-100">
                    Giảng viên
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge className="w-4 h-4 text-indigo-400" />
                    <span>Mã GV: <span className="font-medium text-gray-700">{leave.teacherId}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span className="truncate">{leave.teacherEmail}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Leave Details Card - Giữ nguyên */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-8 shadow-sm space-y-8 transition-all duration-300"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                  Thông tin nghỉ phép
                </h3>
                <span className={`font-bold text-sm py-1.5 px-4 rounded-lg shadow-sm ${getLeaveTypeColor()}`}>
                  {getLeaveTypeLabel()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    Bắt đầu
                  </div>
                  <p className="text-lg font-bold text-gray-900">{leave.startDate}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    Kết thúc
                  </div>
                  <p className="text-lg font-bold text-gray-900">{leave.endDate}</p>
                </div>
                <div className="space-y-2 bg-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    Tổng ngày
                  </div>
                  <p className="text-3xl font-black text-indigo-600">{calculateTotalDays()} <span className="text-sm font-medium">ngày</span></p>
                </div>
              </div>

              {/* Reason Section - Giữ nguyên */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative bg-gray-50 rounded-xl p-6"
              >
                <Quote className="absolute -top-3 -left-3 text-indigo-200 w-8 h-8 bg-white rounded-full p-1" />
                <blockquote className="pl-6">
                  <p className="text-base italic font-medium text-gray-600 leading-relaxed">
                    "{teacherReason}"
                  </p>
                  {adminNote && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4 pt-3 border-t border-gray-200"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare className="w-3 h-3 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Ghi chú từ Admin</p>
                          <p className="text-sm text-gray-600 mt-0.5">{adminNote}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </blockquote>
              </motion.div>
            </motion.div>

            {/* ✅ FIX: Affected Classes Section - NEW VERSION with SessionCard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                  Buổi học bị ảnh hưởng
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({mergedSessions.length} buổi)
                  </span>
                </h3>
              </div>

              {/* ✅ Summary Stats */}
              <SessionsSummary sessions={mergedSessions} />

              {/* Loading state for sessions */}
              {loadingSessions && (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                </div>
              )}

              {/* Session Cards */}
              <div className="space-y-3">
                <AnimatePresence>
                  {mergedSessions.length > 0 ? (
                    mergedSessions.map((session, idx) => (
                      <SessionCard
                        key={session.affectedSessionId || session.id || idx}
                        session={session}
                        index={idx}
                        availableTeachers={availableTeachersMap[session.affectedSessionId || session.id] || []}
                        isLoadingTeachers={loadingTeachersMap[session.affectedSessionId || session.id] || false}
                        isAssigning={assigningMap[session.affectedSessionId || session.id] || false}  // ✅ Thêm
                        onAssignTeacher={handleAssignTeacher}
                        onCancelSession={handleCancelSession}
                        onResendRequest={undefined}  // Có thể implement sau
                        onCancelAssignment={handleCancelAssignment}  // ✅ Thêm nếu có
                        onGetAvailableTeachers={handleGetAvailableTeachers}
                        onRefresh={handleManualRefresh}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-200"
                    >
                      <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>Không có buổi học nào bị ảnh hưởng</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Giữ nguyên phần lớn, chỉ sửa AI Suggestions nếu cần */}
          <div className="space-y-8">
            {/* AI Suggestions - Giữ nguyên */}
            {leave.status === 'PENDING' && mergedSessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100 relative overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-lg text-gray-900">AI Gợi ý dạy thay</h3>
                </div>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed bg-gray-50 p-3 rounded-lg">
                  Phân tích dựa trên chuyên môn tương đồng và lịch trống của giảng viên trong khoa.
                </p>
                <div className="space-y-3">
                  {mergedSessions.slice(0, 2).map((session, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 rounded-xl hover:bg-indigo-50/50 transition-all cursor-pointer group border border-gray-100 hover:border-indigo-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                          {session.subjectName?.charAt(0) || 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{session.subjectName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Award className="w-3 h-3 text-indigo-500" />
                            <p className="text-[10px] text-indigo-600 font-semibold">Tiết {formatTime(session.startTime)} - {formatTime(session.endTime)}</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => fetchAvailableTeachers(session.affectedSessionId || session.id)}
                          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center shadow-sm"
                          disabled={suggestionsLoading}
                        >
                          {suggestionsLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timeline Section - Giữ nguyên */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gray-400 flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Lịch sử đơn nghỉ</h3>
              </div>
              <div className="space-y-6 relative">
                <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200"></div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative pl-9"
                >
                  <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white shadow-md flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Đã gửi đơn</p>
                    <p className="text-xs text-gray-500 mt-1">Giáo viên {leave.teacherName} tạo đơn nghỉ phép.</p>
                    <time className="text-[10px] text-gray-400 mt-2 block flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(leave.createdAt).toLocaleString('vi-VN')}
                    </time>
                  </div>
                </motion.div>

                {leave.status !== 'PENDING' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative pl-9"
                  >
                    <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center ${leave.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}>
                      {leave.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{leave.status === 'APPROVED' ? 'Đơn được duyệt' : 'Đơn bị từ chối'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {leave.status === 'APPROVED'
                          ? `Đơn xin nghỉ đã được phê duyệt bởi ${leave.approverName || 'quản trị viên'}.`
                          : 'Đơn xin nghỉ không được chấp thuận.'}
                      </p>
                      {leave.approvedAt && (
                        <time className="text-[10px] text-gray-400 mt-2 block flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(leave.approvedAt).toLocaleString('vi-VN')}
                        </time>
                      )}
                    </div>
                  </motion.div>
                )}

                {leave.status === 'PENDING' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative pl-9"
                  >
                    <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-amber-400 border-4 border-white shadow-md flex items-center justify-center animate-pulse">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Admin xem xét</p>
                      <p className="text-xs text-gray-500 mt-1">Đang chờ xác nhận từ bộ môn.</p>
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3 h-3 text-amber-600" />
                          <p className="text-[11px] text-amber-700 italic">"Đang chờ phê duyệt từ quản trị viên."</p>
                        </div>
                      </div>
                      <time className="text-[10px] text-gray-400 mt-2 block flex items-center gap-1">
                        <Clock3 className="w-2.5 h-2.5" />
                        Đang chờ xử lý
                      </time>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats Card - Giữ nguyên */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ y: -4 }}
              className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100"
            >
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award className="w-3.5 h-3.5" />
                Thông tin thêm
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ngày tạo đơn</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(leave.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-600">Cập nhật lần cuối</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(leave.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <LeaveApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        leaveId={leave?.id ?? 0}
        teacherName={leave?.teacherName || ''}
        leaveDate={leave ? `${leave.startDate} - ${leave.endDate}` : ''}
        reason={leave?.reason || ''}
        affectedSessions={mergedSessions}
        onApprove={async (options) => {
          setIsSubmitting(true);
          try {
            let replacementsArray = undefined;
            if (options.approvalType === 'flexible') {
              replacementsArray = Object.entries(options.replacements)
                .filter(([, teacherId]) => teacherId && teacherId !== '')
                .map(([sessionId, teacherId]) => ({
                  sessionId: Number(sessionId),
                  replacementTeacherId: Number(teacherId),
                }));
            }
            await teacherLeaveApi.approve(leave.id, {
              action: 'APPROVED',
              affectType: options.approvalType === 'full_leave' ? 'CANCEL' : 'REPLACE',
              comment: options.comment,
              replacements: replacementsArray,
            });
            setApprovalModalOpen(false);
            fetchLeaveDetail();
          } catch (err: any) {
            setError(err.message || 'Phê duyệt thất bại');
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