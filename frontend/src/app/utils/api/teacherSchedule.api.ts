import axios from '../axios'
import type { TeacherSchedule, GetTeacherScheduleParams } from '../types/teacherSchedule'

export const teacherScheduleApi = {
  /**
   * Lấy lịch dạy của giáo viên trong khoảng thời gian
   * @param teacherId - ID của giáo viên
   * @param params - Tham số startDate và endDate
   * @returns Promise<TeacherSchedule[]> - Danh sách các buổi học
   */
  getSchedule(
    teacherId: number,
    params: GetTeacherScheduleParams
  ): Promise<TeacherSchedule[]> {
    return axios.get(`/teachers/${teacherId}/schedule`, {
      params
    })
  }
}