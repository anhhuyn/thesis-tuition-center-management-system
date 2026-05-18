import axios from '../axios'
import type { SubjectStatistics, SubjectResponse, SubjectStatisticsLevel, CreateSubjectRequest, Subject, UpdateSubjectRequest, TeacherSubjectResponse } from '../types/subject'

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

  getSubjectTypes(): Promise<{
    id: number
    name: string
    academicLevel: {
      id: number
      name: string
    }
  }[]> {
    return axios.get('/subjects/types')
  },

  getStatisticsLevel(): Promise<SubjectStatisticsLevel[]> {
    return axios.get('/subjects/statistics/level')
  },

  // CREATE SUBJECT
  create(data: CreateSubjectRequest): Promise<{
    success: boolean
    message: string
    data: Subject
  }> {
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('grade', data.grade)

    if (data.price !== undefined) {
      formData.append('price', String(data.price))
    }

    if (data.status) {
      formData.append('status', data.status)
    }

    if (data.maxStudents) {
      formData.append('maxStudents', data.maxStudents)
    }

    if (data.sessionsPerWeek) {
      formData.append('sessionsPerWeek', data.sessionsPerWeek)
    }

    if (data.note) {
      formData.append('note', data.note)
    }

    if (data.teacherId) {
      formData.append('teacherId', String(data.teacherId))
    }

    if (data.subjectTypeId) {
      formData.append('subjectTypeId', String(data.subjectTypeId))
    }

    if (data.image) {
      formData.append('image', data.image)
    }
    else if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl)
    }

    return axios.post('/subjects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getById(id: number): Promise<{
    success: boolean
    data: Subject
  }> {
    return axios.get(`/subjects/${id}`)
  },

  update(
    id: number,
    data: UpdateSubjectRequest
  ): Promise<{
    success: boolean
    message: string
    code?: string
  }> {
    return axios.put(`/subjects/${id}`, data)
  },

  getSubjectsByTeacher(
  userId: number,
  page = 1,
  limit = 12,
  status?: string
): Promise<TeacherSubjectResponse> {
  return axios.get(`/subjects/teacher/${userId}`, {
    params: { page, limit, status }
  });
}
}