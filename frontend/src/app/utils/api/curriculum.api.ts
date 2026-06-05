// src/services/curriculumApi.ts
import axios from '../axios';
import type {
  CurriculumRequest,
  CurriculumResponse,
  CurriculumDetailResponse,
  SessionDetailRequest,
  SessionDetailResponse,
  SessionActualContentRequest,
  SessionContentResponse
} from '../types/curriculum';

export const curriculumApi = {
  // ============ Curriculum APIs ============
  
  /**
   * Lấy danh sách tất cả lộ trình (có thể lọc theo subjectId)
   * @param subjectId - ID môn học (optional)
   */
  getAllCurriculums(subjectId?: number): Promise<CurriculumResponse[]> {
    const url = subjectId 
      ? `/curriculums?subjectId=${subjectId}`
      : '/curriculums';
    return axios.get(url);
  },

  /**
   * Lấy chi tiết lộ trình theo ID (kèm danh sách session details)
   * @param id - Curriculum ID
   */
  getCurriculumById(id: number): Promise<CurriculumDetailResponse> {
    return axios.get(`/curriculums/${id}`);
  },

  /**
   * Tạo lộ trình mới cho môn học
   * @param subjectId - ID môn học
   * @param data - Dữ liệu lộ trình
   */
  createCurriculum(subjectId: number, data: CurriculumRequest): Promise<CurriculumResponse> {
    return axios.post(`/curriculums/subjects/${subjectId}`, data);
  },

  /**
   * Cập nhật lộ trình
   * @param id - Curriculum ID
   * @param data - Dữ liệu cập nhật
   */
  updateCurriculum(id: number, data: CurriculumRequest): Promise<CurriculumResponse> {
    return axios.put(`/curriculums/${id}`, data);
  },

  /**
   * Xóa lộ trình
   * @param id - Curriculum ID
   */
  deleteCurriculum(id: number): Promise<void> {
    return axios.delete(`/curriculums/${id}`);
  },

  /**
   * Cập nhật trạng thái lộ trình
   * @param id - Curriculum ID
   * @param status - Trạng thái (active, archived, draft)
   */
  updateCurriculumStatus(id: number, status: string): Promise<void> {
    return axios.patch(`/curriculums/${id}/status?status=${status}`);
  },

  /**
   * Lấy danh sách lộ trình theo môn học
   * @param subjectId - ID môn học
   */
  getCurriculumsBySubject(subjectId: number): Promise<CurriculumResponse[]> {
    return axios.get(`/curriculums/subjects/${subjectId}`);
  },

  // ============ SessionDetail APIs ============

  /**
   * Lấy danh sách session details theo lộ trình
   * @param curriculumId - Curriculum ID
   */
  getSessionDetailsByCurriculum(curriculumId: number): Promise<SessionDetailResponse[]> {
    return axios.get(`/session-details/curriculums/${curriculumId}`);
  },

  /**
   * Lấy chi tiết session detail theo ID
   * @param id - SessionDetail ID
   */
  getSessionDetailById(id: number): Promise<SessionDetailResponse> {
    return axios.get(`/session-details/${id}`);
  },

  /**
   * Tạo mới session detail
   * @param curriculumId - Curriculum ID
   * @param data - Dữ liệu session detail
   */
  createSessionDetail(curriculumId: number, data: SessionDetailRequest): Promise<SessionDetailResponse> {
    return axios.post(`/session-details/curriculums/${curriculumId}`, data);
  },

  /**
   * Cập nhật session detail
   * @param id - SessionDetail ID
   * @param data - Dữ liệu cập nhật
   */
  updateSessionDetail(id: number, data: SessionDetailRequest): Promise<SessionDetailResponse> {
    return axios.put(`/session-details/${id}`, data);
  },

  /**
   * Xóa session detail
   * @param id - SessionDetail ID
   */
  deleteSessionDetail(id: number): Promise<void> {
    return axios.delete(`/session-details/${id}`);
  },

  /**
   * Tạo hàng loạt session details
   * @param curriculumId - Curriculum ID
   * @param data - Danh sách session details
   */
  createBatchSessionDetails(curriculumId: number, data: SessionDetailRequest[]): Promise<SessionDetailResponse[]> {
    return axios.post(`/session-details/curriculums/${curriculumId}/batch`, data);
  },

  /**
   * Sao chép session details từ lộ trình khác
   * @param targetCurriculumId - Lộ trình đích
   * @param sourceCurriculumId - Lộ trình nguồn
   * @param overrideExisting - Có ghi đè không
   */
  copySessionDetails(
    targetCurriculumId: number, 
    sourceCurriculumId: number, 
    overrideExisting: boolean = false
  ): Promise<SessionDetailResponse[]> {
    return axios.post(
      `/session-details/curriculums/${targetCurriculumId}/copy-from/${sourceCurriculumId}?overrideExisting=${overrideExisting}`
    );
  },

  /**
   * Sắp xếp lại thứ tự các buổi học
   * @param curriculumId - Curriculum ID
   * @param sessionDetailIdsInOrder - Danh sách ID theo thứ tự mới
   */
  reorderSessionDetails(curriculumId: number, sessionDetailIdsInOrder: number[]): Promise<void> {
    return axios.patch(`/session-details/reorder?curriculumId=${curriculumId}`, sessionDetailIdsInOrder);
  },

  // ============ Session Content APIs ============

  /**
   * Cập nhật nội dung thực tế của buổi học
   * @param sessionId - Session ID
   * @param data - Dữ liệu cập nhật
   */
  updateActualContent(sessionId: number, data: SessionActualContentRequest): Promise<void> {
    return axios.patch(`/session/${sessionId}/actual-content`, data);
  },

  /**
   * Lấy nội dung buổi học (kết hợp kế hoạch và thực tế)
   * @param sessionId - Session ID
   */
  getSessionContent(sessionId: number): Promise<SessionContentResponse> {
    return axios.get(`/session/${sessionId}/content`);
  }
};