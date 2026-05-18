import axios from "../axios"
import type { ApiResponse } from "../types/api"
import type { AttendanceResponse, AttendanceToday, UpdateAttendanceNotePayload, UpdateAttendanceStatusPayload } from "../types/attendance"

export const attendanceApi = {
  getBySubjectAndDate(
    subjectId: number,
    date: string
  ): Promise<ApiResponse<AttendanceToday>> {
    return axios.get(`/subjects/${subjectId}/attendance`, {
      params: { date },
    })
  },

  getBySubject(
    subjectId: number
  ): Promise<ApiResponse<AttendanceResponse>> {
    return axios.get(`/subject/${subjectId}/attendance`)
  },

  updateStatus(
    payload: UpdateAttendanceStatusPayload
  ): Promise<ApiResponse<string>> {
    return axios.put(`/attendance/status`, payload)
  },

  // =========================
  // PUT - Update Note
  // =========================
  updateNote(
    payload: UpdateAttendanceNotePayload
  ): Promise<ApiResponse<string>> {
    return axios.put(`/attendance/note`, payload)
  },
}