import axios from '../axios'
import type { DailySession, SessionDetail, SessionOfSubject, SessionOfTeacher, SubjectScheduleResponse, UpcomingSession } from '../types/session'

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
  }
}