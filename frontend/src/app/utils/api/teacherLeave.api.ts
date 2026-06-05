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
  WeeklyAbsentTeacherResponse,
  ReplacementSession
} from '../types/teacherLeave';

const logRequest = (method: string, url: string, params?: any, data?: any) => {
  console.log(`📤 ${method} ${url}`, { params, data });
};

const logResponse = (method: string, url: string, response: any) => {
  console.log(`📥 ${method} ${url} - Status: ${response.errCode}, Data count: ${response.data?.length || 0}`);
};

export const teacherLeaveApi = {
  getAbsentTeachersThisWeek(): Promise<WeeklyAbsentTeacherResponse> {
    logRequest('GET', '/teachers/absent-this-week');
    return axios.get('/teachers/absent-this-week')
  },
  // Lấy danh sách đơn nghỉ (phân trang, lọc)
  async getAll(filters?: TeacherLeaveFilter): Promise<{ data: TeacherLeave[]; pagination: any }> {
    const params: any = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.size) params.size = filters.size;
    if (filters?.status) params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    logRequest('GET', '/teacher-leaves', params);

    try {
      const response: any = await axios.get('/teacher-leaves', { params });
      logResponse('GET', '/teacher-leaves', response);

      if (response.errCode !== 0) {
        throw new Error(response.message);
      }

      return {
        data: response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          pageSize: 10
        }
      };
    } catch (error) {
      console.error('❌ API getAll error:', error);
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
    logRequest('GET', `/teacher-leaves/${id}`);
    const response: any = await axios.get(`/teacher-leaves/${id}`);
    logResponse('GET', `/teacher-leaves/${id}`, response);
    if (response.errCode !== 0) throw new Error(response.message);
    return response.data;
  },

  // Tạo đơn nghỉ
  async create(data: TeacherLeaveRequest): Promise<ApiResponse> {
    logRequest('POST', '/teacher-leaves', undefined, data);
    const response: any = await axios.post('/teacher-leaves', data);
    logResponse('POST', '/teacher-leaves', response);
    return response;
  },

  // Duyệt / từ chối đơn
  async approve(id: number, payload: TeacherLeaveApproveRequest): Promise<ApiResponse> {
    logRequest('PUT', `/teacher-leaves/${id}/status`, undefined, payload);
    const response: any = await axios.put(`/teacher-leaves/${id}/status`, payload);
    logResponse('PUT', `/teacher-leaves/${id}/status`, response);
    return response;
  },

  // Thống kê số đơn đang chờ
  async getPendingStats(): Promise<TeacherLeaveStats> {
    logRequest('GET', '/teacher-leaves/statistics/pending');
    const response: any = await axios.get('/teacher-leaves/statistics/pending');
    logResponse('GET', '/teacher-leaves/statistics/pending', response);
    return { pendingCount: response.data?.pendingCount ?? 0 };
  },

  // Lấy danh sách session bị ảnh hưởng (đã lưu, dành cho đơn APPROVED)
  async getAffectedSessions(leaveId: number): Promise<AffectedSession[]> {
    logRequest('GET', `/teacher-leaves/${leaveId}/affected-sessions`);
    const response: any = await axios.get(`/teacher-leaves/${leaveId}/affected-sessions`);
    logResponse('GET', `/teacher-leaves/${leaveId}/affected-sessions`, response);
    return response.data || [];
  },

  // Gán giáo viên thay thế cho một affected session
  async assignReplacement(affectedSessionId: number, replacementTeacherId: number, adminNote?: string): Promise<ApiResponse> {
    logRequest('PUT', `/teacher-leaves/affected-sessions/${affectedSessionId}/assign`, undefined, { replacementTeacherId, adminNote: adminNote || null });
    const response: any = await axios.put(`/teacher-leaves/affected-sessions/${affectedSessionId}/assign`, {
      replacementTeacherId,
      adminNote: adminNote || null,
    });
    logResponse('PUT', `/teacher-leaves/affected-sessions/${affectedSessionId}/assign`, response);
    return response;
  },

  async getReplacementSessions(): Promise<ReplacementSession[]> {
    logRequest('GET', '/teacher-leaves/replacement-sessions');
    const response: any = await axios.get(
      '/teacher-leaves/replacement-sessions'
    );
    logResponse('GET', '/teacher-leaves/replacement-sessions', response);
    if (response.errCode !== 0) {
      throw new Error(response.message);
    }
    return response.data || [];
  },

  // Giáo viên thay thế phản hồi (ACCEPT / REJECT)
  async replacementResponse(affectedSessionId: number, responseAction: 'ACCEPTED' | 'REJECTED'): Promise<ApiResponse> {
    logRequest('PUT', `/teacher-leaves/affected-sessions/${affectedSessionId}/response`, undefined, { response: responseAction });
    const response: any = await axios.put(`/teacher-leaves/affected-sessions/${affectedSessionId}/response`, {
      response: responseAction,
    });
    logResponse('PUT', `/teacher-leaves/affected-sessions/${affectedSessionId}/response`, response);
    return response;
  },

  // Hủy đơn (giáo viên tự hủy)
  async cancel(id: number): Promise<ApiResponse> {
    const response: any = await axios.delete(`/teacher-leaves/${id}`);
    logResponse('DELETE', `/teacher-leaves/${id}`, response);
    return response;
  },

  // Xem trước các session bị ảnh hưởng (khi giáo viên tạo đơn)
  async previewAffectedSessions(data: PreviewAffectedSessionRequest): Promise<PreviewAffectedSessionResponse[]> {
    logRequest('POST', '/teacher-leaves/preview-affected-sessions', undefined, data);
    const response: any = await axios.post('/teacher-leaves/preview-affected-sessions', data);
    logResponse('POST', '/teacher-leaves/preview-affected-sessions', response);
    if (response.errCode !== 0) throw new Error(response.message);
    return response.data || [];
  },

  // Lấy danh sách giáo viên thay thế (sau khi duyệt)
  async getAvailableReplacementTeachers(affectedSessionId: number): Promise<AvailableReplacementTeacher[]> {
    logRequest('GET', `/teacher-leaves/affected-sessions/${affectedSessionId}/available-teachers`);
    const response: any = await axios.get(`/teacher-leaves/affected-sessions/${affectedSessionId}/available-teachers`);
    logResponse('GET', `/teacher-leaves/affected-sessions/${affectedSessionId}/available-teachers`, response);
    if (response.errCode === 0) return response.data || [];
    throw new Error(response.message);
  },

  // Lấy danh sách giáo viên thay thế (trước khi duyệt)
  async previewAvailableTeachers(sessionId: number, leaveId: number): Promise<AvailableReplacementTeacher[]> {
    logRequest('GET', '/teacher-leaves/preview-available-teachers', undefined, { sessionId, leaveId });
    const response: any = await axios.get('/teacher-leaves/preview-available-teachers', {
      params: { sessionId, leaveId }
    });
    logResponse('GET', '/teacher-leaves/preview-available-teachers', response);
    if (response.errCode === 0) return response.data || [];
    throw new Error(response.message);
  },

  // 👉 THÊM MỚI: Xem trước kế hoạch thay thế
  async previewReplacementPlan(data: PreviewReplacementPlanRequest): Promise<PreviewAffectedSessionResponse[]> {
    logRequest('POST', '/teacher-leaves/preview-replacement-plan', undefined, data);
    const response: any = await axios.post('/teacher-leaves/preview-replacement-plan', data);
    logResponse('POST', '/teacher-leaves/preview-replacement-plan', response);
    if (response.errCode === 0) return response.data || [];
    throw new Error(response.message);
  },

  // 👉 THÊM MỚI: Hủy affected session
  async cancelAffectedSession(affectedSessionId: number): Promise<ApiResponse> {
    logRequest('PUT', `/teacher-leaves/affected-sessions/${affectedSessionId}/cancel`);
    console.log('Calling cancelAffectedSession with id:', affectedSessionId);
    try {
      const response: any = await axios.put(`/teacher-leaves/affected-sessions/${affectedSessionId}/cancel`);
      logResponse('PUT', `/teacher-leaves/affected-sessions/${affectedSessionId}/cancel`, response); // ✅ Sửa
      console.log('Cancel response:', response);
      return response;
    } catch (error: any) {
      console.error('Cancel session error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  // ✅ Assign teacher to session (chuyển từ PENDING → ASSIGNED)
  async assignTeacherToSession(affectedSessionId: number, replacementTeacherId: number): Promise<ApiResponse> {
    logRequest('PUT', `/teacher-leaves/affected-sessions/${affectedSessionId}/assign`, undefined, {
      replacementTeacherId
    });
    const response: any = await axios.put(`/teacher-leaves/affected-sessions/${affectedSessionId}/assign`, {
      replacementTeacherId
    });
    logResponse('PUT', `/teacher-leaves/affected-sessions/${affectedSessionId}/assign`, response);
    return response;
  },

  // ✅ Resend invitation to teacher (khi DECLINED, admin muốn gửi lại cho cùng GV)
  async resendInvitation(affectedSessionId: number): Promise<ApiResponse> {
    logRequest('POST', `/teacher-leaves/affected-sessions/${affectedSessionId}/resend`);
    const response: any = await axios.post(`/teacher-leaves/affected-sessions/${affectedSessionId}/resend`);
    return response;
  },

  async getSessionHistory(affectedSessionId: number): Promise<any[]> {
    logRequest('GET', `/teacher-leaves/affected-sessions/${affectedSessionId}/history`);
    const response: any = await axios.get(`/teacher-leaves/affected-sessions/${affectedSessionId}/history`);
    return response.data || [];
  },
};