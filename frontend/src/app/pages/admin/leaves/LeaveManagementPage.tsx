// src/app/pages/admin/leaves/LeaveManagementPage.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { LeaveHeader } from '../../../components/adminComponents/leaves/LeaveHeader';
import { LeaveStats } from '../../../components/adminComponents/leaves/LeaveStats';
import { LeaveToolbar } from '../../../components/adminComponents/leaves/LeaveToolbar';
import { LeaveTable } from '../../../components/adminComponents/leaves/LeaveTable';
import { ProfileCard } from '../../../components/adminComponents/leaves/ProfileCard';
import { teacherLeaveApi } from '../../../utils/api/teacherLeave.api';
import { teacherApi } from '../../../utils/api/teacher.api';
import type {
  TeacherLeave,
  TeacherLeaveApproveRequest,
  ReplacementWithSalary,
  PreviewAffectedSessionResponse
} from '../../../utils/types/teacherLeave';
import type { Teacher } from '../../../utils/types/teacher';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LeaveApprovalModal } from '../../../components/adminComponents/leaves/LeaveApprovalModal';

interface LeaveStatItem {
  title: string;
  value: number;
  icon: string;
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut", delay: 0.1 },
  },
};

const spinTransition = {
  repeat: Infinity,
  duration: 1,
  ease: "linear" as const,
};

// ✅ Định nghĩa kiểu cho cache
interface TeacherCacheInfo {
  name: string;
  avatar?: string;
  email?: string;
}

// ✅ Cache cho thông tin giáo viên với kiểu rõ ràng
const teacherCache = new Map<number, TeacherCacheInfo>();

