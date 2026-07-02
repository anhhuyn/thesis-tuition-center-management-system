// src/hooks/teacher/useTeacherLeave.ts
import { useState, useEffect, useCallback } from 'react';
import { teacherLeaveApi } from '../../utils/api/teacherLeave.api';
import type { 
  TeacherLeave as ApiTeacherLeave, 
  PreviewAffectedSessionResponse 
} from '../../utils/types/teacherLeave';

export const useTeacherLeave = () => {
  const [leaves, setLeaves] = useState<ApiTeacherLeave[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [previewSessions, setPreviewSessions] = useState<PreviewAffectedSessionResponse[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Fetch danh sách đơn nghỉ
  const fetchLeaves = useCallback(async (page = 1, status?: string) => {
    setLoading(true);
    try {
      const response = await teacherLeaveApi.getAll({ page, size: 10, status: status as any  });
      setLeaves(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Fetch leaves error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch số đơn đang chờ
  const fetchPendingStats = useCallback(async () => {
    try {
      const stats = await teacherLeaveApi.getPendingStats();
      setPendingCount(stats.pendingCount);
    } catch (error) {
      console.error('Fetch pending stats error:', error);
    }
  }, []);

  // Tạo đơn mới
  const createLeave = useCallback(async (data: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
    leaveType: string;
  }) => {
    const response = await teacherLeaveApi.create(data);
    if (response.errCode === 0) {
      await fetchLeaves(1);
      await fetchPendingStats();
      return true;
    }
    throw new Error(response.message);
  }, [fetchLeaves, fetchPendingStats]);

  // Hủy đơn
  const cancelLeave = useCallback(async (id: number) => {
    const response = await teacherLeaveApi.cancel(id);
    if (response.errCode === 0) {
      await fetchLeaves(pagination.currentPage);
      await fetchPendingStats();
      return true;
    }
    throw new Error(response.message);
  }, [fetchLeaves, fetchPendingStats, pagination.currentPage]);

  // Xem trước các buổi học bị ảnh hưởng
  const previewAffectedSessions = useCallback(async (data: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  }) => {
    setPreviewLoading(true);
    try {
      const sessions = await teacherLeaveApi.previewAffectedSessions(data);
      setPreviewSessions(sessions);
      return sessions;
    } catch (error) {
      console.error('Preview sessions error:', error);
      throw error;
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  // Lấy chi tiết đơn
  const getLeaveDetail = useCallback(async (id: number): Promise<ApiTeacherLeave> => {
    return await teacherLeaveApi.getById(id);
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeaves(1);
    fetchPendingStats();
  }, []);

  return {
    leaves,
    loading,
    pagination,
    pendingCount,
    previewSessions,
    previewLoading,
    fetchLeaves,
    createLeave,
    cancelLeave,
    previewAffectedSessions,
    getLeaveDetail,
  };
};