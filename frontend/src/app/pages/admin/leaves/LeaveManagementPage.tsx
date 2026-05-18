// src/app/pages/admin/leaves/LeaveManagementPage.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LeaveHeader } from '../../../components/adminComponents/leaves/LeaveHeader';
import { LeaveStats } from '../../../components/adminComponents/leaves/LeaveStats';
import { LeaveToolbar } from '../../../components/adminComponents/leaves/LeaveToolbar';
import { LeaveTable } from '../../../components/adminComponents/leaves/LeaveTable';
import { QuickActions } from '../../../components/adminComponents/leaves/QuickActions';
import { RecentActivities } from '../../../components/adminComponents/leaves/RecentActivities';
import { ProfileCard } from '../../../components/adminComponents/leaves/ProfileCard';
import { teacherLeaveApi } from '../../../utils/api/teacherLeave.api';
import type { TeacherLeave } from '../../../utils/types/teacherLeave'; 
import { useNavigate, useOutletContext } from 'react-router-dom';
import { LeaveApprovalModal } from '../../../components/adminComponents/leaves/LeaveApprovalModal';

interface LeaveStatItem {
  title: string;
  value: number;
  icon: string;
}

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
  const [affectedSessions, setAffectedSessions] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã hủy'
  };
  const reverseStatusMap: Record<string, string> = {
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
    'Nghỉ ốm': 'SICK',
    'Nghỉ phép năm': 'ANNUAL',
    'Nghỉ không lương': 'UNPAID',
    'Việc riêng': 'PERSONAL',
    'Khác': 'OTHER'
  };

  const fetchLeaves = useCallback(async (page: number = 1, pageSize: number = 10) => {
  setLoading(true);
  try {
    const params: any = { page, size: pageSize };
    // KHÔNG gửi teacherName (backend không hỗ trợ)
    if (selectedStatus && selectedStatus !== 'Tất cả') {
      params.status = reverseStatusMap[selectedStatus];
    }

    const { data, pagination: pag } = await teacherLeaveApi.getAll(params);
    console.log('✅ Dữ liệu API trả về:', data);

    let filteredData = data;
    if (searchQuery) {
      filteredData = filteredData.filter(l =>
        l.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedLeaveType && selectedLeaveType !== 'Tất cả') {
      const apiLeaveType = reverseLeaveTypeMap[selectedLeaveType];
      filteredData = filteredData.filter(l => l.leaveType === apiLeaveType);
    }

    setLeaves(filteredData);
    setPagination({
      currentPage: pag.currentPage,
      totalPages: pag.totalPages,
      totalItems: pag.totalItems,
      pageSize,
    });
  } catch (error: any) {
    console.error('Fetch error:', error);
    setAlert?.({ type: 'error', message: error.message || 'Không thể tải dữ liệu' });
    setLeaves([]); // Không fallback mock
  } finally {
    setLoading(false);
  }
}, [searchQuery, selectedStatus, selectedLeaveType, setAlert]);
  


useEffect(() => {
    fetchLeaves(1, pagination.pageSize);
  }, [searchQuery, selectedStatus, selectedLeaveType]);

  const handlePageChange = (page: number) => {
    fetchLeaves(page, pagination.pageSize);
  };

const handleApprove = async (id: number) => {
  try {
    setModalLoading(true);
    const leave = await teacherLeaveApi.getById(id);
    const sessions = leave.affectedSessions || [];
    console.log('Raw sessions:', sessions);

    setSelectedLeave(leave);
    // Map dữ liệu đúng trường
    const mappedSessions = sessions.map((s: any) => ({
      id: s.sessionId, // 👈 dùng sessionId hoặc id
      sessionId: s.sessionId, 
      sessionDate: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      subjectName: s.subjectName,
      subjectId: s.subjectId,
    }));
    console.log('Mapped sessions with id:', mappedSessions);
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

// Trong LeaveManagementPage.tsx, thay hàm handleApprovalSubmit như sau:

const handleApprovalSubmit = async (options: {
  approvalType: 'full_leave' | 'replace';
  replacements: Record<string, string>;   // key = sessionId (string), value = teacherId (string)
  comment: string;
}) => {
  if (!selectedLeave) return;
  setIsSubmitting(true);
  try {
    // Chuẩn bị mảng replacements theo đúng định nghĩa của BE
    let replacementsArray = undefined;
    if (options.approvalType === 'replace') {
      replacementsArray = Object.entries(options.replacements)
        .filter(([, teacherId]) => teacherId && teacherId !== '')
        .map(([sessionId, teacherId]) => ({
          sessionId: Number(sessionId),
          replacementTeacherId: Number(teacherId),
        }));
    }

    // Gọi API duyệt đơn, kèm theo replacements nếu có
    const approveRes = await teacherLeaveApi.approve(selectedLeave.id, {
      action: 'APPROVED',
      affectType: options.approvalType === 'full_leave' ? 'CANCEL' : 'REPLACE',
      comment: options.comment,
      replacements: replacementsArray,   // 👈 gửi kèm trong payload chính
    });

    if (approveRes.errCode !== 0) throw new Error(approveRes.message);

    setAlert?.({ type: 'success', message: options.approvalType === 'full_leave' 
      ? 'Đã duyệt đơn nghỉ và hủy các buổi học' 
      : 'Đã duyệt đơn và phân công giáo viên thay thế' });
    setApprovalModalOpen(false);
    fetchLeaves(pagination.currentPage, pagination.pageSize);
  } catch (error: any) {
    setAlert?.({ type: 'error', message: error.message || 'Có lỗi xảy ra' });
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

  const tableLeaves = leaves.map(leave => {
    const displayLeaveType = leaveTypeMap[leave.leaveType] || leave.leaveType;
    const displayStatus = statusMap[leave.status] || leave.status;
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    return {
      id: leave.id.toString(),
      teacherName: leave.teacherName,
      teacherCode: `GV${leave.teacherId}`,
      leaveType: displayLeaveType as any,
      startDate: leave.startDate,
      endDate: leave.endDate,
      days,
      status: displayStatus as any,
      avatar: undefined,
      department: leave.teacherEmail,
      teacherId: leave.teacherId.toString(),
      createdAt: leave.createdAt,
      description: leave.reason || ''
    };
  });

  console.log('📌 Số lượng leaves:', leaves.length);
  console.log('📌 tableLeaves:', tableLeaves);

  if (modalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải dữ liệu đơn nghỉ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        <main className="flex-1 overflow-y-auto px-8 py-10 space-y-8">
          <LeaveHeader onCreateRequest={handleCreateRequest} />
          <LeaveStats stats={leaveStatsData} />
          <LeaveToolbar
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedLeaveType={selectedLeaveType}
            onLeaveTypeChange={setSelectedLeaveType}
            onClearFilters={() => {
              setSearchQuery('');
              setSelectedStatus('Tất cả');
              setSelectedLeaveType('Tất cả');
            }}
            onViewModeChange={setCurrentViewMode}
            currentViewMode={currentViewMode}
            statusOptions={['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã hủy']}
            leaveTypeOptions={['Tất cả', 'Nghỉ phép năm', 'Nghỉ ốm', 'Việc riêng', 'Nghỉ không lương', 'Khác']}
          />
          {loading ? (
            <div className="text-center py-20">Đang tải dữ liệu...</div>
          ) : (
            <>
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
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1">{pagination.currentPage} / {pagination.totalPages}</span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <aside className="w-80 bg-white border-l border-gray-200 p-6 space-y-6 hidden lg:block overflow-y-auto">
          <QuickActions onQuickCreate={handleCreateRequest} onExport={handleExport} />
          <RecentActivities activities={[]} onViewAll={() => {}} />
          <ProfileCard userName="Admin Dashboard" userRole="Quản trị viên cấp cao" onLogout={() => {}} />
        </aside>
      </div>
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
    </div>
  );
}