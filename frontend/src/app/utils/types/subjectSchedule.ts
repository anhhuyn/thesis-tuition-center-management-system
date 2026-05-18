export interface SubjectSchedule {
  id: number
  subjectId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  roomId: number | null
  startDate: string
  endDate: string | null
}

export interface Session {
  id: number
  sessionDate: string
  startTime: string
  endTime: string
  roomId: number | null
  status: string
}

export interface CreateSubjectScheduleRequest {
  subjectId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  roomId: number | null
  startDate: string
  endDate?: string | null
}

export interface CreateSubjectScheduleResponse {
  message: string
  schedule: SubjectSchedule
  sessions: Session[]
}