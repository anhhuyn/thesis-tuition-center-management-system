import axios from "../axios"
import type { ApiResponse } from "../types/api"
import type { AddStudentToSubjectRequest, StudentSubject, StudentSubjectResponse } from "../types/studentSubject"

export const studentSubjectApi = {
  getStudentBySubject(subjectId: number): Promise<ApiResponse<StudentSubject[]>> {
    return axios.get(`/subject-students/${subjectId}`)
  },
  // lấy theo khối
  getStudentsByGrade(grade: string): Promise<ApiResponse<StudentSubject[]>> {
    return axios.get(`/students/by-grade/${grade}`)
  },

  // thêm học sinh vào môn
  addStudentToSubject(
    payload: AddStudentToSubjectRequest
  ): Promise<ApiResponse<StudentSubjectResponse>> {
    return axios.post(`/subject-students`, payload)
  },
  removeStudentFromSubject(
    payload: AddStudentToSubjectRequest
  ): Promise<ApiResponse<null>> {
    return axios.delete(`/subject-students`, { data: payload })
  }
}