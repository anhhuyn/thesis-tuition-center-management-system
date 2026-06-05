import axios from '../axios'
import type { DailySession, SessionActualContentUpdate, SessionContent, SessionDetail, SessionOfSubject, SessionOfTeacher, SubjectScheduleResponse, UpcomingSession } from '../types/session'

export const sessionApi = {
  getUpcomingSessions(): Promise<UpcomingSession[]> {
    return axios.get('/session/upcoming')
  },

  getTeacherSchedule(
    teacherId: number,
    startDate: string,
    endDate: string
  ): Promise<SessionOfTeacher[]> {
    return axios.get(`/teachers/${teacherId}/schedule?startDate=${startDate}&endDate=${endDate}`)
  },

  getScheduleBySubject(subjectId: number): Promise<SubjectScheduleResponse> {
    return axios.get(`/schedule/${subjectId}`)
  },

  getSessionsByDate(date: string): Promise<DailySession[]> {
    return axios.get(`/session/daily?date=${date}`)
  },

   getSessionDetail(sessionId: number): Promise<SessionDetail> {
    return axios.get(`/session/${sessionId}/detail`)
  },

    /**
   * Cập nhật nội dung thực tế của buổi học
   * @param sessionId - ID buổi học
   * @param data - Dữ liệu cập nhật
   */
  updateActualContent(sessionId: number, data: SessionActualContentUpdate): Promise<void> {
    return axios.patch(`/session/${sessionId}/actual-content`, data);
  },

  /**
   * Lấy nội dung buổi học (kết hợp kế hoạch + thực tế)
   * @param sessionId - ID buổi học
   */
  getSessionContent(sessionId: number): Promise<SessionContent> {
    return axios.get(`/session/${sessionId}/content`);
  }
}