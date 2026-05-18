import axios from '../axios'
import type {
  CreateSubjectScheduleRequest,
  CreateSubjectScheduleResponse
} from '../types/subjectSchedule'

export const subjectScheduleApi = {
  create(
    data: CreateSubjectScheduleRequest
  ): Promise<CreateSubjectScheduleResponse> {
    return axios.post('/subject-schedules', data)
  }
}