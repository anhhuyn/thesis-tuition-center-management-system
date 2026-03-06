import axios from '../axios'
import type { SubjectStatistics, SubjectResponse } from '../types/subject'

export const subjectApi = {
  getStatistics(): Promise<SubjectStatistics> {
    return axios.get('/subjects/statistics')
  },
   getAll(
    page = 1,
    limit = 12,
    status?: string
  ): Promise<SubjectResponse> {
    return axios.get('/subjects', {
      params: { page, limit, status }
    })
  },
}