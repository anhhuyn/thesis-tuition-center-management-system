import axios from "../axios"
import type { ApiResponse } from "../types/api"
import type {
  TeacherAttendanceResponse,
  UpdateTeacherStatusPayload,
  UpdateTeacherNotePayload
} from "../types/teacher-attendance"

export const teacherAttendanceApi = {

  // GET: lấy danh sách teacher + attendance
  getBySubject(
    subjectId: number
  ): Promise<ApiResponse<TeacherAttendanceResponse>> {
    return axios.get(`/teacher-attendance/subject/${subjectId}/teacher-attendance`)
  },

  // PUT: update status
  updateStatus(
    payload: UpdateTeacherStatusPayload
  ): Promise<ApiResponse<string>> {
    return axios.put(`/teacher-attendance/teacher-attendance/status`, payload)
  },

  // PUT: update note
  updateNote(
    payload: UpdateTeacherNotePayload
  ): Promise<ApiResponse<string>> {
    return axios.put(`/teacher-attendance/teacher-attendance/note`, payload)
  },
}