export function LeaveManagementPage() {
  const { setAlert } = useOutletContext<any>();
  const [leaves, setLeaves] = useState<TeacherLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [selectedLeaveType, setSelectedLeaveType] = useState('Tất cả');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentViewMode, setCurrentViewMode] = useState<'list' | 'calendar'>('list');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, pageSize: 10 });
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<TeacherLeave | null>(null);
  const navigate = useNavigate();
  const [affectedSessions, setAffectedSessions] = useState<PreviewAffectedSessionResponse[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const isFetchingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);

  // Constants mapping
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã hủy'
  };

  const reverseStatusMap: Record<string, string> = {
    'Tất cả': '',
    'Chờ duyệt': 'PENDING',
    'Đã duyệt': 'APPROVED',
    'Từ chối': 'REJECTED',
    'Đã hủy': 'CANCELLED'
  };

  const leaveTypeMap: Record<string, string> = {
    SICK: 'Nghỉ ốm',
    ANNUAL: 'Nghỉ phép năm',
    UNPAID: 'Nghỉ không lương',
    PERSONAL: 'Việc riêng',
    OTHER: 'Khác'
  };

  const reverseLeaveTypeMap: Record<string, string> = {
    'Tất cả': '',
    'Nghỉ ốm': 'SICK',
    'Nghỉ phép năm': 'ANNUAL',
    'Nghỉ không lương': 'UNPAID',
    'Việc riêng': 'PERSONAL',
    'Khác': 'OTHER'
  };

  const getTeacherInfo = useCallback(async (userId: number): Promise<TeacherCacheInfo> => {
  const cached = teacherCache.get(userId);
  if (cached) {
    console.log(`📦 Cache hit for userId ${userId}:`, cached.avatar ? 'has avatar' : 'no avatar');
    return cached;
  }

  try {
    // ✅ Dùng teacherApi.getAll() giống TeacherManagementPage
    console.log(`🔍 Fetching teacher info for userId ${userId}...`);
    const response = await teacherApi.getAll(1, 1000);
    
    console.log(`📥 getAll response:`, {
      success: response.success,
      dataCount: response.data?.length || 0,
      sampleTeachers: response.data?.slice(0, 3).map((t: Teacher) => ({
        id: t.id,
        name: t.fullName,
        image: t.image,
        hasImage: !!t.image
      }))
    });
    
    if (response.success && response.data) {
      // Tìm teacher theo userId (id trong response là userId)
      const teacher = response.data.find((t: Teacher) => t.id === userId);
      
      if (teacher) {
        console.log(`✅ Found teacher for userId ${userId}:`, {
          id: teacher.id,
          name: teacher.fullName,
          image: teacher.image,
          hasImage: !!teacher.image
        });
        
        const info: TeacherCacheInfo = {
          name: teacher.fullName || `GV${userId}`,
          avatar: teacher.image || undefined,
          email: teacher.email
        };
        teacherCache.set(userId, info);
        return info;
      }
    }
    
    // Fallback nếu không tìm thấy
    console.log(`⚠️ No teacher found for userId ${userId}`);
    const fallback: TeacherCacheInfo = { 
      name: `GV${userId}`, 
      avatar: undefined,
      email: undefined 
    };
    teacherCache.set(userId, fallback);
    return fallback;
    
  } catch (error) {
    console.error(`❌ Failed to fetch teacher for userId ${userId}:`, error);
    const fallback: TeacherCacheInfo = { 
      name: `GV${userId}`, 
      avatar: undefined,
      email: undefined 
    };
    teacherCache.set(userId, fallback);
    return fallback;
  }
}, []);
  // fetchLeaves - Cập nhật để lấy avatar
  const fetchLeaves = useCallback(async (page: number = 1, pageSize: number = 10) => {
    if (isFetchingRef.current) {
      console.log('⏭️ Skipping duplicate fetch');
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      const params: any = { page, size: pageSize };

      if (selectedStatus && selectedStatus !== 'Tất cả') {
        params.status = reverseStatusMap[selectedStatus];
      }

      if (selectedLeaveType && selectedLeaveType !== 'Tất cả') {
        const apiLeaveType = reverseLeaveTypeMap[selectedLeaveType];
        if (apiLeaveType) {
          params.leaveType = apiLeaveType;
        }
      }

      if (dateRange.from) {
        params.startDate = dateRange.from;
      }
      if (dateRange.to) {
        params.endDate = dateRange.to;
      }

      console.log('📤 Fetching leaves with params:', params);

      const { data, pagination: pag } = await teacherLeaveApi.getAll(params);

      console.log('📥 Received from API:', {
        totalItems: pag.totalItems,
        currentPage: pag.currentPage,
        dataCount: data.length
      });

      // ✅ Enrich dữ liệu với avatar từ teacher API
      const enrichedData = await Promise.all(
        data.map(async (leave) => {
          const teacherInfo = await getTeacherInfo(leave.teacherId);
          return {
            ...leave,
            teacherAvatar: teacherInfo.avatar,
            teacherEmail: teacherInfo.email || leave.teacherEmail
          };
        })
      );

      console.log('✅ Enriched data:', enrichedData.map(l => ({
        id: l.id,
        teacherName: l.teacherName,
        teacherId: l.teacherId,
        hasAvatar: !!l.teacherAvatar,
        avatar: l.teacherAvatar
      })));

      let filteredData = [...enrichedData];

      if (searchQuery) {
        filteredData = filteredData.filter(l =>
          l.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setLeaves(filteredData);

      const finalTotalItems = searchQuery ? filteredData.length : pag.totalItems;

      setPagination({
        currentPage: pag.currentPage,
        totalPages: pag.totalPages,
        totalItems: finalTotalItems,
        pageSize,
      });

      initialFetchDoneRef.current = true;

    } catch (error: any) {
      console.error('❌ Fetch error:', error);
      setAlert?.({ type: 'error', message: error.message || 'Không thể tải dữ liệu' });
      setLeaves([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [searchQuery, selectedStatus, selectedLeaveType, dateRange, setAlert, getTeacherInfo]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('Tất cả');
    setSelectedLeaveType('Tất cả');
    setDateRange({ from: '', to: '' });
  };

  useEffect(() => {
    fetchLeaves(1, pagination.pageSize);
  }, [searchQuery, selectedStatus, selectedLeaveType, dateRange]);

  const handlePageChange = (page: number) => {
    fetchLeaves(page, pagination.pageSize);
  };

  const handleApprove = async (id: number) => {
    try {
      setModalLoading(true);
      const leave = await teacherLeaveApi.getById(id);
      const sessions = leave.affectedSessions || [];

      setSelectedLeave(leave);
      const mappedSessions: PreviewAffectedSessionResponse[] = sessions.map((s: any) => ({
        sessionId: s.sessionId,
        sessionDate: s.sessionDate,
        startTime: s.startTime,
        endTime: s.endTime,
        subjectName: s.subjectName,
        subjectId: s.subjectId,
        className: s.className,
        roomName: s.roomName,
        replacementTeacherId: s.replacementTeacherId,
        replacementTeacherName: s.replacementTeacherName,
      }));
      setAffectedSessions(mappedSessions);
      setApprovalModalOpen(true);
    } catch (error: any) {
      setAlert?.({ type: 'error', message: error.response?.data?.message || 'Không thể tải thông tin đơn nghỉ' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await teacherLeaveApi.approve(id, { action: 'REJECTED' });
      if (res.errCode === 0) {
        setAlert?.({ type: 'success', message: 'Đã từ chối đơn nghỉ' });
        fetchLeaves(pagination.currentPage, pagination.pageSize);
      } else {
        setAlert?.({ type: 'error', message: res.message || 'Từ chối thất bại' });
      }
    } catch (error: any) {
      setAlert?.({ type: 'error', message: error.response?.data?.message || 'Lỗi từ chối đơn' });
    }
  };

  const handleApprovalSubmit = async (options: {
    approvalType: 'full_leave' | 'flexible';
    replacements: ReplacementWithSalary[];
    cancelledSessions: string[];
    comment: string;
  }) => {
    if (!selectedLeave) return;

    console.log('🔍 [LeaveManagementPage] Received from modal:', {
      approvalType: options.approvalType,
      replacements: options.replacements,
      cancelledSessions: options.cancelledSessions,
      comment: options.comment
    });

    setIsSubmitting(true);

    try {
      const cancelErrors: string[] = [];

      if (options.cancelledSessions.length > 0) {
        console.log('Cancelling sessions:', options.cancelledSessions);

        for (const sessionId of options.cancelledSessions) {
          try {
            const numSessionId = Number(sessionId);
            if (isNaN(numSessionId) || numSessionId <= 0) {
              console.error(`Invalid sessionId: ${sessionId}`);
              continue;
            }

            const cancelResult = await teacherLeaveApi.cancelAffectedSession(numSessionId);
            console.log(`Session ${sessionId} cancelled successfully:`, cancelResult);
          } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            if (errorMsg.includes('không tìm thấy') || errorMsg.includes('not found')) {
              console.warn(`Session ${sessionId} already not exists, skipping...`);
            } else {
              console.error(`Failed to cancel session ${sessionId}:`, err);
              cancelErrors.push(`Buổi học ${sessionId}: ${errorMsg}`);
            }
          }
        }
      }

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

      if (options.approvalType === 'full_leave') {
        affectType = 'CANCEL';
      } else if (options.approvalType === 'flexible') {
        if (replacementsArray && replacementsArray.length > 0) {
          affectType = 'REPLACE';
        } else {
          affectType = 'CANCEL';
        }
      }

      const payload: any = {
        action: 'APPROVED',
        affectType: affectType,
        comment: options.comment,
      };

      if (replacementsArray && replacementsArray.length > 0) {
        payload.replacements = replacementsArray;
      }

      console.log('Approving leave with payload:', payload);

      const approveRes = await teacherLeaveApi.approve(selectedLeave.id, payload);

      if (approveRes.errCode !== 0) throw new Error(approveRes.message);

      const replacedCount = replacementsArray?.length || 0;
      const cancelledCount = options.cancelledSessions.length;

      let successMessage = '';
      if (options.approvalType === 'full_leave') {
        successMessage = 'Đã duyệt đơn nghỉ và hủy tất cả các buổi học';
      } else if (options.approvalType === 'flexible') {
        if (replacedCount > 0 && cancelledCount > 0) {
          successMessage = `Đã duyệt đơn: ${replacedCount} buổi có GV thay thế, ${cancelledCount} buổi bị hủy`;
        } else if (replacedCount > 0) {
          successMessage = `Đã duyệt đơn và phân công GV thay thế cho ${replacedCount} buổi học`;
        } else {
          successMessage = `Đã duyệt đơn và hủy ${cancelledCount} buổi học`;
        }
      }

      if (cancelErrors.length > 0) {
        successMessage += `\n(Cảnh báo: ${cancelErrors.length} buổi không thể hủy)`;
      }

      setAlert?.({ type: 'success', message: successMessage });
      setApprovalModalOpen(false);
      await fetchLeaves(pagination.currentPage, pagination.pageSize);

    } catch (error: any) {
      console.error('Approval error:', error);
      setAlert?.({ type: 'error', message: error.message || 'Có lỗi xảy ra khi duyệt đơn' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRequest = () => {
    setAlert?.({ type: 'info', message: 'Tính năng tạo đơn đang phát triển' });
  };

  const handleExport = () => {
    setAlert?.({ type: 'info', message: 'Tính năng xuất Excel đang phát triển' });
  };

  const handleViewDetail = async (id: number) => {
    navigate(`/admin/teacher/leave/${id}`);
  };

  // Tính stats
  const totalLeaves = leaves.length;
  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

  const leaveStatsData: LeaveStatItem[] = [
    { title: 'Tổng đơn', value: totalLeaves, icon: 'dashboard' },
    { title: 'Chờ duyệt', value: pendingCount, icon: 'pending_actions' },
    { title: 'Đã duyệt', value: approvedCount, icon: 'check_circle' },
    { title: 'Từ chối', value: rejectedCount, icon: 'cancel' }
  ];

  // ✅ Transform data với avatar từ enriched data
  const tableLeaves = leaves.map(leave => {
    return {
      id: leave.id.toString(),
      teacherName: leave.teacherName,
      teacherCode: `GV${leave.teacherId}`,
      leaveType: (leaveTypeMap[leave.leaveType] || leave.leaveType) as any,
      startDate: leave.startDate,
      endDate: leave.endDate,
      days: Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 3600 * 24)) + 1,
      status: (statusMap[leave.status] || leave.status) as any,
      avatar: (leave as any).teacherAvatar,
      department: leave.teacherEmail,
      teacherId: leave.teacherId.toString(),
      createdAt: leave.createdAt,
      description: leave.reason || ''
    };
  });

  // ✅ Log để debug
  console.log('📊 Final tableLeaves:', tableLeaves.map(l => ({
    id: l.id,
    teacherName: l.teacherName,
    hasAvatar: !!l.avatar,
    avatar: l.avatar
  })));

  if (modalLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-slate-50"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={spinTransition}
            className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-3 text-xs text-slate-400">Đang tải dữ liệu đơn nghỉ...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50 flex"
    >
      <motion.main
        variants={itemVariants}
        className="flex-1 flex flex-col min-h-screen px-6 py-6 space-y-5"
      >
        <motion.div variants={itemVariants}>
          <LeaveHeader onCreateRequest={handleCreateRequest} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <LeaveStats stats={leaveStatsData} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <LeaveToolbar
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedLeaveType={selectedLeaveType}
            onLeaveTypeChange={setSelectedLeaveType}
            onClearFilters={handleClearFilters}
            onViewModeChange={setCurrentViewMode}
            currentViewMode={currentViewMode}
            statusOptions={['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã hủy']}
            leaveTypeOptions={['Tất cả', 'Nghỉ phép năm', 'Nghỉ ốm', 'Việc riêng', 'Nghỉ không lương', 'Khác']}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          className="flex-1 flex flex-col min-h-0"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-200"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={spinTransition}
                    className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"
                  />
                  <p className="mt-3 text-xs text-slate-400">Đang tải dữ liệu...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col min-h-0"
              >
                {tableLeaves.length === 0 ? (
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-600">Không có dữ liệu đơn nghỉ</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-h-0">
                      <LeaveTable
                        leaves={tableLeaves}
                        selectedIds={selectedIds.map(String)}
                        onSelectAll={(checked) => {
                          if (checked) setSelectedIds(leaves.map(l => l.id));
                          else setSelectedIds([]);
                        }}
                        onSelectRow={(id, checked) => {
                          const numId = parseInt(id);
                          if (checked) setSelectedIds([...selectedIds, numId]);
                          else setSelectedIds(selectedIds.filter(i => i !== numId));
                        }}
                        onApprove={(id) => handleApprove(parseInt(id))}
                        onReject={(id) => handleReject(parseInt(id))}
                        onViewDetail={(id) => handleViewDetail(Number(id))}
                      />
                    </div>

                    {pagination.totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="flex justify-center gap-2 mt-4 pb-1"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                          className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          ← Trước
                        </motion.button>
                        <motion.span
                          key={pagination.currentPage}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="px-4 py-1.5 text-xs text-slate-600 font-medium"
                        >
                          {pagination.currentPage} / {pagination.totalPages}
                        </motion.span>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Sau →
                        </motion.button>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.main>

      <LeaveApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        leaveId={selectedLeave?.id ?? 0}
        teacherName={selectedLeave?.teacherName || ''}
        leaveDate={selectedLeave ? `${selectedLeave.startDate} - ${selectedLeave.endDate}` : ''}
        reason={selectedLeave?.reason || ''}
        affectedSessions={affectedSessions}
        onApprove={handleApprovalSubmit}
        onReject={() => {
          if (selectedLeave) {
            handleReject(selectedLeave.id);
          }
        }}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
}