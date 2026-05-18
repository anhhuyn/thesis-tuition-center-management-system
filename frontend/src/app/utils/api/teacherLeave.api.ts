// src/utils/api/teacherLeave.api.ts
import axios from '../axios'
import type {
  TeacherLeave,
  TeacherLeaveRequest,
  TeacherLeaveFilter,
  TeacherLeaveStats,
  ApiResponse,
  AffectedSession,
  PreviewAffectedSessionRequest,
  PreviewAffectedSessionResponse,
  AvailableReplacementTeacher,
  TeacherLeaveApproveRequest,
  PreviewReplacementPlanRequest,
  ReplacementSelection,
 WeeklyAbsentTeacherResponse } from '../types/teacherLeave';

export const teacherLeaveApi = {
   getAbsentTeachersThisWeek(): Promise<WeeklyAbsentTeacherResponse> {
    return axios.get('/teachers/absent-this-week')
  },
  // Lấy danh sách đơn nghỉ (phân trang, lọc)
  async getAll(filters?: TeacherLeaveFilter): Promise<{ data: TeacherLeave[]; pagination: any }> {
    const params: any = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.size) params.size = filters.size;
    if (filters?.status) params.status = filters.status;
    try {
      const response: any = await axios.get('/teacher-leaves', { params });
      if (response.errCode !== 0) throw new Error(response.message);
      return {
        data: response.data || [],
        pagination: response.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, pageSize: 10 }
      };
    } catch (error) {
      console.error('API getAll error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as any;
        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
        }
      }
      throw error;
    }
  },

  // Lấy chi tiết đơn (bao gồm affectedSessions preview)
  async getById(id: number): Promise<TeacherLeave> {
    const response: any = await axios.get(`/teacher-leaves/${id}`);
    if (response.errCode !== 0) throw new Error(response.message);
    return response.data;
  },

  // Tạo đơn nghỉ
  async create(data: TeacherLeaveRequest): Promise<ApiResponse> {
    const response: any = await axios.post('/teacher-leaves', data);
    return response;
  },

  // Duyệt / từ chối đơn
  async approve(id: number, payload: TeacherLeaveApproveRequest): Promise<ApiResponse> {
    const response: any = await axios.put(`/teacher-leaves/${id}/status`, payload);
    return response;
  },

  // Thống kê số đơn đang chờ
  async getPendingStats(): Promise<TeacherLeaveStats> {
    const response: any = await axios.get('/teacher-leaves/statistics/pending');
    return { pendingCount: response.data?.pendingCount ?? 0 };
  },

  // Lấy danh sách session bị ảnh hưởng (đã lưu, dành cho đơn APPROVED)
  async getAffectedSessions(leaveId: number): Promise<AffectedSession[]> {
    const response: any = await axios.get(`/teacher-leaves/${leaveId}/affected-sessions`);
    return response.data || [];
  },

  // Gán giáo viên thay thế cho một affected session
  async assignReplacement(affectedSessionId: number, replacementTeacherId: number, adminNote?: string): Promise<ApiResponse> {
    const response: any = await axios.put(`/teacher-leaves/affected-sessions/${affectedSessionId}/assign`, {
      replacementTeacherId,
      adminNote: adminNote || null, 
    });
    return response;
  },

   // Giáo viên thay thế phản hồi (ACCEPT / REJECT)
  async replacementResponse(affectedSessionId: number, responseAction: 'ACCEPTED' | 'REJECTED'): Promise<ApiResponse> {
    const response: any = await axios.put(`/teacher-leaves/affected-sessions/${affectedSessionId}/response`, {
      response: responseAction,
    });
    return response;
  },

  // Hủy đơn (giáo viên tự hủy)
  async cancel(id: number): Promise<ApiResponse> {
    const response: any = await axios.delete(`/teacher-leaves/${id}`);
    return response;
  },

  // Xem trước các session bị ảnh hưởng (khi giáo viên tạo đơn)
  async previewAffectedSessions(data: PreviewAffectedSessionRequest): Promise<PreviewAffectedSessionResponse[]> {
    const response: any = await axios.post('/teacher-leaves/preview-affected-sessions', data);
    if (response.errCode !== 0) throw new Error(response.message);
    return response.data || [];
  },

  // Lấy danh sách giáo viên thay thế (sau khi duyệt)
  async getAvailableReplacementTeachers(affectedSessionId: number): Promise<AvailableReplacementTeacher[]> {
    const response: any = await axios.get(`/teacher-leaves/affected-sessions/${affectedSessionId}/available-teachers`);
    if (response.errCode === 0) return response.data || [];
    throw new Error(response.message);
  },

  // Lấy danh sách giáo viên thay thế (trước khi duyệt)
  async previewAvailableTeachers(sessionId: number, leaveId: number): Promise<AvailableReplacementTeacher[]> {
    const response: any = await axios.get('/teacher-leaves/preview-available-teachers', {
      params: { sessionId, leaveId }
    });
    if (response.errCode === 0) return response.data || [];
    throw new Error(response.message);
  },

  // 👉 THÊM MỚI: Xem trước kế hoạch thay thế
  async previewReplacementPlan(data: PreviewReplacementPlanRequest): Promise<PreviewAffectedSessionResponse[]> {
    const response: any = await axios.post('/teacher-leaves/preview-replacement-plan', data);
    if (response.errCode === 0) return response.data || [];
    throw new Error(response.message);
  },

  // 👉 THÊM MỚI: Hủy affected session
  async cancelAffectedSession(affectedSessionId: number): Promise<ApiResponse> {
    const response: any = await axios.put(`/teacher-leaves/affected-sessions/${affectedSessionId}/cancel`);
    return response;
  },
};